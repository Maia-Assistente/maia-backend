import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../schemas/payable.schema';

export class CreatePayableDto {
  // userId será adicionado automaticamente do JWT token no controller

  @ApiProperty({
    description: 'Ano da conta',
    example: '2025'
  })
  @IsNotEmpty()
  @IsString()
  year: string;

  @ApiProperty({
    description: 'Mês da conta (formato: MM)',
    example: '09'
  })
  @IsNotEmpty()
  @IsString()
  month: string;

  @ApiProperty({
    description: 'Dia da conta (formato: DD)',
    example: '20'
  })
  @IsNotEmpty()
  @IsString()
  day: string;

  @ApiProperty({
    description: 'Hora da conta (formato: HH)',
    example: '10'
  })
  @IsNotEmpty()
  @IsString()
  hour: string;

  @ApiProperty({
    description: 'Valor da conta',
    example: 340.75,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Descrição da conta',
    example: 'Conta de luz - Setembro'
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Número da fatura',
    example: 'FAT-2025-002'
  })
  @IsNotEmpty()
  @IsString()
  invoice_number: string;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    example: PaymentMethod.CARD
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Indica se a conta é recorrente',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @ApiPropertyOptional({
    description: 'Frequência da recorrência (se aplicável)',
    example: 'monthly'
  })
  @IsOptional()
  @IsString()
  recurring_time?: string;

  @ApiProperty({
    description: 'Categoria da conta',
    example: 'utilidades'
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({
    description: 'Informações sobre parcelamento (se aplicável)',
    example: '3/12'
  })
  @IsOptional()
  @IsString()
  installment?: string;

  @ApiProperty({
    description: 'Status do pagamento',
    example: 'pago'
  })
  @IsNotEmpty()
  @IsString()
  paid_status: string;

  @ApiProperty({
    description: 'Data de vencimento (formato: YYYY-MM-DD)',
    example: '2025-09-20'
  })
  @IsNotEmpty()
  @IsString()
  due_date: string;

  @ApiProperty({
    description: 'Tipo da conta',
    example: 'conta'
  })
  @IsNotEmpty()
  @IsString()
  type: string;
}
