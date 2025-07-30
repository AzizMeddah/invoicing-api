import { HttpException, HttpStatus } from '@nestjs/common';

export class InterlocutorRestrictedDeleteException extends HttpException {
  constructor() {
    super('interlocutor.errors.deletion_restricted', HttpStatus.FORBIDDEN);
  }
}
