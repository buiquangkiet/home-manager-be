import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ExpensesService implements OnModuleInit {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultExpenses();
  }

  private async seedDefaultExpenses() {
    try {
      const count = await this.expenseRepository.count();
      if (count === 0) {
        const defaultExpenses: Partial<Expense>[] = [
          {
            title: 'Tiền điện tháng 8',
            category: 'utility',
            amount: 1250000,
            date: '2026-08-15',
            status: 'paid',
            paidBy: 'Nguyễn Văn A',
            room: 'P.802',
          },
          {
            title: 'Phí dịch vụ & quản lý tòa nhà',
            category: 'service',
            amount: 680000,
            date: '2026-08-10',
            status: 'paid',
            paidBy: 'Trần Thị B',
            room: 'P.802',
          },
          {
            title: 'Tiền nước sinh hoạt',
            category: 'utility',
            amount: 210000,
            date: '2026-08-18',
            status: 'pending',
            paidBy: 'Chưa thanh toán',
            room: 'P.802',
          },
          {
            title: 'Phí gửi 2 xe máy tháng 8',
            category: 'parking',
            amount: 240000,
            date: '2026-08-05',
            status: 'paid',
            paidBy: 'Quản trị viên (Admin P.802)',
            room: 'P.802',
          },
          {
            title: 'Bảo dưỡng điều hòa phòng khách',
            category: 'maintenance',
            amount: 450000,
            date: '2026-08-19',
            status: 'pending',
            paidBy: 'Chưa thanh toán',
            room: 'P.802',
          },
        ];

        for (const e of defaultExpenses) {
          const expenseEntity = this.expenseRepository.create(e);
          await this.expenseRepository.save(expenseEntity);
        }
        console.log('TypeORM PostgreSQL: Seeded default expenses');
      }
    } catch (err: any) {
      console.warn('TypeORM Expenses seeding warning:', err.message);
    }
  }

  async findAll(room?: string, category?: string, status?: string): Promise<Expense[]> {
    const queryBuilder = this.expenseRepository.createQueryBuilder('expense');

    if (room) {
      queryBuilder.andWhere('LOWER(expense.room) = LOWER(:room)', { room });
    }
    if (category && category !== 'all') {
      queryBuilder.andWhere('expense.category = :category', { category });
    }
    if (status && status !== 'all') {
      queryBuilder.andWhere('expense.status = :status', { status });
    }

    queryBuilder.orderBy('expense.date', 'DESC');
    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Không tìm thấy khoản chi');
    }
    return expense;
  }

  async create(dto: CreateExpenseDto, user: { id: string; name: string; room: string }): Promise<Expense> {
    const newExpense = this.expenseRepository.create({
      title: dto.title,
      category: dto.category,
      amount: Number(dto.amount),
      date: dto.date || new Date().toISOString().split('T')[0],
      status: 'pending',
      paidBy: dto.paidBy || user.name || 'Chưa gán',
      room: dto.room || user.room || 'P.802',
      notes: dto.notes,
      creatorId: user.id,
    });

    return this.expenseRepository.save(newExpense);
  }

  async toggleStatus(id: string): Promise<Expense> {
    const expense = await this.findById(id);
    expense.status = expense.status === 'paid' ? 'pending' : 'paid';
    return this.expenseRepository.save(expense);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const expense = await this.findById(id);
    await this.expenseRepository.remove(expense);
    return { success: true, message: 'Đã xóa khoản chi thành công' };
  }

  async getSummary(room: string = 'P.802') {
    const expenses = await this.findAll(room);
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const paidTotal = expenses
      .filter((e) => e.status === 'paid')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const pendingTotal = expenses
      .filter((e) => e.status === 'pending')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const memberCount = await this.usersService.countByRoom(room);
    const perPersonShare = memberCount > 0 ? Math.round(totalSpent / memberCount) : totalSpent;

    return {
      room,
      totalSpent,
      paidTotal,
      pendingTotal,
      expenseCount: expenses.length,
      memberCount,
      perPersonShare,
    };
  }
}
