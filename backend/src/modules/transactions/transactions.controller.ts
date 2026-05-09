import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { FindTransactionsDto } from './dto/find-transactions.dto';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions with pagination' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async findAll(@Query() query: FindTransactionsDto) {
    return this.transactionsService.findAll(query);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent transactions' })
  @ApiResponse({ status: 200, description: 'Recent transactions retrieved successfully' })
  async getRecent(@Query('limit') limit: string) {
    const parsedLimit = parseInt(limit) || 10;
    return this.transactionsService.getRecentTransactions(parsedLimit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }
}
