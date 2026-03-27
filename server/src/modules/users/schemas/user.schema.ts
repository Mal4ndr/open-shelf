import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  /**
   * опція 'select: false' говорить базі не повертати це поле за замовчуванням
   * у відповіді на запит.
   */
  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 0 })
  reputation: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
