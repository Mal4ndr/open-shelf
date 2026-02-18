import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookCopyDocument = BookCopy & Document;

/**
 * Enum (enumeration) є спеціальним типом у багатьох мовах програмування (наприклад TS,
 * C#, Java), enum дозволяє визначати набір іменованих констант. Він допомагає описати
 * обмежаний перелік значень, які може приймати певна змінна.
 *
 * Enum складається з іменованих пар ключ-значення, де ключ це ім'я константи,
 * а значення - число або рядок в залежності від типу enum. Альтернатива об'єкт із
 * константами, але enum дає кращу інтеграцію з типізацією та автодоповненням.
 *
 * Uppercase для ключів є поширеним стилем їх написання, це сигналізує що значення є
 * незмінними. Lowercase для значень є часто стандартом для даних у JSON, API, базах
 * даних (легше порівнювати, уникати помилок через регістр).
 */
export enum BookCopyStatus {
  AVAILABLE = 'available',
  BORROWED = 'borrowed',
}

@Schema({ timestamps: true })
export class BookCopy {
  /**
   * type: Types.ObjectId - вказує, що значення цієї властивості має тип ObjectId
   * (унікальний ідентифікатор MongoDB). Це потрібно для зв'язку між документами
   * (наприклад, між BookCopy та Book).
   *
   * ref: 'Book' - вказує, що це посилання (reference) на іншу колекцію, в даному
   * випадку на колекцію Book. Це дозволяє використовувати механізм "populate"
   * у Mongoose, тобто під час запиту можна автоматично підставити дані
   * з пов'язаного документа Book.
   *
   * type — визначає тип даних для властивості (в даному випадку ObjectId для зв'язків).
   * ref — створює зв'язок між колекціями, дозволяє використовувати populate.
   * required — робить поле обов'язковим.
   *
   * Слід розрізняти Types.ObjectId та _id (автоматично додається до кожного документу).
   * Types.ObjectId — це тип, а _id — це поле. Тобто type: Types.ObjectId говорить що
   * значенням цієї властивості буде _id якогось документа.
   */
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  /**
   * Перша пара ключ-значення в об'єкті параметрі декоратора @Prop -
   * enum: BookCopyStatus, говорить Mongoose, що в базі це поле може
   * містити тільки значення з цього enum. Mongoose автоматично перевіряє,
   * що значення відповідає одному з дозволених, і не дасть зберегти інше.
   *
   * Ключ enum використовується для визначення переліку дозволених значень,
   * незалежно від того, чи це TypeScript-enum, чи масив. Це стандартна назва
   * для такої поведінки у Mongoose.
   */
  @Prop({ enum: BookCopyStatus, default: BookCopyStatus.AVAILABLE })
  status: BookCopyStatus;

  @Prop()
  condition: string;
}

export const BookCopySchema = SchemaFactory.createForClass(BookCopy);
