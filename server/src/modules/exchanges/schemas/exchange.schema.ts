import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExchangeDocument = Exchange & Document;

export enum ExchangeStatus {
  REQUESTED = 'requested',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Schema({ timestamps: true })
export class Exchange {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  initiatorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  responderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BookCopy', required: true })
  bookCopyId: Types.ObjectId;

  @Prop({
    enum: ExchangeStatus,
    default: ExchangeStatus.REQUESTED,
  })
  status: ExchangeStatus;

  @Prop()
  dueDate: Date;

  @Prop()
  returnedAt: Date;
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);
