export interface IPrefixTreeNode<K extends string, V = any> {
  value?: V;
  root: IPrefixTree<K, V> | null;
  parent: IPrefixTreeNode<K, V> | null;
  children: Map<K, IPrefixTreeNode<K, V>>;

  getNode(key: K): IPrefixTreeNode<K, V> | undefined;
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  append(key: K[], value: V): void;
  find(key: K[]): IPrefixTreeNode<K, V> | null;
}

export interface IPrefixTree<K extends string, V = any> extends IPrefixTreeNode<K, V> {
  root: null;
  parent: null;
}

export enum PREFIX_TREE_ERROR_CODES {
  KeyNotFound,
}

export class PrefixTreeError extends Error {
  code: PREFIX_TREE_ERROR_CODES;

  constructor(message: string, code: PREFIX_TREE_ERROR_CODES) {
    super(message);

    this.code = code;
  }
}

export class PrefixTreeNode<K extends string, V = any> implements IPrefixTreeNode<K, V> {
  value?: V | undefined;
  root: IPrefixTreeNode<K, V>['root'];
  parent: IPrefixTreeNode<K, V>['parent'];
  children = new Map<K, IPrefixTreeNode<K, V>>;

  constructor(root: IPrefixTreeNode<K, V>['root'], parent: PrefixTreeNode<K, V>['parent'], value?: V) {
    this.root = root;
    this.parent = parent;
    this.value = value;
  }

  getNode(key: K): IPrefixTreeNode<K, V> | undefined {
    return this.children.get(key);
  }

  get(key: K): V | undefined {
    return this.getNode(key)?.value;
  }

  set(key: K, value: V): void {
    const node = this.getNode(key);

    if (node) {
      node.value = value;
      return;
    }

    this.children.set(key, new PrefixTreeNode(this.root, this, value));
  }

  append(path: K[], value: V): void {
    let head: IPrefixTreeNode<K, V> | IPrefixTree<K, V> = this;

    path.forEach((nodeKey, index) => {
      const isLastNode = path.length - 1 === index;

      if (isLastNode) head.set(nodeKey, value);

      if (!head.getNode(nodeKey)) head.children.set(nodeKey, new PrefixTreeNode<K, V>(this.root, this));

      head = head.getNode(nodeKey)!;
    });
  }

  find(path: K[]): IPrefixTreeNode<K, V> | IPrefixTree<K, V> | null {
    function reducer(
        prev: IPrefixTreeNode<K, V> | IPrefixTree<K, V>,
        curr: K, index: number,
      ): IPrefixTreeNode<K, V> | IPrefixTree<K, V> {
      const node = prev.getNode(curr);

      if (!node) {
        const message = `missing node with key: ${curr} at position: ${index}`;

        throw new PrefixTreeError(message, PREFIX_TREE_ERROR_CODES.KeyNotFound);
      }

      return node;
    }

    try {
      return path.reduce(reducer, this);
    } catch (error) {
      if (error instanceof PrefixTreeError && error.code === PREFIX_TREE_ERROR_CODES.KeyNotFound) return null;

      throw error;
    };
  }
}

export default class PrefixTree<K extends string, V = any>
extends PrefixTreeNode<K, V>
  implements IPrefixTree<K, V> {
  
  root: null = null;
  parent: null = null;

  constructor(value?: V) {
    super(null, null, value);
  }
}
