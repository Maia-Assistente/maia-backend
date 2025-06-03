import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LATE = 'late'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: false })
  emailVerified?: boolean;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, unique: true })
  cpf: string;

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ required: true })
  user_ns: string;

  @Prop({ required: true })
  token_talkbi: string;

  @Prop({ enum: Gender, required: true })
  gender: Gender;
}

export const UsersSchema = SchemaFactory.createForClass(User);

// Create compound index for [user_ns, token_talkbi]
UsersSchema.index({ user_ns: 1, token_talkbi: 1 }, { unique: true });
