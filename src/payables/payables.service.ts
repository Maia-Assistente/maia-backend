import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payable, PayableDocument } from './schemas/payable.schema';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';

@Injectable()
export class PayablesService {
  private readonly logger = new Logger(PayablesService.name);

  constructor(
    @InjectModel(Payable.name)
    private payableModel: Model<PayableDocument>
  ) {}

  async create(
    userId: string,
    createPayableDto: CreatePayableDto
  ): Promise<Payable> {
    try {
      this.logger.log(`Creating payable for userId: ${userId}`);
      this.logger.log(`Data to create: ${JSON.stringify(createPayableDto)}`);

      const createdPayable = new this.payableModel({
        ...createPayableDto,
        userId
      });

      this.logger.log(`Payable model created, attempting to save...`);
      const savedPayable = await createdPayable.save();
      this.logger.log(`Payable saved successfully`);

      return savedPayable;
    } catch (error) {
      this.logger.error(`Error in PayablesService.create: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);

      if (error.code === 11000) {
        throw new ConflictException(
          'Payable with this combination already exists'
        );
      }
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Payable[]> {
    return this.payableModel.find({ userId }).exec();
  }

  async findOne(userId: string, id: string): Promise<Payable> {
    const payable = await this.payableModel.findById(id).exec();

    if (!payable) {
      throw new NotFoundException(`Payable with ID ${id} not found`);
    }

    // Check if the payable belongs to the user
    if (payable.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this payable'
      );
    }

    return payable;
  }

  async findByUserIdAndCategory(
    userId: string,
    category: string
  ): Promise<Payable[]> {
    return this.payableModel.find({ userId, category }).exec();
  }

  async findByUserIdAndPaidStatus(
    userId: string,
    paid_status: string
  ): Promise<Payable[]> {
    return this.payableModel.find({ userId, paid_status }).exec();
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Payable[]> {
    return this.payableModel
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
  ): Promise<Payable[]> {
    return this.payableModel.find({ userId, year, month }).exec();
  }

  async update(
    userId: string,
    id: string,
    updatePayableDto: UpdatePayableDto
  ): Promise<Payable> {
    try {
      // First check if payable exists and belongs to user
      const existingPayable = await this.findOne(userId, id);

      const updatedPayable = await this.payableModel
        .findByIdAndUpdate(id, updatePayableDto, { new: true })
        .exec();

      return updatedPayable;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Payable with this combination already exists'
        );
      }
      throw error;
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    // First check if payable exists and belongs to user
    await this.findOne(userId, id);

    await this.payableModel.findByIdAndDelete(id).exec();
  }

  async getTotalAmountByUserId(userId: string): Promise<number> {
    const result = await this.payableModel
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
    const result = await this.payableModel
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

// Import Types from mongoose
import { Types } from 'mongoose';
