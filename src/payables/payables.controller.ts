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
import { PayablesService } from './payables.service';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payables')
@UseGuards(JwtAuthGuard)
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @Post()
  create(@Body() createPayableDto: CreatePayableDto) {
    return this.payablesService.create(createPayableDto);
  }

  @Get()
  findAll() {
    return this.payablesService.findAll();
  }

  @Get('search')
  async findByUserNsAndToken(
    @Query('user_ns') user_ns: string,
    @Query('token_talkbi') token_talkbi: string
  ) {
    if (!user_ns || !token_talkbi) {
      throw new NotFoundException('user_ns and token_talkbi are required');
    }
    return this.payablesService.findByUserNsAndToken(user_ns, token_talkbi);
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
    return this.payablesService.findByUserNsTokenAndCategory(
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
    return this.payablesService.findByUserNsTokenAndPaidStatus(
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
    return this.payablesService.findByUserNsTokenAndDateRange(
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
    return this.payablesService.findByUserNsTokenAndYearMonth(
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
    const total = await this.payablesService.getTotalAmountByUserNsAndToken(
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
      await this.payablesService.getTotalAmountByUserNsTokenAndPaidStatus(
        user_ns,
        token_talkbi,
        paid_status
      );
    return { total };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payablesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayableDto: UpdatePayableDto) {
    return this.payablesService.update(id, updatePayableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payablesService.remove(id);
  }
}
