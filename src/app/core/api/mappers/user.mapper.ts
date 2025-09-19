import { User } from '../../models/user.model';
import { UserDto } from '../dtos/auth.dto';

export const mapUserDto = (dto: UserDto): User => ({
  id: dto._id,
  name: dto.name,
  email: dto.email
});
