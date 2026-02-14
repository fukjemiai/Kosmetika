import { Module } from "@nestjs/common";
import { BeauticiansController } from "./beauticians.controller";
import { BeauticiansService } from "./beauticians.service";

@Module({
  controllers: [BeauticiansController],
  providers: [BeauticiansService],
  exports: [BeauticiansService],
})
export class BeauticiansModule {}
