import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ExchangeDocument = Exchange & Document;

export enum ExchangeStatus {
  REQUESTED = 'requested',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true, collection: 'exchanges' })
export class Exchange {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  initiatorId!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  responderId!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Item',
    required: true,
  })
  itemId!: Types.ObjectId;

  @Prop({
    enum: ExchangeStatus,
    default: ExchangeStatus.REQUESTED,
    index: true,
  })
  status!: ExchangeStatus;

  @Prop()
  dueDate!: Date;

  @Prop()
  returnedAt!: Date;
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);
