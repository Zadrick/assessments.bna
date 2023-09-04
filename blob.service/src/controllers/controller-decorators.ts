import { IHTTPServer, IPath, IRequestHandler } from '../lib/http-server/contracts';
import { IController } from './contracts';

function endpointDecoratorFactory(method: keyof Omit<IHTTPServer, 'listen'>) {
  return function (path: IPath) {
    return function (target: IController, key: string) {

      target.onConstruct((controller) => {
        const handler: IRequestHandler = (target as any)[key];

        controller.server[method](path, handler);
      });
    }
  }
}

export const Get = endpointDecoratorFactory('get');
export const Post = endpointDecoratorFactory('post');
export const Put = endpointDecoratorFactory('put');
export const Patch = endpointDecoratorFactory('patch');
export const Delete = endpointDecoratorFactory('delete');
