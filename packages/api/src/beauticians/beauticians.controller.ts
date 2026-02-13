import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Unprotected } from 'nest-keycloak-connect';
import { BeauticiansService } from './beauticians.service';
import {
  CreateBeauticianDto,
  UpdateBeauticianDto,
  AssignSalonDto,
  SetWorkingHoursDto,
} from './beauticians.dto';

@ApiTags('Beauticians')
@Controller('api/beauticians')
export class BeauticiansController {
  constructor(private beauticiansService: BeauticiansService) {}

  @Get()
  @Unprotected()
  findAll(@Query('salonId') salonId?: string) {
    return this.beauticiansService.findAll(salonId);
  }

  @Get('me')
  @ApiBearerAuth()
  findMe(@Req() req: any) {
    return this.beauticiansService.findByKeycloakId(req.user?.sub);
  }

  @Get(':id')
  @Unprotected()
  findOne(@Param('id') id: string) {
    return this.beauticiansService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  create(@Body() dto: CreateBeauticianDto, @Req() req: any) {
    return this.beauticiansService.create(dto, req.user?.sub);
  }

  @Put(':id')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateBeauticianDto) {
    return this.beauticiansService.update(id, dto);
  }

  @Post('salon')
  @ApiBearerAuth()
  assignToSalon(@Body() dto: AssignSalonDto) {
    return this.beauticiansService.assignToSalon(dto);
  }

  @Delete(':beauticianId/salon/:salonId')
  @ApiBearerAuth()
  removeFromSalon(
    @Param('beauticianId') beauticianId: string,
    @Param('salonId') salonId: string,
  ) {
    return this.beauticiansService.removeFromSalon(beauticianId, salonId);
  }

  @Post('working-hours')
  @ApiBearerAuth()
  setWorkingHours(@Body() dto: SetWorkingHoursDto) {
    return this.beauticiansService.setWorkingHours(dto);
  }

  @Get(':beauticianId/working-hours/:salonId')
  @Unprotected()
  getWorkingHours(
    @Param('beauticianId') beauticianId: string,
    @Param('salonId') salonId: string,
  ) {
    return this.beauticiansService.getWorkingHours(beauticianId, salonId);
  }

  @Post(':beauticianId/service/:serviceId')
  @ApiBearerAuth()
  assignService(
    @Param('beauticianId') beauticianId: string,
    @Param('serviceId') serviceId: string,
    @Body() body: { customPrice?: number; customDuration?: number },
  ) {
    return this.beauticiansService.assignService(
      beauticianId,
      serviceId,
      body.customPrice,
      body.customDuration,
    );
  }

  @Delete(':beauticianId/service/:serviceId')
  @ApiBearerAuth()
  removeService(
    @Param('beauticianId') beauticianId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.beauticiansService.removeService(beauticianId, serviceId);
  }
}
