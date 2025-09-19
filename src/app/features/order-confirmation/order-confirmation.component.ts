import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PricePipe } from '../../shared/pipes/price.pipe';

type OrderStatus = 'cooking' | 'ready' | 'delivered' | 'registered';

interface ConfirmationState {
  orderId?: string;
  total?: number;
  status?: OrderStatus;
}

interface StatusViewModel {
  icon: string;
  title: string;
  message?: string;
}

const ORDER_STATUS_CONTENT: Record<OrderStatus, StatusViewModel> = {
  cooking: {
    icon: '🔥',
    title: 'Votre commande est en cuisson',
    message: 'Nos équipes préparent votre burger avec le plus grand soin.'
  },
  ready: {
    icon: '🚚',
    title: 'Votre commande est prête pour être livrée',
    message: 'Un livreur récupère votre commande et se met en route.'
  },
  delivered: {
    icon: '✅',
    title: 'Votre commande a été livrée !',
    message: 'Bon appétit et merci pour votre fidélité.'
  },
  registered: {
    icon: '✅',
    title: 'Votre commande a bien été enregistrée. Merci !',
    message: 'Nous vous tiendrons informé de son avancée très prochainement.'
  }
};

const DEFAULT_STATUS: OrderStatus = 'registered';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, PricePipe],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderConfirmationComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly state: ConfirmationState;
  readonly status: OrderStatus;
  readonly view: StatusViewModel;

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const navState = (navigation?.extras.state as ConfirmationState | undefined) ?? {};
    const browserState = (window.history.state as ConfirmationState | undefined) ?? {};

    const statusFromState = this.normalizeStatus(navState.status ?? browserState.status);
    const statusFromQuery = this.normalizeStatus(this.route.snapshot.queryParamMap.get('status'));
    this.status = statusFromQuery ?? statusFromState ?? DEFAULT_STATUS;

    this.state = { ...browserState, ...navState, status: this.status };
    this.view = ORDER_STATUS_CONTENT[this.status];
  }

  private normalizeStatus(status: unknown): OrderStatus | null {
    if (typeof status !== 'string') {
      return null;
    }

    switch (status.toLowerCase()) {
      case 'cooking':
      case 'en-cuisson':
        return 'cooking';
      case 'ready':
      case 'preparation-terminee':
      case 'préparation-terminée':
        return 'ready';
      case 'delivered':
      case 'livree':
      case 'livrée':
        return 'delivered';
      case 'registered':
      case 'enregistree':
      case 'enregistrée':
        return 'registered';
      default:
        return null;
    }
  }
}
