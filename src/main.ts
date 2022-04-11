import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Telemetría Inteccon')
    .setDescription('Hospital General de Medellín')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('docs', app, document);

  await app.listen(
    process.env.SERVER_PORT || 3001,
    process.env.SERVER_HOST,
    () => {
      console.log(' ');
      console.log(
        `--- SERVIDOR INICIADO POR EL PUERTO: ${process.env.SERVER_PORT}`,
      );
    },
  );
}
bootstrap();
