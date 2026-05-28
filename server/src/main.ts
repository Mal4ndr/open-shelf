import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * app.enableCors() є необхідним щоб клієнт міг звертатися до сервера, а сервер в свою чергу обробляти
   * його запити. Без цього при умові що порти сервера та клієнта не є однаковими (а це нормально для
   * локальної розробки), вони не зможуть взаємодіяти.
   *
   * origin = протокол + хост + порт, в даному випадку: http://localhost:3001 — origin фронту,
   * http://localhost:3000 — origin сервера, виходить що фронт і бекенд на різних портах,
   * і відповідно браузер вважає це різними origin, і тому потрібен CORS.
   */
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
