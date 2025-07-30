import { HttpException, HttpStatus } from '@nestjs/common';

export class TaxAlreadyExistsException extends HttpException {
  constructor() {
    super('tax.errors.tax_already_exist', HttpStatus.CONFLICT);
  }
}
