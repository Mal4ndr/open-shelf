import {
  Controller,
  Body,
  Post,
  Patch,
  Param,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';

import { ExchangesService } from './exchanges.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Post()
  createExchange(
    @Body() createExchangeDto: CreateExchangeDto,
    @Req() req: any,
  ) {
    return this.exchangesService.createExchange(
      createExchangeDto,
      req.user.userId,
    );
  }

  @Patch(':id/accept')
  acceptExchange(@Param('id') id: string, @Req() req: any) {
    return this.exchangesService.acceptExchange(id, req.user.userId);
  }

  @Get('my')
  getMyExchanges(@Req() req: any) {
    return this.exchangesService.getMyExchanges(req.user.userId);
  }

  @Patch(':id/reject')
  rejectExchange(@Param('id') id: string, @Req() req: any) {
    return this.exchangesService.rejectExchange(id, req.user.userId);
  }

  @Patch(':id/cancel')
  cancelExchange(@Param('id') id: string, @Req() req: any) {
    return this.exchangesService.cancelExchange(id, req.user.userId);
  }

  @Patch(':id/complete')
  completeExchange(@Param('id') id: string, @Req() req: any) {
    return this.exchangesService.completeExchange(id, req.user.userId);
  }
}
