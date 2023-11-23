export function renderSVGAsPNG(svg: string, width: number, height: number, outputId: string) {
  let output = document.getElementById(outputId);

  // This is a hack to get around the fact that the first time this runs, the output element is null
  if (output === null) {
    setTimeout(() => {
      renderSVGAsPNG(svg, width, height, outputId);
    }, 50);
    return;
  }

  let blob = new Blob([svg], { type: "image/svg+xml" });
  let blobURL = window.URL.createObjectURL(blob);

  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext("2d");

  let outputImage = new Image();

  outputImage.onload = function() {
    ctx.drawImage(outputImage, 0, 0);
    let pngDataUrl = canvas.toDataURL("image/png");
    output.src = pngDataUrl;
  };

  outputImage.src = blobURL;
}
