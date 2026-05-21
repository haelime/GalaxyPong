import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { EmailModule } from "./email/email.module";
import { GameModule } from "./game/game.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RecordsModule } from "./records/records.module";
import { UsersModule } from "./users/users.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    ChatModule,
    GameModule,
    RecordsModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
