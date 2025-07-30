import { HttpException, HttpStatus } from '@nestjs/common';

export class RoleRestrictedDeleteException extends HttpException {
  constructor() {
    super('Role cannot be deleted', HttpStatus.FORBIDDEN);
  }
}
