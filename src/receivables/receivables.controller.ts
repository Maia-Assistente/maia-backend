// src/receivables/receivables.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  NotFoundException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { ReceivablesService } from './receivables.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  UserPayload
} from '../auth/decorators/current-user.decorator';

@Controller('receivables')
@UseGuards(JwtAuthGuard)
@ApiTags('Receivables')
@ApiBearerAuth('JWT-auth')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova conta a receber' })
  @ApiBody({ type: CreateReceivableDto })
  @ApiResponse({
    status: 201,
    description: 'Conta a receber criada com sucesso'
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos' })
  @ApiResponse({ status: 401, description: 'Token de autenticação inválido' })
  create(
    @CurrentUser() user: UserPayload,
    @Body() createReceivableDto: CreateReceivableDto
  ) {
    return this.receivablesService.create(user.sub, createReceivableDto);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.receivablesService.findByUserId(user.sub);
  }

  @Get('category/:category')
  async findByCategory(
    @CurrentUser() user: UserPayload,
    @Param('category') category: string
  ) {
    return this.receivablesService.findByUserIdAndCategory(user.sub, category);
  }

  @Get('paid-status/:status')
  async findByPaidStatus(
    @CurrentUser() user: UserPayload,
    @Param('status') paid_status: string
  ) {
    return this.receivablesService.findByUserIdAndPaidStatus(
      user.sub,
      paid_status
    );
  }

  @Get('date-range')
  async findByDateRange(
    @CurrentUser() user: UserPayload,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string
  ) {
    if (!start_date || !end_date) {
      throw new NotFoundException('start_date and end_date are required');
    }
    return this.receivablesService.findByUserIdAndDateRange(
      user.sub,
      start_date,
      end_date
    );
  }

  @Get('year-month')
  async findByYearMonth(
    @CurrentUser() user: UserPayload,
    @Query('year') year: string,
    @Query('month') month: string
  ) {
    if (!year || !month) {
      throw new NotFoundException('year and month are required');
    }
    return this.receivablesService.findByUserIdAndYearMonth(
      user.sub,
      year,
      month
    );
  }

  @Get('total')
  async getTotalAmount(@CurrentUser() user: UserPayload) {
    const total = await this.receivablesService.getTotalAmountByUserId(
      user.sub
    );
    return { total };
  }

  @Get('total/paid-status/:status')
  async getTotalAmountByPaidStatus(
    @CurrentUser() user: UserPayload,
    @Param('status') paid_status: string
  ) {
    const total =
      await this.receivablesService.getTotalAmountByUserIdAndPaidStatus(
        user.sub,
        paid_status
      );
    return { total };
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.receivablesService.findOne(user.sub, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateReceivableDto: UpdateReceivableDto
  ) {
    return this.receivablesService.update(user.sub, id, updateReceivableDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.receivablesService.remove(user.sub, id);
  }
}
