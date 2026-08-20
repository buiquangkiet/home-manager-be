import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import type { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Phòng/Căn hộ không được để trống' })
  room: string;

  @IsEnum(['ADMIN', 'USER'], { message: 'Vai trò chỉ có thể là ADMIN hoặc USER' })
  @IsOptional()
  role?: UserRole;
}
