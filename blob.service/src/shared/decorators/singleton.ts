export default function Singleton<T extends new (...args: any[]) => any>(constructor: T): T {
  let instance: T;

  return class {
    constructor(...args: any[]) {
      if (!instance) instance = new constructor(...args);

      return instance!;
    }
  } as T
}