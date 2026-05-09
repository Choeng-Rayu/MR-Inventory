import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BatchesService } from './batches.service';
import { FindBatchesDto } from './dto/find-batches.dto';

@ApiTags('Batches')
@Controller('batches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all batches with pagination' })
  @ApiResponse({ status: 200, description: 'Batches retrieved successfully' })
  async findAll(@Query() query: FindBatchesDto) {
    return this.batchesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get batch by ID' })
  @ApiResponse({ status: 200, description: 'Batch retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batchesService.findOne(id);
  }
}
