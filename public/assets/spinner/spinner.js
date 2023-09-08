// spinner.js

// Function to show the overlay spinner
function showOverlaySpinner() {
  const overlaySpinner = document.querySelector('.overlay-spinner');
  overlaySpinner.style.display = 'flex';
};

// Function to hide the overlay spinner
function hideOverlaySpinner() {
  const overlaySpinner = document.querySelector('.overlay-spinner');
  overlaySpinner.style.display = 'none';
};

function showSpinner(element) {
  const overlaySpinner = document.querySelector(element);
  overlaySpinner.style.display = 'flex';
};

function hideSpinner(element) {
  const overlaySpinner = document.querySelector(element);
  overlaySpinner.style.display = 'none';
};