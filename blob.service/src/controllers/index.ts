import HTTPServer from '../lib/http-server';
import { IControllerConstructor, IServer } from './contracts';
import RootController from './root';

class Server extends HTTPServer implements IServer {
  controllers: IControllerConstructor[] = [
    RootController,
  ];

  constructor() {
    super();

    this.controllers.forEach(controller => {
      new controller(this);
    });
  }
}

const server = new Server();

export default server;
