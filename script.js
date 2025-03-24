document.getElementById('imageInput').addEventListener('change', function(event) {
  const img = document.getElementById('uploadedImage');
  const file = event.target.files[0];

  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          img.src = e.target.result;
          img.style.display = 'block';
      };
      reader.readAsDataURL(file);
  }
});

const imageContainer = document.getElementById('imageContainer');
const measurementBox = document.getElementById('measurementBox');
const sizeLabel = document.getElementById('sizeLabel');

let startX, startY, isDrawing = false;
let isDragging = false, offsetX = 0, offsetY = 0;
let boxVisible = true;
let isResizing = false, activeHandle = null;

function updateSizeLabel() {
  sizeLabel.innerText = `${measurementBox.offsetWidth} x ${measurementBox.offsetHeight}`;
}

imageContainer.addEventListener('mousedown', function(event) {
  const img = document.getElementById('uploadedImage');
  if (!img || img.style.display === 'none') return;

  const rect = img.getBoundingClientRect();
  startX = event.clientX - rect.left;
  startY = event.clientY - rect.top;

  if (event.target.classList.contains('resize-handle')) {
      isResizing = true;
      activeHandle = event.target;
      return;
  }

  if (event.target === measurementBox) {
      isDragging = true;
      offsetX = event.clientX - measurementBox.offsetLeft;
      offsetY = event.clientY - measurementBox.offsetTop;
      return;
  }

  isDrawing = true;
  measurementBox.style.left = startX + 'px';
  measurementBox.style.top = startY + 'px';
  measurementBox.style.width = '0px';
  measurementBox.style.height = '0px';
  measurementBox.style.display = 'block';
  boxVisible = true;

  function updateSize(event) {
      if (!isDrawing) return;

      let currentX = event.clientX - rect.left;
      let currentY = event.clientY - rect.top;
      let width = Math.abs(currentX - startX);
      let height = Math.abs(currentY - startY);

      if (width < 15 || height < 15) {
          measurementBox.style.display = 'none';
          return;
      }

      measurementBox.style.display = 'block';
      measurementBox.style.width = width + 'px';
      measurementBox.style.height = height + 'px';

      measurementBox.style.left = currentX < startX ? currentX + 'px' : startX + 'px';
      measurementBox.style.top = currentY < startY ? currentY + 'px' : startY + 'px';

      updateSizeLabel();
  }

  function stopDrawing() {
      isDrawing = false;
      let width = measurementBox.offsetWidth;
      let height = measurementBox.offsetHeight;

      if (width < 15 || height < 15) {
          measurementBox.style.display = 'none';
      }

      imageContainer.removeEventListener('mousemove', updateSize);
      imageContainer.removeEventListener('mouseup', stopDrawing);
  }

  imageContainer.addEventListener('mousemove', updateSize);
  imageContainer.addEventListener('mouseup', stopDrawing);
});

imageContainer.addEventListener('mousemove', function(event) {
  if (isDragging) {
      measurementBox.style.left = (event.clientX - offsetX) + 'px';
      measurementBox.style.top = (event.clientY - offsetY) + 'px';
      return;
  }

  if (isResizing && activeHandle) {
      let boxRect = measurementBox.getBoundingClientRect();
      let imgRect = document.getElementById('uploadedImage').getBoundingClientRect();
      let newX = event.clientX - imgRect.left;
      let newY = event.clientY - imgRect.top;

      let newWidth, newHeight;

      if (activeHandle.classList.contains('top-left')) {
          newWidth = boxRect.right - event.clientX;
          newHeight = boxRect.bottom - event.clientY;
          if (newWidth >= 15) {
              measurementBox.style.left = newX + 'px';
              measurementBox.style.width = newWidth + 'px';
          }
          if (newHeight >= 15) {
              measurementBox.style.top = newY + 'px';
              measurementBox.style.height = newHeight + 'px';
          }
      } else if (activeHandle.classList.contains('top-right')) {
          newWidth = event.clientX - boxRect.left;
          newHeight = boxRect.bottom - event.clientY;
          if (newWidth >= 15) measurementBox.style.width = newWidth + 'px';
          if (newHeight >= 15) {
              measurementBox.style.top = newY + 'px';
              measurementBox.style.height = newHeight + 'px';
          }
      } else if (activeHandle.classList.contains('bottom-left')) {
          newWidth = boxRect.right - event.clientX;
          newHeight = event.clientY - boxRect.top;
          if (newWidth >= 15) {
              measurementBox.style.left = newX + 'px';
              measurementBox.style.width = newWidth + 'px';
          }
          if (newHeight >= 15) measurementBox.style.height = newHeight + 'px';
      } else if (activeHandle.classList.contains('bottom-right')) {
          newWidth = event.clientX - boxRect.left;
          newHeight = event.clientY - boxRect.top;
          if (newWidth >= 15) measurementBox.style.width = newWidth + 'px';
          if (newHeight >= 15) measurementBox.style.height = newHeight + 'px';
      }

      updateSizeLabel();
  }
});

imageContainer.addEventListener('mouseup', function() {
  isDragging = false;
  isResizing = false;
  activeHandle = null;  

  if (measurementBox.offsetWidth < 15 || measurementBox.offsetHeight < 15) {
      measurementBox.style.display = 'none';
  }
});

document.addEventListener('keydown', function(event) {
  if (event.code === 'Space') {
      boxVisible = !boxVisible;
      measurementBox.style.display = boxVisible ? 'block' : 'none';
  }
});
