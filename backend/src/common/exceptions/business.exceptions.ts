import { HttpException, HttpStatus } from '@nestjs/common';

// REQ-15.7: Insufficient stock exception
export class InsufficientStockException extends HttpException {
  constructor(available: number, requested: number) {
    super(
      {
        message: 'Insufficient stock',
        details: { available, requested },
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class BatchDepletedException extends HttpException {
  constructor(batchCode: string) {
    super(`Batch ${batchCode} is already depleted`, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class InvalidUnitException extends HttpException {
  constructor(unitId: number, productId: number) {
    super(`Unit ${unitId} does not belong to product ${productId}`, HttpStatus.BAD_REQUEST);
  }
}
