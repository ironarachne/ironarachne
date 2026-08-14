export default function downloadInBrowser(href: string, name: string) {
  const link = document.createElement('a');
  link.download = name;
  link.style.opacity = '0';
  document.body.append(link);
  link.href = href;
  link.click();
  link.remove();
}

export { default as saveSvgAsPng } from './svg_to_png';
