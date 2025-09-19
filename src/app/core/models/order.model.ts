import { Product } from './product.model';

export interface OrderItem {
  id: string;
  product: Product;
  price: number;
}

export interface Order {
  id: string;
  createdAt: string;
  total: number;
  items: OrderItem[];
}
