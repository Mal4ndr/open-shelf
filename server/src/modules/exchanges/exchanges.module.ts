import { Module } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { Exchange, ExchangeSchema } from './schemas/exchange.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exchange.name, schema: ExchangeSchema },
    ]),
  ],
  providers: [ExchangesService],
  controllers: [ExchangesController],
})
export class ExchangesModule {}
