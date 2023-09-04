import { IncomingMessage, Server, ServerResponse } from 'node:http';
import { Params } from './handlers-tree';
import { IPrefixTree, IPrefixTreeNode } from '../../shared/data-structures/prefix-tree';
import { HTTP_METHODS } from './enums';

export interface IRequest extends IncomingMessage {
  path?: IPath;
  params?: Params | null;
  query: URL['searchParams'] | null;

  prepare(handlersTree: IHandlersTree): IRequestHandler;
}

export interface IResponse<Request extends IncomingMessage = IncomingMessage>
extends ServerResponse<Request> {
  json(dto: Object): void;
}

export interface IHandlerNodeWithRoute extends IHandlerNode {
  route: string;
}

export interface IParams {
  map: Map<string, string>;
  get(param: string): string | undefined;
}

export interface IRequestHandlerWithMeta {
  handler: IRequestHandler;
  params: IParams;
}

export interface IHandlersTree extends IPrefixTree<IHandlerTreeKey, IRequestHandler | null> {
  getMethodNode(method: HTTP_METHODS): IHandlerNode;
  setHandler(method: HTTP_METHODS, path: string, handler: IRequestHandler): void;
  findMatch(method: HTTP_METHODS, path: string): IHandlerNodeWithRoute | null;
  getHandlerWithMeta(method: HTTP_METHODS, url: IPath): IRequestHandlerWithMeta;
}

export interface IHTTPServer {
  get(path: IPath, handler: IRequestHandler): void;
  post(path: IPath, handler: IRequestHandler): void;
  put(path: IPath, handler: IRequestHandler): void;
  patch(path: IPath, handler: IRequestHandler): void;
  delete(path: IPath, handler: IRequestHandler): void;

  listen(port: number, host: string, cb?: () => void): ReturnType<Server['listen']>;
}

export type IRequestHandler = (req: IRequest, res: IResponse) => void;
export type IHandlerNode = IPrefixTreeNode<string, IRequestHandler | null>;
export type IHandlerTreeKey = HTTP_METHODS | string;

export type IPathParam = `/:${string}`;
export type IPath = `/${string}` | IPathParam;
