import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async findAll(
    @CurrentUser('room') userRoom: string,
    @Query('room') room?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    const targetRoom = room || userRoom || 'P.802';
    return this.expensesService.findAll(targetRoom, category, status);
  }

  @Get('summary')
  async getSummary(
    @CurrentUser('room') userRoom: string,
    @Query('room') room?: string,
  ) {
    const targetRoom = room || userRoom || 'P.802';
    return this.expensesService.getSummary(targetRoom);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.expensesService.findById(id);
  }

  @Post()
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUser() user: any,
  ) {
    return this.expensesService.create(createExpenseDto, user);
  }

  @Patch(':id/toggle')
  async toggleStatus(@Param('id') id: string) {
    return this.expensesService.toggleStatus(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id') id: string) {
    return this.expensesService.delete(id);
  }
}
