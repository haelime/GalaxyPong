import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtGuard } from "../auth/jwt.guard";
import { RecordsService } from "./records.service";

@Controller("records")
@UseGuards(JwtGuard)
export class RecordsController {
  constructor(private readonly records: RecordsService) {}

  @Get()
  list(@CurrentUser() user: CurrentUser) {
    return this.records.listForUser(user.sub);
  }
}
