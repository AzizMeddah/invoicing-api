import { HttpException, HttpStatus } from '@nestjs/common';

export class EnterpriseNameAlreadyExistsException extends HttpException {
  constructor() {
    super('cabinet.errors.firm_name_already_taken', HttpStatus.CONFLICT);
  }
}

export class TaxIdNumberDuplicateException extends HttpException {
  constructor() {
    super('cabinet.errors.tax_number_already_taken', HttpStatus.CONFLICT);
  }
}
