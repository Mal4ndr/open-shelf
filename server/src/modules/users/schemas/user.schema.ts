import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ default: 0 })
  reputation!: number;

  @Prop()
  name!: string;

  @Prop()
  avatar!: string;

  @Prop()
  city!: string;

  @Prop()
  bio!: string;

  @Prop({ default: 0 })
  rating!: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
