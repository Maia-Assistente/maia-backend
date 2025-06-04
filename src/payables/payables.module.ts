import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayablesService } from './payables.service';
import { PayablesController } from './payables.controller';
import { Payable, PayableSchema } from './schemas/payable.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payable.name, schema: PayableSchema }])
  ],
  controllers: [PayablesController],
  providers: [PayablesService],
  exports: [PayablesService]
})
export class PayablesModule {}
