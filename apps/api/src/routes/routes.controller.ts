import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { AddStopDto } from './dto/add-stop.dto';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  findAll(@Query('schoolId') schoolId?: string) {
    return this.routesService.findAll(schoolId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRouteDto) {
    return this.routesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return this.routesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routesService.remove(id);
  }

  @Post(':id/stops')
  addStop(@Param('id') id: string, @Body() dto: AddStopDto) {
    return this.routesService.addStop(id, dto);
  }

  @Patch(':routeId/stops/:stopId')
  updateStop(
    @Param('routeId') routeId: string,
    @Param('stopId') stopId: string,
    @Body('name') name: string,
  ) {
    return this.routesService.updateStop(routeId, stopId, name);
  }

  @Delete(':routeId/stops/:stopId')
  removeStop(@Param('routeId') routeId: string, @Param('stopId') stopId: string) {
    return this.routesService.removeStop(routeId, stopId);
  }
}
