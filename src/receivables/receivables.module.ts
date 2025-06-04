import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReceivablesService } from './receivables.service';
import { ReceivablesController } from './receivables.controller';
import { Receivable, ReceivableSchema } from './schemas/receivable.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Receivable.name, schema: ReceivableSchema }
    ])
  ],
  controllers: [ReceivablesController],
  providers: [ReceivablesService],
  exports: [ReceivablesService]
})
export class ReceivablesModule {}
