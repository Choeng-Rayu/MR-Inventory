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
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async inventoryReport(
    @Res() res: Response,
    @Query('category_id') categoryId?: string,
    @Query('supplier_id') supplierId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format: string = 'json',
  ) {
    const data = await this.reportsService.generateInventoryReport(
      categoryId ? parseInt(categoryId) : undefined,
      supplierId ? parseInt(supplierId) : undefined,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );

    if (format === 'csv') {
      const csv = this.reportsService.convertToCsv(data.data, ['productId', 'productName', 'category', 'totalQuantity', 'unit', 'value']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
      return res.send(csv);
    }

    return res.json(data);
  }

  @Get('expiry')
  @ApiOperation({ summary: 'Generate expiry report' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async expiryReport(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format: string = 'json',
  ) {
    const data = await this.reportsService.generateExpiryReport(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );

    if (format === 'csv') {
      const flatData = [
        ...data.expired,
        ...data.nearExpiry7d,
        ...data.nearExpiry30d,
        ...data.nearExpiry90d,
      ];
      const csv = this.reportsService.convertToCsv(flatData, ['batchCode', 'productName', 'supplier', 'quantity', 'expiryDate', 'daysUntilExpiry']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expiry-report.csv');
      return res.send(csv);
    }

    return res.json(data);
  }

  @Get('supplier-performance')
  @ApiOperation({ summary: 'Generate supplier performance report' })
  @ApiQuery({ name: 'supplier_id', required: false, type: Number })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async supplierPerformanceReport(
    @Res() res: Response,
    @Query('supplier_id') supplierId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format: string = 'json',
  ) {
    const data = await this.reportsService.generateSupplierPerformanceReport(
      supplierId ? parseInt(supplierId) : undefined,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );

    if (format === 'csv') {
      const csv = this.reportsService.convertToCsv(data.data, ['supplierId', 'supplierName', 'totalBatches', 'totalQuantity', 'totalValue', 'percentageOfTotal']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=supplier-performance-report.csv');
      return res.send(csv);
    }

    return res.json(data);
  }

  @Get('movement')
  @ApiOperation({ summary: 'Generate stock movement report' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async stockMovementReport(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format: string = 'json',
  ) {
    const data = await this.reportsService.generateStockMovementReport(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );

    if (format === 'csv') {
      const csv = this.reportsService.convertToCsv(data.data, ['productId', 'productName', 'checkInQuantity', 'checkOutQuantity', 'netChange']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=stock-movement-report.csv');
      return res.send(csv);
    }

    return res.json(data);
  }
}
