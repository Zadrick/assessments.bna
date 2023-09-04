export function mapParams(route: string, path: string): Record<string, string> {
  const result: Record<string, string> = {};

  const arrayedRoute = pathToArray(route);
  const arrayedPath = pathToArray(path);

  for (let i = 0; i < arrayedRoute.length; i++) {
    const routeEl = arrayedRoute[i];
    const isParam = routeEl.startsWith(':');

    if (isParam) result[routeEl.replace(':', '')] = arrayedPath[i];
  }

  return result;
}

export function pathToArray(path: string) {
  if (path === '/') return ['/'];

  return path.split('/');
}
