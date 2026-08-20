import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/home_manager',
      autoLoadEntities: true,
      synchronize: true, // Tự động tạo và đồng bộ bảng trong PostgreSQL
      logging: false, // Ẩn các dòng log query SQL
      ssl: process.env.DATABASE_URL?.includes('supabase') || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    }),
    UsersModule,
    AuthModule,
    ExpensesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
