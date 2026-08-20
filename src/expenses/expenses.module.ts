import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Expense]), UsersModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService, TypeOrmModule],
})
export class ExpensesModule {}
