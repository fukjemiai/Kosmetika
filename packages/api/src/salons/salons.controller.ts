import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Unprotected } from 'nest-keycloak-connect';
import { SalonsService } from './salons.service';
import { CreateSalonDto, UpdateSalonDto } from './salons.dto';

@ApiTags('Salons')
@Controller('api/salons')
export class SalonsController {
  constructor(private salonsService: SalonsService) {}

  @Get()
  @Unprotected()
  findAll(@Query('active') active?: string) {
    return this.salonsService.findAll(
      active !== undefined ? active === 'true' : undefined,
    );
  }

  @Get(':id')
  @Unprotected()
  findOne(@Param('id') id: string) {
    return this.salonsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  create(@Body() dto: CreateSalonDto) {
    return this.salonsService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateSalonDto) {
    return this.salonsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.salonsService.remove(id);
  }
}
