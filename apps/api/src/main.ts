import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      "http://localhost:3000", // web
      "http://localhost:3002", // staff
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("Kosmetika API")
    .setDescription("API pro rezervační a fakturační systém kosmetických služeb")
    .setVersion("0.1.0")
    .addBearerAuth()
    .addTag("salons", "Správa salonů")
    .addTag("beauticians", "Správa kosmetiček")
    .addTag("services", "Správa služeb")
    .addTag("bookings", "Správa rezervací")
    .addTag("invoices", "Fakturace")
    .addTag("availability", "Dostupné termíny")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
