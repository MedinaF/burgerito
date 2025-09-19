import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PricePipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly product = signal<Product | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly relatedProducts = computed(() => {
    const allProducts = this.productService.products();
    const current = this.product();

    if (!allProducts || !current) {
      return [];
    }

    return allProducts.filter((product) => product.id !== current.id).slice(0, 4);
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.error.set('Burger introuvable.');
        this.isLoading.set(false);
        return;
      }

      this.fetchProduct(id);
      this.loadRelatedProducts();
    });
  }

  addToCart(product: Product) {
    if (!product.isAvailable) {
      this.error.set('Ce burger n\'est pas disponible pour le moment.');
      return;
    }

    this.error.set(null);
    this.cartService.add(product.id);
  }

  private fetchProduct(id: string) {
    this.isLoading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.error.set(null);
      },
      error: (response) => {
        if (response.status === 404) {
          this.error.set('Ce burger n\'existe pas ou n\'est plus disponible.');
        } else {
          this.error.set('Impossible de récupérer ce burger. Veuillez réessayer plus tard.');
        }
      },
      complete: () => this.isLoading.set(false)
    });
  }

  private loadRelatedProducts() {
    if (this.productService.products()) {
      return;
    }

    this.productService.getProducts().subscribe();
  }
}
