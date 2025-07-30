import { HttpException, HttpStatus } from '@nestjs/common';

export class FirmAlreadyExistsException extends HttpException {
  constructor() {
    super('firm.errors.firm_name_already_taken', HttpStatus.CONFLICT);
  }
}

export class TaxIdNumberDuplicateException extends HttpException {
  constructor() {
    super('firm.errors.tax_number_already_taken', HttpStatus.CONFLICT);
  }
}
