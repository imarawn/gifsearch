// Get modal elements
const modal = document.querySelector('.modal');
const modalImage = document.getElementById('modal-image');

// Function to open the modal
function openImageModal(imageUrl) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    modalImage.src = imageUrl; // Set the image source
    modal.classList.add("show");
}

function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.classList.remove("show");
}

document.addEventListener("click", function (event) {
    const modal = document.getElementById('image-modal');
    const loginModal = document.getElementById('login-modal');
    if (event.target === modal) {
        closeModal();
    } else if (event.target === loginModal) {
        closeLoginModal();
    }
});

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.classList.remove("show");
}

function openLoginModal() {
    const modal = document.getElementById('login-modal');
    renderModalContent();
    modal.classList.add("show");
}

// Function to render the modal content
async function renderModalContent() {
    const modalContent = document.getElementById('modal-content');
    const user = await checkSession();
    modalContent.innerHTML = '';  // Clear previous content

    if (user) {
        // User is logged in - Show the logged-in screen
        const email = user.email;
        modalContent.className = 'login-modal-content';
        modalContent.innerHTML = `
            <h2 class="header">Welcome, ${email}!</h2>
            <button class="button" onclick="logout()">Logout</button>
        `;

    } else {
        // User is not logged in - Show the login form
        modalContent.innerHTML = `
            <form id="login-form" class="login-modal-content">
                <h2 id="login-title" class="header" data-translate="login.title">Login</h2>
                <input type="text" id="email" name="email" class="login-input" placeholder="Email" required>
                <input type="password" id="password" name="password" class="login-input" placeholder="Password" required>
                <button id="login-button" class="button" type="submit" data-translate="buttons.login">Login</button>
                <button id="signup-button" class="button" onclick="signUp()" data-translate="buttons.signUp">Sign Up</button>
            </form>
        `;

        // Add event listener for the dynamically created form
        const form = document.getElementById('login-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await login();
        });
    }
}


