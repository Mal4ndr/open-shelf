import * as Joi from 'joi';

export interface AppConfig {
  PORT: number;
  MONGO_URI_LOCAL: string;
  MONGO_URI_REMOTE?: string;
  NODE_ENV?: 'development' | 'production' | 'test';
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

export const validationSchema = Joi.object<AppConfig>({
  PORT: Joi.number(),
  MONGO_URI_LOCAL: Joi.string().required(),
  MONGO_URI_REMOTE: Joi.string().optional(),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
});
