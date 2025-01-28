const uploadButtons = document.getElementsByClassName('upload-button')

// Loop through all the buttons and attach the event listener
Array.from(uploadButtons).forEach((button) => {
    button.addEventListener('click', () => {
        const fileInput = document.getElementById('file-input')
        if (fileInput) {
            fileInput.click(); // Trigger the file input dialog
        }
    });
});