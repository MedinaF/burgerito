import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, PricePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly feedback = signal<string | null>(null);
  private feedbackTimeout?: ReturnType<typeof setTimeout>;
  readonly highlightProduct = computed<Product | null>(() =>
    this.products().find((product) => product.id === 'bacon-lover') ?? null
  );

  ngOnInit() {
    this.loadProducts();
  }

  addToCart(product: Product) {
    if (!product.isAvailable) {
      this.feedback.set('Ce burger est actuellement indisponible.');
      this.dismissFeedbackLater();
      return;
    }

    this.cartService.add(product.id);
    this.feedback.set(`${product.name} a été ajouté au panier.`);
    this.dismissFeedbackLater();
  }

  trackByProductId(_index: number, product: Product) {
    return product.id;
  }

  private loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.error.set(null);
      },
      error: () => {
        this.error.set("Impossible de récupérer les burgers. Veuillez réessayer plus tard.");
      },
      complete: () => this.isLoading.set(false)
    });
  }

  private dismissFeedbackLater() {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }

    this.feedbackTimeout = setTimeout(() => this.feedback.set(null), 4000);
  }
}
