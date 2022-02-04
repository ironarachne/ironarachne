'use strict';

export default function (href: string, name: string) {
  let link = document.createElement('a');
  link.download = name;
  link.style.opacity = '0';
  document.body.append(link);
  link.href = href;
  link.click();
  link.remove();
}
