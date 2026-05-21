import cookieParser from "cookie-parser";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin, credentials: true });
  app.setGlobalPrefix("api");

  await app.listen(Number(process.env.API_PORT ?? 3000), "0.0.0.0");
}

bootstrap();
