import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { PricePipe } from '../../shared/pipes/price.pipe';

interface GroupedOrders {
  date: string;
  orders: Order[];
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long'
});

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, PricePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;
  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly groupedOrders = computed<GroupedOrders[]>(() => {
    const map = new Map<string, Order[]>();

    const sortedOrders = [...this.orders()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (const order of sortedOrders) {
      const key = dateFormatter.format(new Date(order.createdAt));
      const existing = map.get(key) ?? [];
      existing.push(order);
      map.set(key, existing);
    }

    return Array.from(map.entries())
      .map(([date, orders]) => ({ date, orders }))
      .sort((a, b) => new Date(b.orders[0].createdAt).getTime() - new Date(a.orders[0].createdAt).getTime());
  });

  ngOnInit() {
    this.fetchOrders();
  }

  private fetchOrders() {
    this.isLoading.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.error.set(null);
      },
      error: (response) => {
        if (response.status === 401) {
          this.error.set('Votre session a expiré. Connectez-vous à nouveau.');
        } else {
          this.error.set('Impossible de charger vos commandes pour le moment.');
        }
      },
      complete: () => this.isLoading.set(false)
    });
  }

  orderTotal(order: Order) {
    if (order.total) {
      return order.total;
    }

    return order.items.reduce((sum, item) => sum + item.price, 0);
  }
}
