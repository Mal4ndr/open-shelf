import {
  Controller,
  Body,
  Post,
  Patch,
  Param,
  Get,
  Query,
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

  /**
   * @Post - це декоратор, який позначає, що метод контролера обробляє HTTP POST-запит.
   * Коли користувач надсилає POST-запит на маршрут /exchanges, NestJS викликає саме цей
   * метод (createExchangeRequest).
   *
   * @Body - декоратор, який вказує NestJS взяти дані з тіла HTTP-запиту (body) і передати
   * їх у параметр методу. У цьому випадку NestJS автоматично перетворює тіло запиту на об’єкт
   * типу createExchangeDto, що дозволяє зручно працювати з даними, а також використовувати
   * валідацію та типізацію.
   */
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

  /**
   * @Patch (':id/accept') — цей метод обробляє PATCH-запит, наприклад за маршрутом
   * /exchanges/123/accept, де 123 — це id обміну.
   *
   * @Param ('id') — декоратор, який каже NestJS взяти параметр id із URL (наприклад,
   * 123 із /exchanges/123/accept) і передати його у змінну id. Тобто, він дозволяє
   * отримати значення з динамічної частини URL (наприклад, /:id). Наприклад, якщо
   * забрати @Param('id'), змінна id буде undefined, навіть якщо в URL є /:id.
   *
   * @Body ('userId') — декоратор, який каже взяти поле userId із тіла запиту.
   */
  @Patch(':id/accept')
  acceptExchange(@Param('id') id: string, @Req() req: any) {
    return this.exchangesService.acceptExchange(id, req.user.userId);
  }

  /**
   * @Get ('my') — цей метод обробляє GET-запит за маршрутом /exchanges/my.
   *
   * @Query ('userId') — декоратор, який каже взяти параметр userId із query-рядка
   * (наприклад, /exchanges/my?userId=456). Іншими словами він дозволяє отримати
   * значення з query-рядка (наприклад, ?userId=456). Якщо забрати @Query('userId'),
   * userId не буде підставлений із query-рядка.
   */
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
