import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type ExpenseCategory = 'utility' | 'service' | 'parking' | 'maintenance' | 'other';
export type ExpenseStatus = 'paid' | 'pending';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'varchar', default: 'utility' })
  category: ExpenseCategory;

  @Column({ type: 'double precision', default: 0 })
  amount: number;

  @Column()
  date: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: ExpenseStatus;

  @Column({ default: 'Chưa gán' })
  paidBy: string;

  @Column({ default: 'P.802' })
  room: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  creatorId?: string;

  @ManyToOne(() => User, (user) => user.expenses, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creatorId' })
  creator?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
