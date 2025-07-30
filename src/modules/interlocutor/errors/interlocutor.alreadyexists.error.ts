import { HttpException, HttpStatus } from '@nestjs/common';

export class InterlocutorAlreadyExistsException extends HttpException {
  constructor() {
    super('interlocutor.errors.interlocutor_email_already_taken', HttpStatus.CONFLICT);
  }
}
