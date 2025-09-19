import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { Product } from '../../core/models/product.model';

interface CartViewItem {
  id: string;
  product: Product | null;
  index: number;
  unavailable: boolean;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, PricePipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);

  readonly cartItems = computed<CartViewItem[]>(() => {
    const products = this.productService.products() ?? [];
    return this.cartService.items().map((productId, index) => {
      const product = products.find((item) => item.id === productId) ?? null;
      const unavailable = !product || !product.isAvailable;
      return {
        id: `${productId}-${index}`,
        product,
        index,
        unavailable
      };
    });
  });

  readonly total = computed(() =>
    this.cartItems()
      .filter((item) => item.product && !item.unavailable)
      .reduce((sum, item) => sum + (item.product?.price ?? 0), 0)
  );

  ngOnInit() {
    this.productService.getProducts().subscribe();
  }

  removeItem(index: number) {
    this.cartService.removeByIndex(index);
    if (this.cartService.items().length === 0) {
      this.info.set('Votre panier est vide.');
    } else {
      this.clearMessages();
    }
  }

  clearMessages() {
    this.error.set(null);
    this.info.set(null);
  }

  submitOrder() {
    this.clearMessages();

    const items = this.cartService.items();

    if (items.length === 0) {
      this.info.set('Votre panier est vide.');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.error.set('Connectez-vous pour finaliser votre commande.');
      void this.router.navigate(['/login'], { queryParams: { redirectTo: '/cart' } });
      return;
    }

    const unavailableItems = this.cartItems().filter((item) => item.unavailable);
    if (unavailableItems.length > 0) {
      this.error.set("Certains burgers ne sont plus disponibles. Retirez-les avant de commander.");
      return;
    }

    this.isSubmitting.set(true);
    this.orderService.createOrder(items).subscribe({
      next: (order) => {
        this.cartService.clear();
        this.isSubmitting.set(false);
        void this.router.navigate(['/order-confirmation'], {
          state: { orderId: order.id, total: order.total, status: 'registered' }
        });
      },
      error: (response) => {
        this.isSubmitting.set(false);
        if (response.status === 401) {
          this.error.set('Votre session a expiré. Connectez-vous pour finaliser votre commande.');
          void this.router.navigate(['/login'], { queryParams: { redirectTo: '/cart' } });
        } else if (response.status === 400) {
          const message = response.error?.message ??
            "Commande refusée : vérifiez votre panier (produit indisponible ou données invalides).";
          this.error.set(message);
        } else {
          this.error.set('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    });
  }
}
