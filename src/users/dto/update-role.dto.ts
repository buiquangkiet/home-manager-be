import { IsEnum } from 'class-validator';
import type { UserRole } from '../entities/user.entity';

export class UpdateRoleDto {
  @IsEnum(['ADMIN', 'USER'], { message: 'Vai trò chỉ có thể là ADMIN hoặc USER' })
  role: UserRole;
}
