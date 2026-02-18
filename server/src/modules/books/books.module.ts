import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './schemas/book.schema';

@Module({
  imports: [
    /**
     * Функція forFeature() дозволяє підключити схеми (моделі) Mongoose до поточного модуля.
     * Це дає змогу інжектити (використовувати через DI) відповідну модель (в даному випадку
     * Book) у сервісах цього модуля для виконання CRUD-операцій з MongoDB. Мета - зробити
     * модель доступною лише в межах цього модуля, ізоляція та зручність роботи з БД.
     *
     * Параметром функції є масив, який забезпечує можливість роботи з декількома моделями
     * (схемами). Це зручно для модулів, які працюють з різними колекціями. Кожна схема
     * представляється окремим об'єктом, властивість name це назва моделі (повинна збігатися
     * з ім'ям класу або сутності, наприклад Book.name), schema є схемою Mongoose, яка
     * визначає структуру документів у колекції (BookSchema).
     *
     * В даному контексті модель це клас або об'єкт, який створюється на основі схеми.
     * Модель дає змогу взаємодіяти з колекцією у базі даних: створювати, читати, оновлювати,
     * видаляти документи (CRUD-операції). Модель дозволяє працювати із самою колекцією,
     * а схема лише описує як виглядає кожен документ.
     */
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
  ],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
