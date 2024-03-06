export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (token == null) {
    return '' + token;
  }

  if (token.name) {
    return `${token.name}`;
  }

  if (token.constructor?.name) {
    return `${token.constructor.name}`;
  }

  return token.toString();
}
