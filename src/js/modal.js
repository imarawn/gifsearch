// Get modal elements
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const closeModal = document.getElementById('close-modal');

// Function to open the modal
function openModal(imageUrl) {
    modalImage.src = imageUrl; // Set the image source
    modal.style.display = 'flex'; // Show the modal
}


