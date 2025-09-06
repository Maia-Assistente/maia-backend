// src/receivables/receivables.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Receivable, ReceivableDocument } from './schemas/receivable.schema';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';

@Injectable()
export class ReceivablesService {
  constructor(
    @InjectModel(Receivable.name)
    private receivableModel: Model<ReceivableDocument>
  ) {}

  async create(
    userId: string,
    createReceivableDto: CreateReceivableDto
  ): Promise<Receivable> {
    try {
      const createdReceivable = new this.receivableModel({
        ...createReceivableDto,
        userId
      });
      return await createdReceivable.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Receivable with this combination already exists'
        );
      }
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Receivable[]> {
    return this.receivableModel.find({ userId }).exec();
  }

  async findOne(userId: string, id: string): Promise<Receivable> {
    const receivable = await this.receivableModel.findById(id).exec();

    if (!receivable) {
      throw new NotFoundException(`Receivable with ID ${id} not found`);
    }

    // Check if the receivable belongs to the user
    if (receivable.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this receivable'
      );
    }

    return receivable;
  }

  async findByUserIdAndCategory(
    userId: string,
    category: string
  ): Promise<Receivable[]> {
    return this.receivableModel.find({ userId, category }).exec();
  }

  async findByUserIdAndPaidStatus(
    userId: string,
    paid_status: string
  ): Promise<Receivable[]> {
    return this.receivableModel.find({ userId, paid_status }).exec();
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Receivable[]> {
    return this.receivableModel
      .find({
        userId,
        due_date: { $gte: startDate, $lte: endDate }
      })
      .exec();
  }

  async findByUserIdAndYearMonth(
    userId: string,
    year: string,
    month: string
  ): Promise<Receivable[]> {
    return this.receivableModel.find({ userId, year, month }).exec();
  }

  async update(
    userId: string,
    id: string,
    updateReceivableDto: UpdateReceivableDto
  ): Promise<Receivable> {
    try {
      // First check if receivable exists and belongs to user
      const existingReceivable = await this.findOne(userId, id);

      const updatedReceivable = await this.receivableModel
        .findByIdAndUpdate(id, updateReceivableDto, { new: true })
        .exec();

      return updatedReceivable;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Receivable with this combination already exists'
        );
      }
      throw error;
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    // First check if receivable exists and belongs to user
    await this.findOne(userId, id);

    await this.receivableModel.findByIdAndDelete(id).exec();
  }

  async getTotalAmountByUserId(userId: string): Promise<number> {
    const result = await this.receivableModel
      .aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      .exec();

    return result.length > 0 ? result[0].total : 0;
  }

  async getTotalAmountByUserIdAndPaidStatus(
    userId: string,
    paid_status: string
  ): Promise<number> {
    const result = await this.receivableModel
      .aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            paid_status
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      .exec();

    return result.length > 0 ? result[0].total : 0;
  }
}
