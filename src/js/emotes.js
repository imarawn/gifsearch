async function loadAndFetchEmoticons(table_name) {
    const fileInput = document.getElementById('file-input'); // Reference to the hidden input field
    const resultsDiv = document.getElementById('results'); // Results container

    // Simulate a click on the hidden file input field
    fileInput.click();

    // Wait for file selection (user selects a file)
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

        // Initialize an array to hold slugs, URLs, and user_id for insertion into Supabase
        const rowsToInsert = [];

        // Get the current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
            console.error('Error fetching user data:', authError);
            alert('Error fetching user data. Please try again.');
            return;
        }

        if (!user) {
            alert('User not authenticated. Please log in.');
            return;
        }

        // Fetch and display emoticons for each slug
        for (const slug of slugs) {
            try {
                const response = await fetch(`https://emote.highwebmedia.com/autocomplete?slug=${slug}`); // Fetch emoticon data
                if (!response.ok) {
                    console.error(`Failed to fetch slug: ${slug}, Status: ${response.status}`);
                    continue;
                }

                const data = await response.json(); // Parse the JSON response
                const exactEmote = data.emoticons.find((emote) => emote.slug === slug); // Find the exact emote

                if (exactEmote) {
                    displayEmote(exactEmote, resultsDiv); // Display the emote if found

                    // Now, extract the URL (you can modify this based on how the URL is structured in the API response)
                    const emoteUrl = exactEmote.url || `https://example.com/gif/${slug}`;  // Use a fallback URL if the API doesn't provide it

                    // Push the slug, URL, and user_id into the rowsToInsert array
                    rowsToInsert.push({
                        slug: slug,
                        url: emoteUrl,
                        user_id: user.id, // Use the authenticated user's ID
                    });
                }
            } catch (error) {
                console.error(`Error fetching ${slug}:`, error); // Handle errors
            }

            // Add a delay between API calls to avoid rate-limiting
            await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Insert the collected slugs and URLs into the user_emoticons table
        if (rowsToInsert.length > 0) {
            try {
                const { data, error } = await supabase
                    .from(table_name)  // Insert into the new table 'user_emoticons'
                    .upsert(rowsToInsert, { onConflict: ['slug', 'user_id'] });  // Insert or update if slug already exists for the user

                if (error) {
                    console.error('Error inserting data into Supabase:', error);
                } else {
                    console.log('Data inserted successfully:', data);
                }
            } catch (error) {
                console.error('Unexpected error inserting data into Supabase:', error);
            }
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
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
