const uploadButtons = document.getElementsByClassName('upload-button')

Array.from(uploadButtons).forEach((button) => {
    button.addEventListener('click', () => {
        const fileInput = document.getElementById('file-input')
        if (fileInput) {
            fileInput.click();
        }
    });
});