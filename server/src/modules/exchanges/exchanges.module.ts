import { Module } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { Exchange, ExchangeSchema } from './schemas/exchange.schema';
import {
  BookCopy,
  BookCopySchema,
} from '../book-copies/schemas/book-copy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exchange.name, schema: ExchangeSchema },
      { name: BookCopy.name, schema: BookCopySchema },
    ]),
  ],
  providers: [ExchangesService],
  controllers: [ExchangesController],
})
export class ExchangesModule {}
