import { IncomingMessage, Server, ServerResponse } from 'node:http';
import { HTTP_METHODS, STATUS_CODES } from './enums';

import HandlersTree, { Params } from './handlers-tree';
import { IHTTPServer, IHandlersTree, IParams, IPath, IRequest, IRequestHandler, IRequestHandlerWithMeta, IResponse } from './contracts';
import { HTTPError } from './errors';
import { Socket } from 'node:net';

export class Request extends IncomingMessage implements IRequest {
  path: IPath;
  params: Params | null = null;
  query: URL['searchParams'] | null = null;

  constructor(socket: Socket) {
    super(socket);

    const {
      BLOB_SERVICE_PROTOCOL: PROTOCOL,
      BLOB_SERVICE_HOST: HOST,
      BLOB_SERVICE_PORT: PORT,
    } = process.env;

    const url: URL = new URL(this.url!, `${PROTOCOL}://${HOST}:${PORT}`);

    this.query = url.searchParams;
    this.path = url.pathname as IPath;
  }

  prepare(handlersTree: IHandlersTree): IRequestHandler {
    const {
      BLOB_SERVICE_PROTOCOL: PROTOCOL,
      BLOB_SERVICE_HOST: HOST,
      BLOB_SERVICE_PORT: PORT,
    } = process.env;

    const url: URL = new URL(this.url!, `${PROTOCOL}://${HOST}:${PORT}`);

    this.path = url.pathname as IPath;
    this.query = url.searchParams;

    const { handler, params } = handlersTree.getHandlerWithMeta(this.method as HTTP_METHODS, this.path);
    this.params = params;

    return handler;
  }
}

export class Response<T extends IncomingMessage = IncomingMessage> 
extends ServerResponse<T> implements IResponse<T> {
  json(dto: Object) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(dto));
  }
}
export default class HTTPServer implements IHTTPServer {
  private httpServer = new Server<typeof Request, typeof Response>({
    IncomingMessage: Request,
    ServerResponse: Response,
  });

  private handlersTree = new HandlersTree();

  constructor() {
    this.httpServer.on('request', async (request, response) => {
      try {
        const handler: IRequestHandler = request.prepare(this.handlersTree);

        await handler(request, response);
      } catch (error: any) {
        if (error instanceof HTTPError) {
          response.statusCode = error.code;
          response.end(error.message);
          return;
        }

        response.statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
        response.end();
        return;
      }
    });
  }

  get(path: IPath, handler: IRequestHandler): void {
    this.handlersTree.setHandler(HTTP_METHODS.GET, path, handler);
  }

  post(path: IPath, handler: IRequestHandler): void {
    this.handlersTree.setHandler(HTTP_METHODS.POST, path, handler);
  }

  put(path: IPath, handler: IRequestHandler): void {
    this.handlersTree.setHandler(HTTP_METHODS.PUT, path, handler);
  }

  patch(path: IPath, handler: IRequestHandler): void {
    this.handlersTree.setHandler(HTTP_METHODS.PATCH, path, handler);
  }

  delete(path: IPath, handler: IRequestHandler): void {
    this.handlersTree.setHandler(HTTP_METHODS.DELETE, path, handler);
  }

  listen(port: number, host: string, cb?: () => void): ReturnType<Server['listen']> {
    return this.httpServer.listen(port, host, cb);
  }
}
