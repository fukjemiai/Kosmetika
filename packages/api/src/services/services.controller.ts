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
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './services.dto';

@ApiTags('Services')
@Controller('api/services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  @Unprotected()
  findAll(
    @Query('salonId') salonId?: string,
    @Query('category') category?: string,
  ) {
    return this.servicesService.findAll(salonId, category);
  }

  @Get(':id')
  @Unprotected()
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
