import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Exchange,
  ExchangeDocument,
  ExchangeStatus,
} from './schemas/exchange.schema';
import { BookCopyDocument } from '../book-copies/schemas/book-copy.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class ExchangesService {
  constructor(
    /**
     * @InjectModel декоратор для інжектування (введення) моделі Mongoose у сервіс.
     * В якості параметра приймається назва схеми, щоб NestJS знав, яку модель підключати.
     * Запис в кутних дужках <ExchangeDocument> є generic-типом TS, який вказує що модель
     * працює з документами типу ExchangeDocument.
     *
     * Цей та подібні записи є потрібними для роботи з MongoDB через Mongoose, вони
     * дозволяють сервісу виконувати CRUD-операції з відповідними колекціями.
     */
    @InjectModel(Exchange.name)
    private exchangeModel: Model<ExchangeDocument>,

    @InjectModel(Exchange.name)
    private bookCopyModel: Model<BookCopyDocument>,
  ) {}

  /**
   * Функція є асинхронною бо працює з БД, а такі операції займають час і повертають проміси.
   * Синтаксис async/await дозволяє писати асинхронний код як синхронний з точки зору
   * послідовності написання. Аналогами є .then()/.catch() або використання RxJS (Observable).
   * async/await обрано через простоту та зручність для роботи з промісами у сучасному TS/NestJS.
   * Без await довелося б писати вкладені .then(), що ускладнює читання.
   */
  async createExchangeRequest(initiatorId: string, bookCopyId: string) {
    console.log('Incoming ID:', bookCopyId);
    const bookCopy = await this.bookCopyModel.findById(bookCopyId);
    console.log('Found bookCopy:', bookCopy);

    if (!bookCopy) {
      /**
       * NotFoundException разом з BadRequestException є стандартними обробниками помилок NestJS
       * для HTTP-винятків. Вони широко використовуються для повернення коректних статус-кодів
       * (404, 400). Є й інші варіанти: можна кидати власні помилки або використовувати інші
       * HTTP-винятки (ForbiddenException, UnauthorizedException тощо). Обрано саме ці, бо
       * вони чітко відповідають ситуації: "не знайдено" або "некоректний запит".
       */
      throw new NotFoundException('Book copy not found');
    }

    if (bookCopy.status !== 'available') {
      throw new BadRequestException('Book is not available');
    }

    if (bookCopy.ownerId.toString() === initiatorId) {
      throw new BadRequestException('You cannot request your own book');
    }

    /**
     * Операція створення документа в базі (this.exchangeModel.create(...)) — це звернення до
     * зовнішнього ресурсу (бази даних). Такі операції займають невідомий час (залежить від мережі,
     * навантаження тощо), тому вони повертають проміс (promise) і виконуються асинхронно, щоб не
     * блокувати виконання іншого коду. await дозволяє "дочекатися" завершення цієї операції і
     * отримати результат коли він буде готовий. Без await функція повернула б проміс, а не сам
     * об'єкт обміну, що може призвести до помилок у логіці.
     */
    const exchange = await this.exchangeModel.create({
      initiatorId,
      responderId: bookCopy.ownerId,
      bookCopyId,
      status: ExchangeStatus.REQUESTED,
    });

    return exchange;
  }
}
