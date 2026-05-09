import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all suppliers with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.suppliersService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  @ApiResponse({ status: 409, description: 'Duplicate supplier name' })
  async create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 400, description: 'Supplier has associated batches' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(id);
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: 'Get supplier inventory history' })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'product_id', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Inventory history retrieved successfully' })
  async getInventoryHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('product_id') productId?: string,
  ) {
    return this.suppliersService.getInventoryHistory(
      id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      productId ? parseInt(productId) : undefined,
    );
  }
}
