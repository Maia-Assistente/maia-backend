// src/receivables/dto/create-receivable.dto.ts
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min
} from 'class-validator';
import { PaymentMethod } from '../schemas/receivable.schema';

export class CreateReceivableDto {
  // userId será adicionado automaticamente do JWT token no controller

  @IsNotEmpty()
  @IsString()
  year: string;

  @IsNotEmpty()
  @IsString()
  month: string;

  @IsNotEmpty()
  @IsString()
  day: string;

  @IsNotEmpty()
  @IsString()
  hour: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  invoice_number: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @IsOptional()
  @IsString()
  recurring_time?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  installment?: string;

  @IsNotEmpty()
  @IsString()
  paid_status: string;

  @IsNotEmpty()
  @IsString()
  due_date: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}

// src/receivables/dto/update-receivable.dto.ts
