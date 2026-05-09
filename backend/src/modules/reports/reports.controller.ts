import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('inventory')
  @ApiOperation({ summary: 'Generate inventory report' })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({ name: 'supplier_id', required: false, type: Number })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async inventoryReport(
    @Res() res: Response,
    @Query('category_id') categoryId?: string,
    @Query('supplier_id') supplierId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('format') format: string = 'json',
  ) {
    const data = await this.reportsService.generateInventoryReport(
      categoryId ? parseInt(categoryId) : undefined,
      supplierId ? parseInt(supplierId) : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    if (format === 'csv') {
      const flatData = Object.values(data.grouped).flatMap((g: any) => g.batches);
      const csv = this.reportsService.convertToCsv(flatData, ['id', 'batchCode', 'productId', 'quantity', 'unitCost', 'importDate', 'expiryDate']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
      return res.send(csv);
    }

    return res.json(data);
  }

  @Get('expiry')
  @ApiOperation({ summary: 'Generate expiry report' })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async expiryReport(
    @Res() res: Response,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('format') format: string = 'json',
  ) {
    const data = await this.reportsService.generateExpiryReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    if (format === 'csv') {
      const flatData = Object.values(data).flatMap((g: any) => g.batches);
      const csv = this.reportsService.convertToCsv(flatData, ['id', 'batchCode', 'productId', 'quantity', 'expiryDate']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expiry-report.csv');
      return res.send(csv);
    }

    return res.json(data);
  }

  @Get('supplier-performance')
  @ApiOperation({ summary: 'Generate supplier performance report' })
  @ApiQuery({ name: 'supplier_id', required: false, type: Number })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async supplierPerformanceReport(
    @Res() res: Response,
    @Query('supplier_id') supplierId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('format') format: string = 'json',
  ) {
    const data = await this.reportsService.generateSupplierPerformanceReport(
      supplierId ? parseInt(supplierId) : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    if (format === 'csv') {
      const csv = this.reportsService.convertToCsv(data as any[], ['supplierId', 'totalQuantity', 'totalValue', 'expiredCount']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=supplier-performance-report.csv');
      return res.send(csv);
    }

    return res.json(data);
  }
}
