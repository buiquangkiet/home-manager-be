import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new BadRequestException('Email này đã được sử dụng. Vui lòng chọn email khác.');
    }

    const user = await this.usersService.create(registerDto);
    const accessToken = this.generateToken(user);

    const { password, ...safeUser } = user;
    return {
      message: 'Đăng ký tài khoản thành công',
      user: safeUser,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const accessToken = this.generateToken(user);
    const { password, ...safeUser } = user;

    return {
      message: 'Đăng nhập thành công',
      user: safeUser,
      accessToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  private generateToken(user: { id: string; email: string; role: any; room: string }): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      room: user.room,
    };
    return this.jwtService.sign(payload);
  }
}
