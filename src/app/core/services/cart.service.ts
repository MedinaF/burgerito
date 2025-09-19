import { Injectable, Signal, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'burger-shop-cart-items';
  private readonly itemsSignal = signal<string[]>(this.restoreFromStorage());

  readonly items: Signal<string[]> = this.itemsSignal.asReadonly();
  readonly count = computed(() => this.itemsSignal().length);

  add(productId: string) {
    const updated = [...this.itemsSignal(), productId];
    this.persist(updated);
  }

  removeByIndex(index: number) {
    const current = [...this.itemsSignal()];
    current.splice(index, 1);
    this.persist(current);
  }

  clear() {
    this.persist([]);
  }

  private persist(items: string[]) {
    this.itemsSignal.set(items);
    this.writeToStorage(items);
  }

  private restoreFromStorage() {
    if (typeof window === 'undefined') {
      return [];
    }

    const storedValue = window.localStorage.getItem(this.storageKey);
    if (!storedValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(storedValue);
      if (Array.isArray(parsed)) {
        return parsed.filter((value) => typeof value === 'string');
      }
    } catch (error) {
      console.error('Unable to parse cart storage value', error);
    }

    return [];
  }

  private writeToStorage(items: string[]) {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(items));
  }
}
