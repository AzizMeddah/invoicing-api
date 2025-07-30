import { HttpException, HttpStatus } from '@nestjs/common';

export class TaxWithholdingAlreadyExistsException extends HttpException {
  constructor() {
    super('withholding.errors.tax_withholding_already_exist', HttpStatus.CONFLICT);
  }
}
