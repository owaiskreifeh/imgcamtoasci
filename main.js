
const RES = 32;

const canvasPreview = document.getElementById("canvas-preview");
const canvasBW = document.getElementById("canvas-bw");
const videoPreview = document.getElementById("video-preview");
const asciiPreview = document.getElementById("ascii-preview");
const file = document.getElementById("input-img");

file.addEventListener("change", previewFile, false);

// get canvas context
const ctxPreview = canvasPreview.getContext("2d");
const ctxBW = canvasBW.getContext("2d");

function toBW() {
  ctxBW.drawImage(canvasPreview, 0, 0);
  const width = canvasPreview.width;
  const imgData = ctxBW.getImageData(
    0,
    0,
    canvasPreview.width,
    canvasPreview.height
  );
  let txt = "", col = 0;
  for (i = 0; i < imgData.data.length; i += 4) {
    // min 0 max 765
    let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
    
    const str = "@%#$Xx=+;:. ";
    const threshold = 1;

    const colorInterpolated = interpolate(count, 0, 0, 765, 255);
    const charIndex = Math.floor(interpolate(count, 0, 0, 765, str.length - 1));
    const color = colorInterpolated > threshold * 255 ? 255 : colorInterpolated;
    txt += str[charIndex > threshold * (str.length-1) ? 11 : charIndex];
    if (++col == width) {
      txt += "</br>";
      col = 0;
    }

    asciiPreview.innerHTML = txt;
    imgData.data[i] = color;
    imgData.data[i + 1] = color;
    imgData.data[i + 2] = color;
    imgData.data[i + 3] = 255;
  }
  ctxBW.putImageData(imgData, 0, 0);
}

function previewFile() {
  console.log("previewFile");
  var tempImg = new Image();
  var file = document.querySelector("input[type=file]").files[0];
  var reader = new FileReader();

  reader.onloadend = function () {
    console.log("onloadend");
    tempImg.src = reader.result;
    tempImg.onload = function () {
        draw(tempImg)
    };
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    tempImg.src = "";
  }
}

async function readFromCamera() {
  let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
	videoPreview.srcObject = stream;
  videoPreview.width = RES;
  videoPreview.height = RES;
  draw(videoPreview);
}

function drawVideo() {
  draw(videoPreview);
  requestAnimationFrame(drawVideo)
}

function draw(img){
  const width = Math.min(img.width, RES) || RES;
  const height = width * (img.height / img.width) || RES;
  canvasBW.width = width;
  canvasBW.height = height;
  canvasPreview.width = width;
  canvasPreview.height = height;

  ctxPreview.drawImage(img, 0, 0, width, height);

  toBW();
}

function interpolate(x, x0, y0, x1, y1) {
  return y0 + (x - x0) * (y1 - y0) / (x1 - x0);
}