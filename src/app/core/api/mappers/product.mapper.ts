import { Product } from '../../models/product.model';
import { ProductDto } from '../dtos/product.dto';

export const mapProductDto = (dto: ProductDto): Product => ({
  id: dto._id,
  name: dto.name,
  description: dto.description,
  image: dto.image,
  price: dto.price,
  isAvailable: dto.isAvailable
});
