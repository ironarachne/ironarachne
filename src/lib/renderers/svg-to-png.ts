import Download from '$lib/download';

export default function (svg: string, width: number, height: number, fileName: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const blobURL = window.URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(image, 0, 0, width, height);
    } else {
      throw new Error('Could not get context');
    }

    const png = canvas.toDataURL();

    Download(png, fileName);

    canvas.remove();
  };
  image.src = blobURL;
}
