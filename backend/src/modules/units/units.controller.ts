import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@ApiTags('Units')
@Controller('products/:productId/units')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UnitsController {
  constructor(private unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get units for a product' })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully' })
  async findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.unitsService.findByProduct(productId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a unit to a product' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  @ApiResponse({ status: 400, description: 'Product already has base unit' })
  async create(@Param('productId', ParseIntPipe) productId: number, @Body() dto: CreateUnitDto) {
    return this.unitsService.create(productId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a unit' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUnitDto) {
    return this.unitsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  @ApiResponse({ status: 400, description: 'Unit has associated batches' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitsService.remove(id);
  }
}
