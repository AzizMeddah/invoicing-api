import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentConditionRestrictedDeleteException extends HttpException {
  constructor() {
    super('payment_condition.errors.payment_condition_delete_restriction', HttpStatus.FORBIDDEN);
  }
}
