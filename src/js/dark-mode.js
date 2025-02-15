const darkModeToggleButtons = document.getElementsByClassName('darkmode-button')

// Loop through all the buttons and attach the event listener
Array.from(darkModeToggleButtons).forEach((button) => {
    button.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const mode = document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled';
        localStorage.setItem('dark-mode', mode);
    });
});