import { ForbiddenException, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Exchange,
  ExchangeDocument,
  ExchangeStatus,
} from './schemas/exchange.schema';
import {
  BookCopy,
  BookCopyDocument,
  BookCopyStatus,
} from '../book-copies/schemas/book-copy.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateExchangeDto } from './dto/create-exchange.dto';

@Injectable()
export class ExchangesService {
  constructor(
    /**
     * @InjectModel декоратор для інжектування (введення) моделі Mongoose у сервіс.
     * В якості параметра приймається назва схеми щоб NestJS знав, яку модель підключати.
     * Запис в кутних дужках <ExchangeDocument> є generic-типом TS, який вказує що модель
     * працює з документами типу ExchangeDocument.
     *
     * Цей та подібні записи є потрібними для роботи з MongoDB через Mongoose, вони
     * дозволяють сервісу виконувати CRUD-операції з відповідними колекціями.
     */
    @InjectModel(Exchange.name)
    private exchangeModel: Model<ExchangeDocument>,

    @InjectModel(BookCopy.name)
    private bookCopyModel: Model<BookCopyDocument>,
  ) {}

  /**
   * Функція є асинхронною бо працює з БД, а такі операції займають час і повертають проміси.
   * Синтаксис async/await дозволяє писати асинхронний код як синхронний з точки зору
   * послідовності написання. Аналогами є .then()/.catch() або використання RxJS (Observable).
   * async/await обрано через простоту та зручність для роботи з промісами у сучасному TS/NestJS.
   * Без await довелося б писати вкладені .then(), що ускладнює читання.
   */
  async createExchange(createExchangeDto: CreateExchangeDto) {
    const { initiatorId, bookCopyId } = createExchangeDto;
    const bookCopy = await this.bookCopyModel.findById(bookCopyId);

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

    /**
     * Перевірка спершу здається дивною, тому що хто в здоровому глузді буде створювати
     * транзакцію (позичання, обмін або ж оренду) самому собі. Проте вони є необхідними щоб уберегти
     * базу від некоректних та нелогічних запитів так само як саму роботу програми. Через це
     * слід завжди думати про те, що дійсно дозволено робити користувачу згідно ідеї модуля програми.
     */
    if (bookCopy.ownerId.toString() === initiatorId) {
      throw new BadRequestException('You cannot request your own book');
    }

    /**
     * Додано перевірку як на рівні production розробки. Оскільки юзер може безліч разів натиснути
     * кнопку для створення обміну, відповідно створиться стільки ж обмінів, що є ненормальною
     * поведінкою, слід це завчасно передбачувати та обробляти.
     *
     * this.exchangeModel.findOne({...}) шукає в колекції "exchanges" документ, який відповідає
     * заданим критеріям у об'єкті query. Поля у query вибрані для унікальності активного запиту на обмін.
     * А exchangeModel — це інтерфейс до колекції MongoDB, який дає повний набір методів для роботи з
     * документами цієї колекції.
     *
     * Використовується findOne() саме через те що ми не знаємо точного id exchange, Натомість маємо
     * доступ до інших полів що повинні бути у цьому документі.
     */
    const existingExchange = await this.exchangeModel.findOne({
      initiatorId,
      bookCopyId,
      status: ExchangeStatus.REQUESTED,
    });

    if (existingExchange) {
      throw new BadRequestException('Exchange request already exists');
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

  async acceptExchange(exchangeId: string, userId: string) {
    const exchange = await this.exchangeModel.findById(exchangeId);

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    if (exchange.responderId.toString() !== userId) {
      throw new ForbiddenException('Only owner can accept exchange');
    }

    if (exchange.status !== ExchangeStatus.REQUESTED) {
      throw new BadRequestException('Exchange already processed');
    }

    const bookCopy = await this.bookCopyModel.findById(exchangeId);

    if (!bookCopy) {
      throw new NotFoundException('Book copy not found');
    }

    if (bookCopy.status !== BookCopyStatus.AVAILABLE) {
      throw new BadRequestException('Book copy not available');
    }

    exchange.status = ExchangeStatus.ACTIVE;
    await exchange.save();

    /**
     * Метод шукає документ у колекції за id (перший параметр), оновлює знайдений документ згідно з другим
     * параметром (updateObj), що є об'єктом де вказуються поля які треба змінити.
     */

    await this.bookCopyModel.findByIdAndUpdate(exchange.bookCopyId, {
      status: BookCopyStatus.BORROWED,
    });
    return exchange;
  }

  /**
   * Метод getMyExchanges(userId) повертає всі обміни (exchanges), у яких користувач бере участь — як ініціатор
   * (initiatorId), так і як власник книги (responderId). Він також підтягує (populate) додаткову інформацію про
   * копію книги та саму книгу, щоб одразу отримати всі потрібні дані для відображення на клієнті.
   */
  async getMyExchanges(userId: string) {
    /**
     * this.exchangeModel.find({...}) — шукає всі документи в колекції exchanges, які відповідають умові.
     */
    return (
      this.exchangeModel
        .find({
          /**
           * $or — це оператор MongoDB, який дозволяє знайти документи, де хоча б одна з умов істинна: або initiatorId
           * дорівнює userId (користувач ініціював обмін), або responderId дорівнює userId (користувач — власник книги,
           * на яку просять обмін).
           */
          $or: [{ initiatorId: userId }, { responderId: userId }],
        })
        // #region populate
        /**
         * populate — це функція Mongoose, яка дозволяє "розгорнути" (заповнити) поля, що містять посилання
         * на інші документи (ObjectId). Іншими словами виконати підтягування пов'язаної інформації. Це спосіб
         * автоматично підставити замість ObjectId (посилання на інший документ) сам об'єкт цього документа.
         * Без populate отримуємо лише id (наприклад, bookCopyId: "123..."). З populate цілий об'єкт (наприклад,
         * bookCopyId: { status: ..., ownerId: ..., bookId: ... }). Тобто populate — це "автоматичне підвантаження"
         * пов’язаного документа за id.
         */
        // #endregion
        .populate({
          /**
           * path: 'bookCopyId' — каже Mongoose підставити замість id повний документ копії книги (BookCopy).
           * select: 'status bookId ownerId' — обмежує, які поля копії книги будуть підставлені (щоб не тягнути зайве).
           * populate: { path: 'bookId', select: 'title author' } — ще один рівень: у копії книги є поле bookId
           * (посилання на саму книгу), і тут теж підтягуються лише title та author.
           *
           * В результаті у кожному обміні одразу отримуємо: інформацію про копію книги (її статус, власника, id книги),
           * і навіть коротку інформацію про саму книгу (назва, автор).
           */
          path: 'bookCopyId',
          select: 'status bookId ownerId',
          populate: {
            path: 'bookId',
            select: 'title author',
          },
        })
        // #region sort
        /**
         * сортує результати за датою створення (createdAt) у зворотному порядку (від нових до старих).
         */
        // #endregion
        .sort({ createdAt: -1 })
    );
  }
}
