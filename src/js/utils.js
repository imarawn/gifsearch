/**
 * Render predefined GIFs in the results container by fetching them from Supabase.
 */
async function renderPredefinedGifs() {
    // Get the container element
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear existing content

    try {
        // Fetch GIFs from Supabase
        const { data: gifs, error } = await supabase
            .from('predefined_gifs')
            .select('slug, url'); // Select the columns you need

        // Handle errors
        if (error) {
            console.error('Error fetching GIFs:', error);
            resultsDiv.innerHTML = `<p>Error fetching GIFs. Please try again later.</p>`;
            return;
        }

        // Render each GIF
        if (gifs && gifs.length > 0) {
            gifs.forEach((gif) => {
                displayEmote(gif, resultsDiv); // Use the existing displayEmote function
            });
        } else {
            resultsDiv.innerHTML = `<p>No GIFs found.</p>`;
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        resultsDiv.innerHTML = `<p>An unexpected error occurred. Please try again later.</p>`;
    }
}

function copyToClipboard(text, gif) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    addToHistory(gif);
}


/**
 * Debounce a function to reduce frequent calls.
 * @param {Function} func - Function to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {Function} - Debounced function.
 */
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Generate a random slug and trigger search.
 */
function generateRandomSlug() {
    const manualInput = document.getElementById('manual-slug-input');
    const length = Math.floor(Math.random() * 25) + 3; // Random length between 3 and 15
    const randomSlug = generateRandomString(length);
    manualInput.value = randomSlug;
    fetchManualSlug(); // Trigger search function
}

/**
 * Generate a random string of specified length.
 * @param {number} length - Length of the random string.
 * @returns {string} - Generated random string.
 */
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz-1234567890_';
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

function generateRandomSlugAndScroll() {
    generateRandomSlug(); // Deine bestehende Funktion zum Generieren eines zufälligen Slugs
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scrollt die Seite nach oben
}

/**
 * Update the favorites counter.
 */
function updateFavoritesCounter() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const counter1 = document.getElementById('favorites-counter');
    const counter2 = document.getElementById('mobile-favorites-counter');
        counter1.textContent = `${favorites.length}`;
        //counter2.textContent = `${favorites.length}`;
}

/**
 * Fetch emote details from the server.
 * @param {string} slug - Slug to fetch.
 * @returns {Promise<Object|null>} - Emote data or null on failure.
 */
async function fetchAndLogEmoteDetails(slug) {
    try {
        const response = await fetch(`https://emote.highwebmedia.com/autocomplete?slug=${slug}`);
        if (!response.ok) {
            console.error(`Error fetching slug: ${slug}, Status: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error during fetch:', error);
        return null;
    }
}

/**
 * Extract the first emote from data.
 * @param {Object} data - Emote data.
 * @returns {Object|null} - First emote or null if not found.
 */
function extractFirstEmote(data) {
    return data?.emoticons?.[0] || null;
}

/**
 * Main function to fetch and log emote details.
 * @param {string} slug - Slug to fetch.
 */
async function main(slug) {
    const emoteDetails = await fetchAndLogEmoteDetails(slug);
    if (emoteDetails) {
        const firstEmote = extractFirstEmote(emoteDetails);
        console.log('First Emote:', firstEmote);
    }
}

/**
 * Set up event listeners and initialize the page.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize predefined GIFs
    renderPredefinedGifs();

    // Update favorites counter
    updateFavoritesCounter();
    showFavorites();
    renderHistory();

    /*/ Toggle mobile favorites
    const favoritesToggle = document.getElementById('mobile-favorites-toggle'); // Open button
    const mobileFavorites = document.getElementById('mobile-favorites'); // Mobile favorites section
    const closeFavoritesButton = document.getElementById('close-mobile-favorites'); // Close button

    // Toggle the favorites section
    favoritesToggle.addEventListener('click', () => {
        mobileFavorites.classList.add('open'); // Slide in
    });

    // Close the favorites section
    closeFavoritesButton.addEventListener('click', () => {
        mobileFavorites.classList.remove('open'); // Slide out
    });*/

    // Handle manual slug input with debounce
    const manualSlugInput = document.getElementById('manual-slug-input');
    const debouncedFetch = debounce(fetchManualSlug, 300);
    manualSlugInput?.addEventListener('input', debouncedFetch);
    
});

function addToHistory(gif) {
    // Get existing history from localStorage
    const history = JSON.parse(localStorage.getItem('history')) || [];

    // Add the new GIF to the beginning of the array
    history.unshift(gif);

    // Limit the array to the last 50 entries
    if (history.length > 50) {
        history.pop();
    }

    // Save updated history to localStorage
    localStorage.setItem('history', JSON.stringify(history));

    // Update the UI
    renderHistory();
}

function renderHistory() {
    const historyDiv = document.getElementById('history').querySelector('.history-content');
    const history = JSON.parse(localStorage.getItem('history')) || [];

    // Clear existing content
    historyDiv.innerHTML = '';

    // Loop through the history and render each GIF
    history.forEach((gif) => {
        
        const emoteBox = document.createElement('div');
        emoteBox.className = 'emote-box';

        // Add the title attribute to display the emote name as a tooltip
        emoteBox.setAttribute('title', `:${gif.slug}`);

        emoteBox.innerHTML = `
            <img src="${gif.url}" alt="${gif.slug}">
            <div class="emote-name">:${gif.slug}</div>
        `;
        emoteBox.addEventListener('click', () => {
            copyToClipboard(`:${gif.slug}`, gif);
        });

        historyDiv.appendChild(emoteBox);
    });
}

function deleteHistory() {
    const historyDiv = document.getElementById('history')?.querySelector('.history-content');

    if (!historyDiv) {
        console.warn('History content not found.');
        return;
    }

    // Schritt 1: Boxen verkleinern
    historyDiv.classList.add('shrink');

    // Warte, bis die Verkleinerung abgeschlossen ist
    historyDiv.addEventListener('transitionend', function handleShrink(event) {
        if (event.propertyName === 'transform') {
            // Schritt 2: Event Listener entfernen, um Mehrfachausführung zu vermeiden
            historyDiv.removeEventListener('transitionend', handleShrink);
            localStorage.removeItem('history');
            historyDiv.classList.remove('shrink');
            renderHistory();
        }
    });
}

let slugHistory = []; // Array to store the last 10 slugs
let currentSlugIndex = -1; // Index of the current slug in the history

function addSlugToHistory(slug) {
    // Add slug to history
    if (slugHistory[slugHistory.length - 1] !== slug) {
        slugHistory.push(slug);
        if (slugHistory.length > 10) {
            slugHistory.shift(); // Keep only the last 10 slugs
        }
    }
    currentSlugIndex = slugHistory.length - 1; // Update the current index to the newest slug
}

function navigateHistory(direction, inputField) {
    currentSlugIndex += direction;

    // Prevent going out of bounds
    if (currentSlugIndex < 0) {
        currentSlugIndex = 0;
        return;
    }
    if (currentSlugIndex >= slugHistory.length) {
        currentSlugIndex = slugHistory.length - 1;
        return;
    }

    // Update the input field with the current slug
    inputField.value = slugHistory[currentSlugIndex];
}

function openLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.style.display = 'block';
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.style.display = 'none';
}