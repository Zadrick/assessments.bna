import { EventEmitter } from 'node:events';
import { IHTTPServer } from '../lib/http-server/contracts';
import { IController } from './contracts';

const CONSTRUCT_EVENT = 'construct';

export default class Controller implements IController {
  private static eventEmitter: EventEmitter = new EventEmitter();

  constructor(
    public server: IHTTPServer,
  ) {
    Controller.eventEmitter.emit(CONSTRUCT_EVENT, this);
    Controller.eventEmitter.removeAllListeners();
  }

  onConstruct(cb: (ctx: IController) => void): void {
    Controller.eventEmitter.on(CONSTRUCT_EVENT, cb);
  }
}
