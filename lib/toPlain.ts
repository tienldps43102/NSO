export function toPlain<T>(x: T): T {
  if (!x) return x;
  return JSON.parse(JSON.stringify(x));
}
