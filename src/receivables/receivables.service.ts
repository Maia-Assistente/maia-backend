import {
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receivable, ReceivableDocument } from './schemas/receivable.schema';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';

@Injectable()
export class ReceivablesService {
  constructor(
    @InjectModel(Receivable.name)
    private receivableModel: Model<ReceivableDocument>
  ) {}

  async create(createReceivableDto: CreateReceivableDto): Promise<Receivable> {
    try {
      const createdReceivable = new this.receivableModel(createReceivableDto);
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

  async findAll(): Promise<Receivable[]> {
    return this.receivableModel.find().exec();
  }

  async findOne(id: string): Promise<Receivable> {
    const receivable = await this.receivableModel.findById(id).exec();
    if (!receivable) {
      throw new NotFoundException(`Receivable with ID ${id} not found`);
    }
    return receivable;
  }

  async findByUserNsAndToken(
    user_ns: string,
    token_talkbi: string
  ): Promise<Receivable[]> {
    return this.receivableModel.find({ user_ns, token_talkbi }).exec();
  }

  async findByUserNsTokenAndCategory(
    user_ns: string,
    token_talkbi: string,
    category: string
  ): Promise<Receivable[]> {
    return this.receivableModel
      .find({ user_ns, token_talkbi, category })
      .exec();
  }

  async findByUserNsTokenAndPaidStatus(
    user_ns: string,
    token_talkbi: string,
    paid_status: string
  ): Promise<Receivable[]> {
    return this.receivableModel
      .find({ user_ns, token_talkbi, paid_status })
      .exec();
  }

  async findByUserNsTokenAndDateRange(
    user_ns: string,
    token_talkbi: string,
    startDate: string,
    endDate: string
  ): Promise<Receivable[]> {
    return this.receivableModel
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
  ): Promise<Receivable[]> {
    return this.receivableModel
      .find({ user_ns, token_talkbi, year, month })
      .exec();
  }

  async update(
    id: string,
    updateReceivableDto: UpdateReceivableDto
  ): Promise<Receivable> {
    try {
      const updatedReceivable = await this.receivableModel
        .findByIdAndUpdate(id, updateReceivableDto, { new: true })
        .exec();

      if (!updatedReceivable) {
        throw new NotFoundException(`Receivable with ID ${id} not found`);
      }

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

  async remove(id: string): Promise<void> {
    const result = await this.receivableModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Receivable with ID ${id} not found`);
    }
  }

  async getTotalAmountByUserNsAndToken(
    user_ns: string,
    token_talkbi: string
  ): Promise<number> {
    const result = await this.receivableModel
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
    const result = await this.receivableModel
      .aggregate([
        { $match: { user_ns, token_talkbi, paid_status } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
      .exec();

    return result.length > 0 ? result[0].total : 0;
  }
}
