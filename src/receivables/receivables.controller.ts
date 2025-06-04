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
import { ReceivablesService } from './receivables.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('receivables')
@UseGuards(JwtAuthGuard)
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Post()
  create(@Body() createReceivableDto: CreateReceivableDto) {
    return this.receivablesService.create(createReceivableDto);
  }

  @Get()
  findAll() {
    return this.receivablesService.findAll();
  }

  @Get('search')
  async findByUserNsAndToken(
    @Query('user_ns') user_ns: string,
    @Query('token_talkbi') token_talkbi: string
  ) {
    if (!user_ns || !token_talkbi) {
      throw new NotFoundException('user_ns and token_talkbi are required');
    }
    return this.receivablesService.findByUserNsAndToken(user_ns, token_talkbi);
  }

  @Get('search/category')
  async findByCategory(
    @Query('user_ns') user_ns: string,
    @Query('token_talkbi') token_talkbi: string,
    @Query('category') category: string
  ) {
    if (!user_ns || !token_talkbi || !category) {
      throw new NotFoundException(
        'user_ns, token_talkbi and category are required'
      );
    }
    return this.receivablesService.findByUserNsTokenAndCategory(
      user_ns,
      token_talkbi,
      category
    );
  }

  @Get('search/paid-status')
  async findByPaidStatus(
    @Query('user_ns') user_ns: string,
    @Query('token_talkbi') token_talkbi: string,
    @Query('paid_status') paid_status: string
  ) {
    if (!user_ns || !token_talkbi || !paid_status) {
      throw new NotFoundException(
        'user_ns, token_talkbi and paid_status are required'
      );
    }
    return this.receivablesService.findByUserNsTokenAndPaidStatus(
      user_ns,
      token_talkbi,
      paid_status
    );
  }

  @Get('search/date-range')
  async findByDateRange(
    @Query('user_ns') user_ns: string,
    @Query('token_talkbi') token_talkbi: string,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string
  ) {
    if (!user_ns || !token_talkbi || !start_date || !end_date) {
      throw new NotFoundException(
        'user_ns, token_talkbi, start_date and end_date are required'
      );
    }
    return this.receivablesService.findByUserNsTokenAndDateRange(
      user_ns,
      token_talkbi,
      start_date,
      end_date
    );
  }

  @Get('search/year-month')
  async findByYearMonth(
    @Query('user_ns') user_ns: string,
    @Query('token_talkbi') token_talkbi: string,
    @Query('year') year: string,
    @Query('month') month: string
  ) {
    if (!user_ns || !token_talkbi || !year || !month) {
      throw new NotFoundException(
        'user_ns, token_talkbi, year and month are required'
      );
    }
    return this.receivablesService.findByUserNsTokenAndYearMonth(
      user_ns,
      token_talkbi,
      year,
      month
    );
  }

  @Get('total')
  async getTotalAmount(
    @Query('user_ns') user_ns: string,
    @Query('token_talkbi') token_talkbi: string
  ) {
    if (!user_ns || !token_talkbi) {
      throw new NotFoundException('user_ns and token_talkbi are required');
    }
    const total = await this.receivablesService.getTotalAmountByUserNsAndToken(
      user_ns,
      token_talkbi
    );
    return { total };
  }

  @Get('total/paid-status')
  async getTotalAmountByPaidStatus(
    @Query('user_ns') user_ns: string,
    @Query('token_talkbi') token_talkbi: string,
    @Query('paid_status') paid_status: string
  ) {
    if (!user_ns || !token_talkbi || !paid_status) {
      throw new NotFoundException(
        'user_ns, token_talkbi and paid_status are required'
      );
    }
    const total =
      await this.receivablesService.getTotalAmountByUserNsTokenAndPaidStatus(
        user_ns,
        token_talkbi,
        paid_status
      );
    return { total };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receivablesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReceivableDto: UpdateReceivableDto
  ) {
    return this.receivablesService.update(id, updateReceivableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receivablesService.remove(id);
  }
}
