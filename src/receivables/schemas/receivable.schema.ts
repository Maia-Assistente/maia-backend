// src/receivables/schemas/receivable.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ReceivableDocument = Receivable & Document;

export enum PaymentMethod {
  PIX = 'pix',
  CARD = 'card',
  CASH = 'cash'
}

@Schema({ timestamps: true })
export class Receivable {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  year: string;

  @Prop({ required: true })
  month: string;

  @Prop({ required: true })
  day: string;

  @Prop({ required: true })
  hour: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  invoice_number: string;

  @Prop({ enum: PaymentMethod, required: true })
  payment_method: PaymentMethod;

  @Prop({ default: false })
  is_recurring: boolean;

  @Prop()
  recurring_time: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  installment: string;

  @Prop({ required: true })
  paid_status: string;

  @Prop({ required: true })
  due_date: string;

  @Prop({ required: true })
  type: string;
}

export const ReceivableSchema = SchemaFactory.createForClass(Receivable);

// Create index for userId for better query performance
ReceivableSchema.index({ userId: 1 });
ReceivableSchema.index({ userId: 1, due_date: 1 });
ReceivableSchema.index({ userId: 1, category: 1 });
ReceivableSchema.index({ userId: 1, paid_status: 1 });
