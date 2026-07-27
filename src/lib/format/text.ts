export function list(items: string[]) {
  if (items.length === 0) {
    return '';
  }

  let result = '';

  for (let i = 0; i < items.length; i++) {
    result += '- ' + items[i] + '\n';
  }

  result += '\n';

  return result;
}

export function header(text: string) {
  return '\n' + text + '\n\n';
}
