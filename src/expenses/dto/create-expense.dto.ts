import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import type { ExpenseCategory } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên khoản chi không được để trống' })
  title: string;

  @IsEnum(['utility', 'service', 'parking', 'maintenance', 'other'], {
    message: 'Danh mục chi phí không hợp lệ',
  })
  category: ExpenseCategory;

  @IsNumber({}, { message: 'Số tiền phải là một số hợp lệ' })
  @Min(1000, { message: 'Số tiền tối thiểu là 1,000 VNĐ' })
  amount: number;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  paidBy?: string;

  @IsString()
  @IsOptional()
  room?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
