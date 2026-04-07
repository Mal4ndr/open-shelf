import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop()
  ownerId!: string;

  @Prop()
  image!: string;

  @Prop({
    enum: ItemStatus,
    default: ItemStatus.AVAILABLE,
  })
  status!: string;

  @Prop({
    type: [String],
    enum: ItemAvailabilityType,
    default: ItemAvailabilityType.EXCHANGE,
  })
  availability!: ItemAvailabilityType[];
}

export const ItemSchema = SchemaFactory.createForClass(Item);
