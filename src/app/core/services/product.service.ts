import { Injectable, Signal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map, of, shareReplay, tap } from 'rxjs';

import { ProductDto } from '../api/dtos/product.dto';
import { mapProductDto } from '../api/mappers/product.mapper';
import { Product } from '../models/product.model';

interface ProductsResponseDto {
  items: ProductDto[];
}

const PRODUCTS_ENDPOINT = '/api/products.json';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly productsSignal = signal<Product[] | null>(null);
  private requestInFlight?: ReturnType<typeof this.fetchProducts>;

  readonly products: Signal<Product[] | null> = this.productsSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  getProducts() {
    const cachedProducts = this.productsSignal();
    if (cachedProducts) {
      return of(cachedProducts);
    }

    if (!this.requestInFlight) {
      this.requestInFlight = this.fetchProducts();
    }

    return this.requestInFlight;
  }

  getProductById(id: string) {
    const cachedProduct = this.productsSignal()?.find((product) => product.id === id);
    if (cachedProduct) {
      return of(cachedProduct);
    }

    return this.getProducts().pipe(
      map((products) => {
        const product = products.find((item) => item.id === id);

        if (!product) {
          throw new Error(`Produit introuvable: ${id}`);
        }

        return this.persistProduct(product);
      })
    );
  }

  private fetchProducts() {
    return this.http.get<ProductsResponseDto>(PRODUCTS_ENDPOINT).pipe(
      map((response) => response.items.map(mapProductDto)),
      tap((products) => this.productsSignal.set(products)),
      finalize(() => {
        this.requestInFlight = undefined;
      }),
      shareReplay(1)
    );
  }

  private persistProduct(product: Product) {
    const currentProducts = this.productsSignal() ?? [];
    const updatedProducts = [...currentProducts.filter((item) => item.id !== product.id), product];
    this.productsSignal.set(updatedProducts);
    return product;
  }
}
