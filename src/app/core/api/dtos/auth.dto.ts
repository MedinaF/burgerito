export interface UserDto {
  _id: string;
  name: string;
  email: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserDto;
}

export interface MeResponseDto {
  user: UserDto;
}
