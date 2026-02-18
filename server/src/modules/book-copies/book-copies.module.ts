import { Module } from '@nestjs/common';
import { BookCopiesService } from './book-copies.service';
import { BookCopiesController } from './book-copies.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { BookCopy, BookCopySchema } from './schemas/book-copy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BookCopy.name, schema: BookCopySchema },
    ]),
  ],
  providers: [BookCopiesService],
  controllers: [BookCopiesController],
})
export class BookCopiesModule {}
