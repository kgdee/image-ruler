const image = document.getElementById("image");
const imageInput = document.querySelector(".image-input");
const startPanel = document.querySelector(".start-panel");

const dropArea = document.querySelector("#drop-area");
dropArea.addEventListener("mousedown", startDrag);
dropArea.addEventListener("mousemove", drag);
dropArea.addEventListener("mouseup", stopDrag);
dropArea.addEventListener("mouseleave", stopDrag);
dropArea.addEventListener("wheel", (e) => zoom(e.deltaY));

let dragging = false;

let distanceX = 0;
let distanceY = 0;

let isFillScreen = false;
let animationInterval = null;
let animated = false;

const ruler = document.querySelector(".ruler")
const handle = document.querySelector(".resize-handle");
const sizeLabel = document.getElementById("sizeLabel");

let isDragging = false;
let isResizing = false;
let startX, startY, startWidth, startHeight, offsetX, offsetY;
const minSize = 50; // Minimum width and height

function startDrag(e) {
  if (animated) stopAnimation();

  dragging = true;

  document.body.style.cursor = "grabbing";

  let rect = image.getBoundingClientRect();
  distanceX = e.clientX - rect.x;
  distanceY = e.clientY - rect.y;
}

function drag(e) {
  if (!dragging) return;

  const posX = `${e.clientX - distanceX + image.clientWidth / 2}px`;
  const posY = `${e.clientY - distanceY + image.clientHeight / 2}px`;
  setImagePosition(posX, posY);
}

function stopDrag() {
  dragging = false;
  document.body.style.cursor = "grab";
}

function setImagePosition(left, top) {
  image.style.left = left;
  image.style.top = top;
}

function moveImage(x, y) {
  const left = `${parseFloat(getComputedStyle(image).left) + x}px`;
  const top = `${parseFloat(getComputedStyle(image).top) + y}px`;

  setImagePosition(left, top);
}

function resizeImage(width, height) {
  image.style.width = width;
  image.style.height = height;
}

function zoom(direction) {
  if (animated) stopAnimation();

  const scale = direction > 0 ? 0.9 : 1.1; // adjust the zoom speed as needed

  resizeImage(`${image.width * scale}px`, `${image.height * scale}px`);
}

function fillScreen() {
  isFillScreen = true;
  const screenRatio = window.innerWidth / window.innerHeight;
  resizeImage("100px", "auto");
  const imgRatio = image.width / image.height;
  const width = screenRatio > imgRatio ? "100%" : "auto";
  const height = screenRatio > imgRatio ? "auto" : "100%";
  resizeImage(width, height);

  setImagePosition("50%", "50%");
}

function fitScreen() {
  isFillScreen = false;
  resizeImage("100%", "100%");
  setImagePosition("50%", "50%");
}

function handleDragOver(event) {
  event.preventDefault();
}
function handleDrop(event) {
  event.preventDefault();

  const files = event.dataTransfer.files;
  handleFile(files);
}

async function handleFile(files) {
  try {
    if (files.length <= 0) return;

    const imageFile = files[0];

    if (!imageFile.type.startsWith("image/")) return;

    const imageUrl = await readFile(imageFile);
    displayImage(imageUrl);
  } catch (error) {
    console.error(error);
  }
}

function displayImage(imageUrl) {
  image.classList.remove("hidden");
  image.src = imageUrl;
  startPanel.classList.add("hidden");
  fillScreen();
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      resolve(e.target.result);
    };

    reader.onerror = function (error) {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.body.requestFullscreen();
  }
}

function startAnimation() {
  animated = true;
  fillScreen();
  resizeImage(`${image.width + 10}px`, `${image.height + 10}px`);
  image.style.transition = "1s";

  clearInterval(animationInterval);
  animationInterval = setInterval(animation, 500);
}

function stopAnimation() {
  animated = false;
  image.style.transition = null;
  clearInterval(animationInterval);
}

function animation() {
  const x = Math.random() * 12 - 6;
  const y = Math.random() * 12 - 6;
  const scale = 1 + Math.random() * 0.01;

  moveImage(x, y);
  image.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

document.addEventListener("keydown", function (event) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }

  if (event.code === "KeyF") toggleFullscreen();
  if (event.code === "KeyC") isFillScreen ? fitScreen() : fillScreen();
  if (event.code === "KeyA") animated ? stopAnimation() : startAnimation();

  if (event.code === "Equal" || event.code === "BracketRight") zoom(-1);
  if (event.code === "Minus" || event.code === "BracketLeft") zoom(1);

  switch (event.key) {
    case "ArrowUp":
      moveImage(0, -10);
      break;
    case "ArrowDown":
      moveImage(0, 10);
      break;
    case "ArrowLeft":
      moveImage(-10, 0);
      break;
    case "ArrowRight":
      moveImage(10, 0);
      break;
    default:
      break;
  }
});

// Move box
ruler.addEventListener("mousedown", (e) => {
  if (e.target === handle) return; // Prevent dragging when resizing
  isDragging = true;
  offsetX = e.clientX - ruler.offsetLeft;
  offsetY = e.clientY - ruler.offsetTop;
  ruler.style.cursor = "grabbing";
});

// Resize box
handle.addEventListener("mousedown", (e) => {
  isResizing = true;
  startX = e.clientX;
  startY = e.clientY;
  startWidth = ruler.offsetWidth;
  startHeight = ruler.offsetHeight;
  e.stopPropagation();
});

// Mouse move event
document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    ruler.style.left = `${e.clientX - offsetX}px`;
    ruler.style.top = `${e.clientY - offsetY}px`;
  }

  if (isResizing) {
    let newWidth = startWidth + (e.clientX - startX);
    let newHeight = startHeight + (e.clientY - startY);

    // Prevent negative/too small sizes
    newWidth = Math.max(newWidth, minSize);
    newHeight = Math.max(newHeight, minSize);

    ruler.style.width = `${newWidth}px`;
    ruler.style.height = `${newHeight}px`;
    updateSizeLabel(newWidth, newHeight);
  }
});

// Mouse up event (stop dragging or resizing)
document.addEventListener("mouseup", () => {
  isDragging = false;
  isResizing = false;
  ruler.style.cursor = "grab";
});

// Update the size label text
function updateSizeLabel(width, height) {
  sizeLabel.textContent = `${width} x ${height}`;
}

window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  console.error(error);
  alert(error);
});
