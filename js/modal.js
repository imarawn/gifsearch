// Get modal elements
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const closeModal = document.getElementById('close-modal');

// Function to open the modal
function openModal(imageUrl) {
    modalImage.src = imageUrl; // Set the image source
    modal.style.display = 'flex'; // Show the modal
}

// Close the modal when the close button is clicked
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    modalImage.src = ''; // Clear the image source
});

// Close the modal when clicking outside the image
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        modalImage.src = '';
    }
});
