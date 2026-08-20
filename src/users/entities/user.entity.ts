import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';

export type UserRole = 'ADMIN' | 'USER';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'USER' })
  role: UserRole;

  @Column({ default: 'P.802' })
  room: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToMany(() => Expense, (expense) => expense.creatorId)
  expenses?: Expense[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
