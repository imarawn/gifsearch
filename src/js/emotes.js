async function loadAndFetchEmoticons() {
    const fileInput = document.getElementById('file-input'); // Referenz auf das versteckte Input-Feld
    const resultsDiv = document.getElementById('results'); // Results container

    // Simuliere einen Klick auf das versteckte Datei-Input-Feld
    fileInput.click();

    // Warte auf Dateiänderung (Benutzer wählt eine Datei aus)
    fileInput.onchange = async () => {
        if (fileInput.files.length === 0) {
            alert('No file selected.');
            return;
        }

        const file = fileInput.files[0]; // Get the selected file
        const text = await file.text(); // Read file content as text
        const slugs = text.split('\n').map((slug) => slug.trim()).filter((slug) => slug !== ''); // Process slugs

        // Check if the file contains valid data
        if (slugs.length === 0) {
            alert('The file is empty or contains invalid data.');
            return;
        }

        // Clear previous results
        resultsDiv.innerHTML = '';

        // Fetch and display emoticons for each slug
        for (const slug of slugs) {
            try {
                const response = await fetch(`https://emote.highwebmedia.com/autocomplete?slug=${slug}`); // Fetch emoticon data
                if (!response.ok) {
                    console.error(`Failed to fetch slug: ${slug}, Status: ${response.status}`);
                    continue;
                }

                const data = await response.json(); // Parse JSON response
                const exactEmote = data.emoticons.find((emote) => emote.slug === slug); // Find the exact emote
                if (exactEmote) displayEmote(exactEmote, resultsDiv); // Display the emote if found
            } catch (error) {
                console.error(`Error fetching ${slug}:`, error); // Handle errors
            }

            await new Promise((resolve) => setTimeout(resolve, 50)); // Add a delay between API calls
        }
    };
}


function displayEmote(emote, parentElement) {
    const emoteBox = document.createElement('div'); // Create emote container
    emoteBox.className = 'emote-box';

    // Container for the image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

    const img = document.createElement('img'); // Create image element
    img.src = emote.url;
    img.alt = emote.slug;

    imageContainer.appendChild(img); // Append image to image container

    // Container for the name, dimensions, and search button
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'details-container';

    const label = document.createElement('div'); // Create label for emote name
    label.textContent = `:${emote.slug}`;
    label.className = 'emote-name';

    const dimensionsButton = document.createElement('button'); // Create button for dimensions
    dimensionsButton.classList = 'button';
    dimensionsButton.textContent = 'View Fullsize';
    dimensionsButton.onclick = () => openModal(emote.url);

    const searchButton = document.createElement('button'); // Create "Search Slug" button
    searchButton.className = 'search-button tinybutton button';
    searchButton.title = `Search for :${emote.slug}`; // Tooltip for clarity
    searchButton.onclick = () => {
        const manualInput = document.getElementById('manual-slug-input'); // Input field for manual search
        manualInput.value = emote.slug; // Set the input value to the slug
        fetchManualSlug(); // Trigger a manual search
    };

    // Group the dimensions button and search button
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.append(dimensionsButton, searchButton);

    // Append name and buttons to details container
    detailsContainer.append(label, buttonContainer);

    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'favorite-button';
    favoriteButton.textContent = '☆'; // Default "not favorited" star
    favoriteButton.onclick = () => {
        addToFavorites(emote); // Add the emote to favorites
        favoriteButton.textContent = '★'; // Change the star to "favorited"
    };

    const infoButton = document.createElement('button');
    infoButton.className = 'info-button';
    infoButton.textContent = 'ℹ️'; // Info icon
    infoButton.onclick = () => {
        main(emote.slug); // Call a function to show detailed info
    };

    img.onload = () => {
        dimensionsButton.textContent = `${img.naturalWidth}x${img.naturalHeight}`;
        if (img.naturalWidth > 250 || img.naturalHeight > 80) {
            emoteBox.style.backgroundColor = '#eb0c0c'; // Highlight oversized emotes
        }
    };

    img.onclick = () => {
        copyToClipboard(`:${emote.slug}`, emote); // Copy the emote slug
    };

    // Append image container and details container to the emote box
    emoteBox.append(imageContainer, detailsContainer, favoriteButton);

    // Append emote box to the parent element
    parentElement.appendChild(emoteBox);

    // Trigger the smooth transition
    requestAnimationFrame(() => {
        emoteBox.classList.add('visible'); // Add 'visible' class to start transition
    });
}






// Fetch emoticon data based on manual input
async function fetchManualSlug() {
    const manualInput = document.getElementById('manual-slug-input'); // Get input field
    const resultsDiv = document.getElementById('results'); // Results container
    const slug = manualInput.value.trim(); // Get input value

    // Exit if input is empty
    if (!slug) {
        resultsDiv.innerHTML = ''; // Clear all results
        return;
    }

    try {
        const response = await fetch(`https://emote.highwebmedia.com/autocomplete?slug=${slug}`); // Fetch API
        if (!response.ok) {
            console.error(`Failed to fetch slug: ${slug}, Status: ${response.status}`);
            return;
        }
        
        const data = await response.json(); // Parse JSON response
        resultsDiv.innerHTML = ''; // Clear previous results
        const reversedEmoticons = data.emoticons.reverse();

        for (const emote of reversedEmoticons) {
            displayEmote(emote, resultsDiv); // Display each emote
        }
    } catch (error) {
        console.error(`Error fetching ${slug}:`, error); // Handle errors
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const manualInput = document.getElementById('manual-slug-input');
    const debouncedFetchManualSlug = debounce(fetchManualSlug, 300);
    manualInput.oninput = debouncedFetchManualSlug;
});
