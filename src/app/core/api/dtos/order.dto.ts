import { ProductDto } from './product.dto';

export interface OrderItemDto {
  _id: string;
  product: ProductDto | string;
  price: number;
}

export interface OrderDto {
  _id: string;
  createdAt: string;
  total: number;
  items: OrderItemDto[];
}

export interface OrdersResponseDto {
  items: OrderDto[];
}

export interface CreateOrderResponseDto {
  order: OrderDto;
  items: OrderItemDto[];
}
