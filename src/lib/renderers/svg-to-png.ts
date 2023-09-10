import Download from "../download.js";

export default function(svg: string, width: number, height: number, fileName: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  let blobURL = window.URL.createObjectURL(blob);
  let image = new Image();
  image.onload = () => {
    let canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    let context = canvas.getContext("2d");
    if (context) {
      context.drawImage(image, 0, 0, width, height);
    } else {
      throw new Error("Could not get context");
    }

    let png = canvas.toDataURL();

    Download(png, fileName);

    canvas.remove();
  };
  image.src = blobURL;
}
