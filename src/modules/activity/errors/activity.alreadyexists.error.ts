import { HttpException, HttpStatus } from '@nestjs/common';

export class ActivityAlreadyExistsException extends HttpException {
  constructor() {
    super('activity.errors.activity_already_exist', HttpStatus.CONFLICT);
  }
}
