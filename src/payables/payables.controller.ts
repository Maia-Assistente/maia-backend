// src/payables/payables.controller.ts
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
  NotFoundException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  UsePipes,
  ValidationPipe
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
import { PayablesService } from './payables.service';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  UserPayload
} from '../auth/decorators/current-user.decorator';

@Controller('payables')
@UseGuards(JwtAuthGuard)
@ApiTags('Payables')
@ApiBearerAuth('JWT-auth')
export class PayablesController {
  private readonly logger = new Logger(PayablesController.name);

  constructor(private readonly payablesService: PayablesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova conta a pagar' })
  @ApiBody({
    type: CreatePayableDto,
    description: 'Dados para criar uma nova conta a pagar'
  })
  @ApiResponse({
    status: 201,
    description: 'Conta a pagar criada com sucesso',
    schema: {
      example: {
        _id: '675c123456789abcdef01234',
        userId: '675c123456789abcdef01235',
        year: '2025',
        month: '09',
        day: '20',
        hour: '10',
        amount: 340.75,
        description: 'Conta de luz - Setembro',
        invoice_number: 'FAT-2025-002',
        payment_method: 'card',
        is_recurring: false,
        category: 'utilidades',
        paid_status: 'pago',
        due_date: '2025-09-20',
        type: 'conta',
        createdAt: '2025-09-06T18:00:00.000Z',
        updatedAt: '2025-09-06T18:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos'
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido'
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const logger = new Logger('ValidationError');
        logger.error('Validation failed:', JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      }
    })
  )
  async create(
    @CurrentUser() user: UserPayload,
    @Body() createPayableDto: CreatePayableDto
  ) {
    try {
      this.logger.log(`User object: ${JSON.stringify(user)}`);
      this.logger.log(`User ID (user.sub): ${user.sub}`);
      this.logger.log(`Creating payable for user ${user.sub}`);
      this.logger.log(`Received data: ${JSON.stringify(createPayableDto)}`);

      const result = await this.payablesService.create(
        user.sub,
        createPayableDto
      );
      this.logger.log(`Payable created successfully`);

      return result;
    } catch (error) {
      this.logger.error(`Error creating payable: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);

      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }

      throw new InternalServerErrorException('Failed to create payable');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as contas a pagar do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de contas a pagar',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          _id: '675c123456789abcdef01234',
          userId: '675c123456789abcdef01235',
          year: '2025',
          month: '09',
          day: '20',
          hour: '10',
          amount: 340.75,
          description: 'Conta de luz - Setembro',
          invoice_number: 'FAT-2025-002',
          payment_method: 'card',
          is_recurring: false,
          category: 'utilidades',
          paid_status: 'pago',
          due_date: '2025-09-20',
          type: 'conta'
        }
      }
    }
  })
  findAll(@CurrentUser() user: UserPayload) {
    return this.payablesService.findByUserId(user.sub);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Buscar contas a pagar por categoria' })
  @ApiParam({
    name: 'category',
    description:
      'Categoria das contas (ex: utilidades, alimentacao, transporte)',
    example: 'utilidades'
  })
  @ApiResponse({
    status: 200,
    description: 'Contas encontradas para a categoria especificada',
    type: 'array'
  })
  async findByCategory(
    @CurrentUser() user: UserPayload,
    @Param('category') category: string
  ) {
    return this.payablesService.findByUserIdAndCategory(user.sub, category);
  }

  @Get('paid-status/:status')
  @ApiOperation({ summary: 'Buscar contas a pagar por status de pagamento' })
  @ApiParam({
    name: 'status',
    description: 'Status do pagamento (ex: pago, pendente, atrasado)',
    example: 'pago'
  })
  @ApiResponse({
    status: 200,
    description: 'Contas encontradas para o status especificado',
    type: 'array'
  })
  async findByPaidStatus(
    @CurrentUser() user: UserPayload,
    @Param('status') paid_status: string
  ) {
    return this.payablesService.findByUserIdAndPaidStatus(
      user.sub,
      paid_status
    );
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Buscar contas a pagar por intervalo de datas' })
  @ApiQuery({
    name: 'start_date',
    description: 'Data de início (formato: YYYY-MM-DD)',
    example: '2025-09-01',
    required: true
  })
  @ApiQuery({
    name: 'end_date',
    description: 'Data de fim (formato: YYYY-MM-DD)',
    example: '2025-09-30',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Contas encontradas no intervalo de datas especificado',
    type: 'array'
  })
  @ApiResponse({
    status: 404,
    description: 'start_date e end_date são obrigatórios'
  })
  async findByDateRange(
    @CurrentUser() user: UserPayload,
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string
  ) {
    if (!start_date || !end_date) {
      throw new NotFoundException('start_date and end_date are required');
    }
    return this.payablesService.findByUserIdAndDateRange(
      user.sub,
      start_date,
      end_date
    );
  }

  @Get('year-month')
  @ApiOperation({ summary: 'Buscar contas a pagar por ano e mês' })
  @ApiQuery({
    name: 'year',
    description: 'Ano (formato: YYYY)',
    example: '2025',
    required: true
  })
  @ApiQuery({
    name: 'month',
    description: 'Mês (formato: MM)',
    example: '09',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Contas encontradas para o ano e mês especificados',
    type: 'array'
  })
  @ApiResponse({
    status: 404,
    description: 'year e month são obrigatórios'
  })
  async findByYearMonth(
    @CurrentUser() user: UserPayload,
    @Query('year') year: string,
    @Query('month') month: string
  ) {
    if (!year || !month) {
      throw new NotFoundException('year and month are required');
    }
    return this.payablesService.findByUserIdAndYearMonth(user.sub, year, month);
  }

  @Get('total')
  @ApiOperation({
    summary: 'Obter valor total de todas as contas a pagar do usuário'
  })
  @ApiResponse({
    status: 200,
    description: 'Valor total das contas',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          example: 1250.5
        }
      }
    }
  })
  async getTotalAmount(@CurrentUser() user: UserPayload) {
    const total = await this.payablesService.getTotalAmountByUserId(user.sub);
    return { total };
  }

  @Get('total/paid-status/:status')
  @ApiOperation({ summary: 'Obter valor total por status de pagamento' })
  @ApiParam({
    name: 'status',
    description: 'Status do pagamento',
    example: 'pago'
  })
  @ApiResponse({
    status: 200,
    description: 'Valor total para o status especificado',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          example: 750.25
        }
      }
    }
  })
  async getTotalAmountByPaidStatus(
    @CurrentUser() user: UserPayload,
    @Param('status') paid_status: string
  ) {
    const total =
      await this.payablesService.getTotalAmountByUserIdAndPaidStatus(
        user.sub,
        paid_status
      );
    return { total };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma conta a pagar específica por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da conta a pagar',
    example: '675c123456789abcdef01234'
  })
  @ApiResponse({
    status: 200,
    description: 'Conta encontrada',
    schema: {
      type: 'object',
      example: {
        _id: '675c123456789abcdef01234',
        userId: '675c123456789abcdef01235',
        year: '2025',
        month: '09',
        day: '20',
        hour: '10',
        amount: 340.75,
        description: 'Conta de luz - Setembro',
        invoice_number: 'FAT-2025-002',
        payment_method: 'card',
        is_recurring: false,
        category: 'utilidades',
        paid_status: 'pago',
        due_date: '2025-09-20',
        type: 'conta'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Conta não encontrada'
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - conta não pertence ao usuário'
  })
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.payablesService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma conta a pagar' })
  @ApiParam({
    name: 'id',
    description: 'ID da conta a pagar',
    example: '675c123456789abcdef01234'
  })
  @ApiBody({
    type: UpdatePayableDto,
    description: 'Dados para atualizar a conta a pagar'
  })
  @ApiResponse({
    status: 200,
    description: 'Conta atualizada com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Conta não encontrada'
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - conta não pertence ao usuário'
  })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updatePayableDto: UpdatePayableDto
  ) {
    return this.payablesService.update(user.sub, id, updatePayableDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma conta a pagar' })
  @ApiParam({
    name: 'id',
    description: 'ID da conta a pagar',
    example: '675c123456789abcdef01234'
  })
  @ApiResponse({
    status: 200,
    description: 'Conta excluída com sucesso'
  })
  @ApiResponse({
    status: 404,
    description: 'Conta não encontrada'
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - conta não pertence ao usuário'
  })
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.payablesService.remove(user.sub, id);
  }
}
