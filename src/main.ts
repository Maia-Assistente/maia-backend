import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.enableCors();

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Maia Backend API')
    .setDescription('API para gerenciamento financeiro pessoal')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header'
      },
      'JWT-auth' // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true
    }
  });

  await app.listen(process.env.PORT || 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT || 3000}`
  );
  console.log(
    `Swagger documentation available at: http://localhost:${process.env.PORT || 3000}/api/docs`
  );
}
bootstrap();
