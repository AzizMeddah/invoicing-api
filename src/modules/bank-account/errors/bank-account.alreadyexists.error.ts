import { HttpException, HttpStatus } from '@nestjs/common';

export class BankAccountAlreadyExistsException extends HttpException {
  constructor() {
    super('bank_account.errors.bank_account_already_exist', HttpStatus.CONFLICT);
  }
}
