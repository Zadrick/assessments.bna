import PrefixTree, { PrefixTreeNode } from '../../shared/data-structures/prefix-tree';
import { mapParams } from '../../shared/utils/url';
import { HTTP_METHODS, PATH_ELEMENTS, STATUS_CODES } from './enums';
import {
  IHandlerNode,
  IHandlerNodeWithRoute,
  IHandlerTreeKey,
  IHandlersTree,
  IParams,
  IPath,
  IRequestHandler,
  IRequestHandlerWithMeta
} from './contracts';
import { HTTPError } from './errors';

export class Params implements IParams {
  map = new Map<string, string>();

  constructor(params: Record<string, string>) {
    for (const param in params) {
      this.map.set(param, params[param]);
    }
  }

  get(param: string): string | undefined {
    return this.map.get(param);
  }
}

export class HandlerNodeWithRoute
extends PrefixTreeNode<string, IRequestHandler | null>
implements IHandlerNodeWithRoute {
  route: string;

  constructor(
    route: string,
    node: IHandlerNode,
  ) {
    super(node.root, node.parent, node.value);
    this.route = route;
  }
}

export class RequestHandlerWithMeta implements IRequestHandlerWithMeta {
  constructor(
    public handler: IRequestHandler,
    public params: IParams,
  ) {

  }
}

export default class HandlersTree
extends PrefixTree<IHandlerTreeKey, IRequestHandler | null>
implements IHandlersTree {
  constructor() {
    super(null);

    for (const method of Object.values(HTTP_METHODS)) this.append([method], null);
  }

  getMethodNode(method: HTTP_METHODS): IHandlerNode {
    return this.getNode(method)!;
  }

  setHandler(method: HTTP_METHODS, path: string, handler: IRequestHandler): void {
    const methodTree = this.getMethodNode(method);

    methodTree.set(path, handler);
  }

  findMatch(method: HTTP_METHODS, path: string): IHandlerNodeWithRoute | null {
    // TODO: Indexing by prefix to optimize
    const methodTree = this.getMethodNode(method);
    let handlerKey: string = '';

    for (const [key] of methodTree.children) {
      const pathPattern: RegExp = new RegExp(`^\\${key.replace(/\:[\w\-]+/g, '[\\w\\-]+')}$`);
      const isMatching: boolean = pathPattern.test(path);

      if (!isMatching) continue;

      const keyPathParamsLength: number = key.split(PATH_ELEMENTS.PATH_PARAM_SEPARATOR).length;
      const handlerKeyPathParamsLength: number = handlerKey.split(PATH_ELEMENTS.PATH_PARAM_SEPARATOR).length;

      const isMatchingBetter: boolean = keyPathParamsLength < handlerKeyPathParamsLength;

      if (isMatchingBetter || (isMatching && !handlerKey)) handlerKey = key;
    }

    const node = methodTree.getNode(handlerKey);

    return node ? new HandlerNodeWithRoute(handlerKey, node): null;
  }

  getHandlerWithMeta(method: HTTP_METHODS, path: IPath): IRequestHandlerWithMeta {
    const methodTree = this.getMethodNode(method);
    const allRoutesHandlerNode = methodTree.getNode(PATH_ELEMENTS.ALL_PATH_RESOLVER);

    const node: IHandlerNodeWithRoute | null = this.findMatch(method, path) ??
      (allRoutesHandlerNode && new HandlerNodeWithRoute(PATH_ELEMENTS.ALL_PATH_RESOLVER, allRoutesHandlerNode!) || null);

    if (!node) throw new HTTPError('not found', STATUS_CODES.NOT_FOUND);

    const handler: IRequestHandler = node.value!;

    const result: IRequestHandlerWithMeta = new RequestHandlerWithMeta(
      handler,
      new Params(mapParams(node.route, path)),
    );

    return result;
  }
}
