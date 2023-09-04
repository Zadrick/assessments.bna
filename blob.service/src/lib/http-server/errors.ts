import { STATUS_CODES } from './enums';

export class HTTPError extends Error {
  code: STATUS_CODES;

  constructor(message: string, code: STATUS_CODES) {
    super(message);

    this.code = code;
  }
}
