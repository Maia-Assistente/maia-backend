import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PayableDocument = Payable & Document;

export enum PaymentMethod {
  PIX = 'pix',
  CARD = 'card',
  CASH = 'cash'
}

@Schema({ timestamps: true })
export class Payable {
  @Prop({ required: true })
  user_ns: string;

  @Prop({ required: true })
  token_talkbi: string;

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

export const PayableSchema = SchemaFactory.createForClass(Payable);

// Create compound index for [user_ns, token_talkbi]
PayableSchema.index({ user_ns: 1, token_talkbi: 1 });
