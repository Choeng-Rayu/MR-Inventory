import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckInService, CheckOutService, AdjustmentService } from './inventory.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AdjustmentDto } from './dto/adjustment.dto';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InventoryController {
  constructor(
    private checkInService: CheckInService,
    private checkOutService: CheckOutService,
    private adjustmentService: AdjustmentService,
  ) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Check in new inventory' })
  @ApiResponse({ status: 201, description: 'Inventory checked in successfully' })
  @ApiResponse({ status: 422, description: 'Validation error' })
  async checkIn(@Body() dto: CheckInDto, @Request() req) {
    return this.checkInService.checkIn(dto, req.user.id);
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Check out inventory using FIFO' })
  @ApiResponse({ status: 201, description: 'Inventory checked out successfully' })
  @ApiResponse({ status: 422, description: 'Insufficient stock' })
  async checkOut(@Body() dto: CheckOutDto, @Request() req) {
    return this.checkOutService.checkOut(dto, req.user.id);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust inventory quantity' })
  @ApiResponse({ status: 201, description: 'Inventory adjusted successfully' })
  @ApiResponse({ status: 422, description: 'Would result in negative quantity' })
  async adjust(@Body() dto: AdjustmentDto, @Request() req) {
    return this.adjustmentService.adjust(dto, req.user.id);
  }
}
