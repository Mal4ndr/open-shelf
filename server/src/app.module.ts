import { Module } from '@nestjs/common';
import { AppController } from './app.controller'; // обробляє http запити
import { AppService } from './app.service'; // містить бізнес-логіку

// модуль для роботи з MongoDB, через нього відбувається підключення до БД
import { MongooseModule } from '@nestjs/mongoose';

/**
 * ConfigModule - є чимось схожим на бібліотеку, що знаходить файл .env, парсить його розділяючи на ключі
 * та значення, які далі завантажує в process.env, чого не може зробити нативний JS.
 *
 * ConfigService - це сервіс який надає безпечний доступ до цих змінних.
 */
import { ConfigModule, ConfigService } from '@nestjs/config';

// Інші модулі
import { BooksModule } from './modules/books/books.module';
import { BookCopiesService } from './modules/book-copies/book-copies.service';
import { BookCopiesController } from './modules/book-copies/book-copies.controller';
import { BookCopiesModule } from './modules/book-copies/book-copies.module';
import { UsersModule } from './modules/users/users.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';

// декоратор який вказує що клас є модулем, системною одиницею модульної архітектури фреймворка
@Module({
  imports: [
    // forRoot() завантажує .env змінні, без цього ConfigService не буде мати доступу до змінних оточення
    ConfigModule.forRoot(),
    /**
     * forRootAsync() дозволяє отримати конфігураційні дані (наприклад, URI з .env через ConfigService)
     * перед підключенням до бази. Якщо підключення до MongoDB залежить від асинхронних даних
     * (наприклад, змінних оточення, секретів, зовнішніх сервісів), звичайний forRoot() не підійде,
     * бо він працює синхронно. forRootAsync() дозволяє використати фабрику (useFactory), яка може отримати
     * потрібні сервіси через inject і виконати асинхронну логіку.
     */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      /**
       * useFactory — це фабрична функція, яка створює конфігурацію для підключення до MongoDB. Вона отримує
       * ConfigService через параметр (завдяки inject: [ConfigService]). Усередині фабрики викликається
       * configService.get<string>('MONGO_URI'), тобто дістається значення змінної оточення MONGO_URI з .env.
       * Функція повертає об’єкт { uri: ... }, який використає Mongoose для підключення. Такий підхід
       * дозволяє отримати значення з сервісу, а не жорстко прописувати URI у коді.
       */
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    BooksModule,
    BookCopiesModule,
    UsersModule,
    ExchangesModule,
  ],
  controllers: [AppController, BookCopiesController],
  providers: [AppService, BookCopiesService],
})

// екпорт дозволяє стати даному класу доступним через імпортування в інших файлах
export class AppModule {}
