export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`).replace(/^_/, "");
}

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function pluralize(str: string): string {
  if (str.endsWith("s")) return str;
  if (str.endsWith("y")) return str.slice(0, -1) + "ies";
  return str + "s";
}
