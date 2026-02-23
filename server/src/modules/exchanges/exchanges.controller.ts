import { Controller } from '@nestjs/common';

import { Body, Post, Get } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { createExchangeDto } from './dto/create-exchange.dto';

@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Post()
  createExchangeRequest(@Body() dto: createExchangeDto) {
    return this.exchangesService.createExchangeRequest(
      dto.initiatorId,
      dto.bookCopyId,
    );
  }
}
