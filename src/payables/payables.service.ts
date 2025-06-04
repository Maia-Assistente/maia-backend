import {
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payable, PayableDocument } from './schemas/payable.schema';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';

@Injectable()
export class PayablesService {
  constructor(
    @InjectModel(Payable.name)
    private payableModel: Model<PayableDocument>
  ) {}

  async create(createPayableDto: CreatePayableDto): Promise<Payable> {
    try {
      const createdPayable = new this.payableModel(createPayableDto);
      return await createdPayable.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Payable with this combination already exists'
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<Payable[]> {
    return this.payableModel.find().exec();
  }

  async findOne(id: string): Promise<Payable> {
    const payable = await this.payableModel.findById(id).exec();
    if (!payable) {
      throw new NotFoundException(`Payable with ID ${id} not found`);
    }
    return payable;
  }

  async findByUserNsAndToken(
    user_ns: string,
    token_talkbi: string
  ): Promise<Payable[]> {
    return this.payableModel.find({ user_ns, token_talkbi }).exec();
  }

  async findByUserNsTokenAndCategory(
    user_ns: string,
    token_talkbi: string,
    category: string
  ): Promise<Payable[]> {
    return this.payableModel.find({ user_ns, token_talkbi, category }).exec();
  }

  async findByUserNsTokenAndPaidStatus(
    user_ns: string,
    token_talkbi: string,
    paid_status: string
  ): Promise<Payable[]> {
    return this.payableModel
      .find({ user_ns, token_talkbi, paid_status })
      .exec();
  }

  async findByUserNsTokenAndDateRange(
    user_ns: string,
    token_talkbi: string,
    startDate: string,
    endDate: string
  ): Promise<Payable[]> {
    return this.payableModel
      .find({
        user_ns,
        token_talkbi,
        due_date: { $gte: startDate, $lte: endDate }
      })
      .exec();
  }

  async findByUserNsTokenAndYearMonth(
    user_ns: string,
    token_talkbi: string,
    year: string,
    month: string
  ): Promise<Payable[]> {
    return this.payableModel
      .find({ user_ns, token_talkbi, year, month })
      .exec();
  }

  async update(
    id: string,
    updatePayableDto: UpdatePayableDto
  ): Promise<Payable> {
    try {
      const updatedPayable = await this.payableModel
        .findByIdAndUpdate(id, updatePayableDto, { new: true })
        .exec();

      if (!updatedPayable) {
        throw new NotFoundException(`Payable with ID ${id} not found`);
      }

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

  async remove(id: string): Promise<void> {
    const result = await this.payableModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Payable with ID ${id} not found`);
    }
  }

  async getTotalAmountByUserNsAndToken(
    user_ns: string,
    token_talkbi: string
  ): Promise<number> {
    const result = await this.payableModel
      .aggregate([
        { $match: { user_ns, token_talkbi } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      .exec();

    return result.length > 0 ? result[0].total : 0;
  }

  async getTotalAmountByUserNsTokenAndPaidStatus(
    user_ns: string,
    token_talkbi: string,
    paid_status: string
  ): Promise<number> {
    const result = await this.payableModel
      .aggregate([
        { $match: { user_ns, token_talkbi, paid_status } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      .exec();

    return result.length > 0 ? result[0].total : 0;
  }
}
