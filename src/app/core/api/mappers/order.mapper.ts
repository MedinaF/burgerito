import { Order, OrderItem } from '../../models/order.model';
import { OrderDto, OrderItemDto } from '../dtos/order.dto';
import { Product } from '../../models/product.model';
import { mapProductDto } from './product.mapper';

const mapOrderItemDto = (dto: OrderItemDto): OrderItem => {
  let product: Product;

  if (typeof dto.product === 'string') {
    product = {
      id: dto.product,
      name: 'Produit inconnu',
      description: '',
      image: '',
      price: dto.price,
      isAvailable: false
    };
  } else {
    product = mapProductDto(dto.product);
  }

  return {
    id: dto._id,
    product,
    price: dto.price
  };
};

export const mapOrderDto = (dto: OrderDto): Order => ({
  id: dto._id,
  createdAt: dto.createdAt,
  total: dto.total,
  items: dto.items?.map(mapOrderItemDto) ?? []
});
