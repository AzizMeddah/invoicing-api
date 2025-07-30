import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentConditionAlreadyExistsException extends HttpException {
  constructor() {
    super('payment_condition.errors.payment_condition_already_exist', HttpStatus.CONFLICT);
  }
}
