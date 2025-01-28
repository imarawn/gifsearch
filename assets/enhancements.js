let searchTimeout; // Timeout for debounce functionality in manual search

// Drag-and-Drop Upload
const dragDropArea = document.getElementById('drag-drop-area');
const fileInput = document.getElementById('file-input');

// Add dragover event to highlight drop area
dragDropArea.addEventListener('dragover', (event) => {
    event.preventDefault(); // Prevent default browser behavior
    dragDropArea.classList.add('dragging'); // Add dragging highlight
});

// Remove highlight on dragleave
dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('dragging'); // Remove dragging highlight
});

// Handle file drop
dragDropArea.addEventListener('drop', (event) => {
    event.preventDefault(); // Prevent default browser behavior
    dragDropArea.classList.remove('dragging'); // Remove dragging highlight
    const file = event.dataTransfer.files[0]; // Get dropped file
    if (file) {
        fileInput.files = event.dataTransfer.files; // Assign file to input
        loadAndFetchEmoticons(); // Load and fetch data from file
    }
});

// Simulate file input click when drop area is clicked
dragDropArea.addEventListener('click', () => fileInput.click());

// Utility function to introduce a delay (useful for rate-limiting API calls)
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Load and fetch emoticons from the uploaded file
async function loadAndFetchEmoticons() {
    const resultsDiv = document.getElementById('results'); // Results container
    const uploadStatus = document.getElementById('upload-status'); // Status message

    if (fileInput.files.length === 0) {
        alert('Please choose a file.'); // Alert if no file is selected
        return;
    }

    const file = fileInput.files[0]; // Get selected file
    const text = await file.text(); // Read file content
    const slugs = text.split('\n').map((slug) => slug.trim()).filter((slug) => slug !== ''); // Process slugs

    if (slugs.length === 0) {
        alert('The file is empty or contains invalid data.'); // Alert if file has no valid slugs
        return;
    }

    // Display success message
    uploadStatus.textContent = `File "${file.name}" uploaded successfully with ${slugs.length} slugs!`;
    uploadStatus.style.display = 'block'; // Show the status message

    resultsDiv.innerHTML = ''; // Clear previous results

    // Loop through each slug and fetch data
    for (const slug of slugs) {
        try {
            const response = await fetch(`https://emote.highwebmedia.com/autocomplete?slug=${slug}`); // Fetch API
            if (!response.ok) continue; // Skip if response is not OK

            const data = await response.json(); // Parse JSON response
            const exactEmote = data.emoticons.find((emote) => emote.slug === slug); // Find exact emote
            if (exactEmote) await displayEmote(exactEmote, resultsDiv); // Display emote if found
        } catch (error) {
            console.error(`Error fetching or processing slug ${slug}:`, error); // Log errors
        }
        await delay(40); // Add delay between API calls
    }
}

// Display an individual emote
async function displayEmote(emote, parentElement, isFavorite = false) {
    const emoteBox = document.createElement('div'); // Create emote container
    emoteBox.className = 'emote-box';

    const img = document.createElement('img'); // Create image element
    img.src = emote.url; // Set image source
    img.alt = emote.slug; // Set alt text
    img.className = 'emote-image';

    // Check dimensions when the image loads
    img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        const dimensionsLabel = document.createElement('div'); // Create dimensions label
        dimensionsLabel.textContent = `${width}x${height}`; // Display dimensions
        dimensionsLabel.className = 'dimensions';

        if (width > 250 || height > 80) {
            emoteBox.style.backgroundColor = '#eb0c0c'; // Highlight oversized emotes
        }

        emoteBox.appendChild(dimensionsLabel); // Add dimensions label to box
    };

    img.addEventListener('click', () => copyToClipboard(`:${emote.slug}`)); // Copy emote slug on click

    const label = document.createElement('div'); // Create emote name label
    label.textContent = `:${emote.slug}`; // Set emote slug text
    label.className = 'emote-name';

    const favoriteButton = document.createElement('button'); // Create favorite button
    favoriteButton.className = `favorite-button ${isFavorite ? 'favorited' : ''}`;
    favoriteButton.innerHTML = isFavorite ? '★' : '☆';
    favoriteButton.onclick = () => {
        if (isFavorite) {
            removeFavorite(emote.slug); // Remove from favorites
        } else {
            addFavorite(emote); // Add to favorites
        }
    };

    emoteBox.appendChild(img); // Add image to emote box
    emoteBox.appendChild(label); // Add label to emote box
    emoteBox.appendChild(favoriteButton); // Add favorite button to emote box
    parentElement.appendChild(emoteBox); // Append emote box to parent container
}

// Copy text to clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea'); // Create textarea element
    textarea.value = text; // Set text content
    document.body.appendChild(textarea); // Append to body
    textarea.select(); // Select text
    document.execCommand('copy'); // Execute copy command
    document.body.removeChild(textarea); // Remove textarea element
}

// Fetch emoticon data based on manual input
async function fetchManualSlug() {
    const manualInput = document.getElementById('manual-slug-input'); // Get input field
    const resultsDiv = document.getElementById('results'); // Results container
    const slug = manualInput.value.trim(); // Get input value
    if (!slug) {
        return; // Exit if input is empty
    }
    const response = await fetch(`https://emote.highwebmedia.com/autocomplete?slug=${slug}`); // Fetch API
    const data = await response.json(); // Parse JSON response
    resultsDiv.innerHTML = ''; // Clear previous results
    for (const emote of data.emoticons) {
        displayEmote(emote, resultsDiv); // Display each emote
    }
}

// Save slugs as a downloadable text file
function downloadSlugs() {
    const slugs = Array.from(document.querySelectorAll('.emote-name')).map((div) => div.textContent); // Collect all slugs
    const blob = new Blob([slugs.join('\n')], { type: 'text/plain' }); // Create text file blob
    const a = document.createElement('a'); // Create download link
    a.href = URL.createObjectURL(blob); // Set file URL
    a.download = 'emote_slugs.txt'; // Set file name
    a.click(); // Trigger download
}

// Initialize dark mode and favorites toggle
// Initialize dark mode and favorites toggle
document.addEventListener('DOMContentLoaded', () => {
    const darkmodetoggleButton = document.getElementById('dark-mode-toggle');
    const favoritetoggleButton = document.getElementById('favorite-toggle'); // Reference the toggle button
    const favoriteSection = document.getElementById('favorites'); // Reference the favorites section
    const favoriteEmotesDiv = document.getElementById('favorite-emotes');

    // Load dark mode state from local storage
    const currentMode = localStorage.getItem('dark-mode');
    if (currentMode === 'enabled') {
        document.body.classList.add('dark-mode'); // Enable dark mode
    }

    // Toggle dark mode on button click
    darkmodetoggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });

    // Toggle favorites section visibility
    favoritetoggleButton.addEventListener('click', () => {
        favoriteSection.classList.toggle('hidden'); // Add/remove hidden class
        const isHidden = favoriteSection.classList.contains('hidden'); // Check if it's hidden
        localStorage.setItem('favorites-visible', isHidden ? 'hidden' : 'visible'); // Save state
    });

    // Load saved state for favorites visibility
    const favoritesVisibility = localStorage.getItem('favorites-visible');
    if (favoritesVisibility === 'hidden') {
        favoriteSection.classList.add('hidden'); // Hide if previously visible
    } else {
        favoriteSection.classList.remove('hidden'); // Show if previously hidden
    }

    loadFavorites(); // Load favorite emotes on page load

    // Load and display favorite emotes
    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Get saved favorites
        favoriteEmotesDiv.innerHTML = ''; // Clear previous favorites
        favorites.forEach(emote => {
            displayEmote(emote, favoriteEmotesDiv, true); // Display each favorite
        });
    }

    // Add an emote to favorites
    window.addFavorite = function (emote) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (!favorites.some((fav) => fav.slug === emote.slug)) { // Avoid duplicates
            favorites.push(emote);
            localStorage.setItem('favorites', JSON.stringify(favorites)); // Save favorites
            displayEmote(emote, favoriteEmotesDiv, true); // Add to favorite section
        }
    };

    // Remove an emote from favorites
    window.removeFavorite = function (emoteSlug) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites = favorites.filter(emote => emote.slug !== emoteSlug); // Remove by slug
        localStorage.setItem('favorites', JSON.stringify(favorites)); // Save updated favorites
        loadFavorites(); // Refresh favorite list
    };
});