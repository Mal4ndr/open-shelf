import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ItemDocument = Item & Document;

export enum ItemStatus {
  AVAILABLE = 'available',
  BORROWED = 'borrowed',
}

export enum ItemAvailabilityType {
  LEND = 'lend',
  EXCHANGE = 'exchange',
  RENT = 'rent',
}

@Schema({ timestamps: true, collection: 'items' })
export class Item {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description!: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Item', // ref: 'Item'?
    required: true,
    index: true,
  })
  ownerId!: Types.ObjectId;

  @Prop()
  image!: string;

  @Prop({
    enum: ItemStatus,
    default: ItemStatus.AVAILABLE,
    index: true,
  })
  status!: string;

  @Prop({
    type: [String],
    enum: ItemAvailabilityType,
    default: ItemAvailabilityType.LEND,
  })
  availability!: ItemAvailabilityType[];
}

export const ItemSchema = SchemaFactory.createForClass(Item);
