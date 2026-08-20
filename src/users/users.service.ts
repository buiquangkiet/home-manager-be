import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultUsers();
  }

  private async seedDefaultUsers() {
    try {
      const count = await this.userRepository.count();
      if (count === 0) {
        const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
        const userPasswordHash = await bcrypt.hash('User@123', 10);

        const defaultUsers: Partial<User>[] = [
          {
            email: 'admin@homemanager.com',
            password: adminPasswordHash,
            name: 'Quản trị viên (Admin P.802)',
            role: 'ADMIN',
            room: 'P.802',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          },
          {
            email: 'kiet@homemanager.com',
            password: userPasswordHash,
            name: 'Nguyễn Văn A',
            role: 'USER',
            room: 'P.802',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          },
          {
            email: 'member@homemanager.com',
            password: userPasswordHash,
            name: 'Trần Thị B',
            role: 'USER',
            room: 'P.802',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          },
        ];

        for (const u of defaultUsers) {
          const userEntity = this.userRepository.create(u);
          await this.userRepository.save(userEntity);
        }
        console.log('TypeORM PostgreSQL: Seeded default users');
      }
    } catch (err: any) {
      console.warn('TypeORM Users seeding warning:', err.message);
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    return users.map(({ password, ...u }) => u as Omit<User, 'password'>);
  }

  async findByRoom(room: string): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find({
      where: { room },
    });
    return users.map(({ password, ...u }) => u as Omit<User, 'password'>);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) {
      throw new Error('Email đã được đăng ký');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      email: createUserDto.email.toLowerCase(),
      password: hashedPassword,
      name: createUserDto.name,
      role: createUserDto.role || 'USER',
      room: createUserDto.room,
    });

    return this.userRepository.save(newUser);
  }

  async updateRole(id: string, role: UserRole): Promise<Omit<User, 'password'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    user.role = role;
    const saved = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = saved;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  async countByRoom(room: string): Promise<number> {
    try {
      const count = await this.userRepository.count({ where: { room } });
      return count > 0 ? count : 1;
    } catch {
      return 1;
    }
  }
}
