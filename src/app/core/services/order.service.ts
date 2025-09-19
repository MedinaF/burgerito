import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import {
  CreateOrderResponseDto,
  OrderDto,
  OrdersResponseDto
} from '../api/dtos/order.dto';
import { mapOrderDto } from '../api/mappers/order.mapper';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private readonly http: HttpClient) {}

  createOrder(items: string[]) {
    return this.http
      .post<CreateOrderResponseDto>(`${API_BASE_URL}/orders`, { items })
      .pipe(map((response) => mapOrderDto(this.mergeOrderResponse(response))));
  }

  getMyOrders() {
    return this.http
      .get<OrdersResponseDto>(`${API_BASE_URL}/orders/me`)
      .pipe(map((response) => response.items.map(mapOrderDto)));
  }

  private mergeOrderResponse(response: CreateOrderResponseDto): OrderDto {
    return {
      ...response.order,
      items: response.order.items && response.order.items.length > 0 ? response.order.items : response.items
    };
  }
}
