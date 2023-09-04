import { IHTTPServer, IRequestHandler } from '../lib/http-server/contracts';

export type IController =  {
  server: IHTTPServer;
  onConstruct(cb: (ctx: IController) => void): void;
}

export interface IControllerConstructor {
  new (server: IHTTPServer): IController;
}

export interface IServer extends IHTTPServer {
  controllers: IControllerConstructor[];
}
