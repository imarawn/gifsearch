const MAX_TOTAL_GIFS = 200;  // Gesamtlimit für die Tabelle
const MAX_GIFS_PER_USER = 10; // Limit pro Nutzer

/**
 * Render predefined GIFs in the results container by fetching them from Supabase.
 */
async function renderPredefinedGifs() {
    // Get the container element
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear existing content


    try {
        // Fetch GIFs from Supabase
        const {data: gifs, error} = await supabase
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
        resultsDiv.innerHTML = `<p>An unexpected error occurred. Please try again later.</p>`;
    }
}

async function copyToClipboard(text, gif) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    await navigator.clipboard.writeText(text);
    document.body.removeChild(textarea);

    addToHistory(gif); // Deine bestehende Funktion
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
    addToHistory(randomSlug, false);
}

/**
 * Generate a random string of specified length.
 * @param {number} length - Length of the random string.
 * @returns {string} - Generated random string.
 */
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-1234567890_';
    const cyrillicCharacters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя-1234567890_';
    const type = Math.floor(Math.random() * 2);
    return Array.from({length}, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
}

function generateRandomSlugAndScroll() {
    generateRandomSlug(); // Deine bestehende Funktion zum Generieren eines zufälligen Slugs
    window.scrollTo({top: 0, behavior: 'smooth'}); // Scrollt die Seite nach oben
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
            return null;
        }
        return await response.json();
    } catch (error) {
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
    }
}






function restoreHome() {
    document.getElementById('manual-slug-input').value = '';
    renderPredefinedGifs();
}

const favorites = document.querySelector('.favorites');

function adjustWidthOnHover() {
    if (window.innerWidth <= 768) return;
    const availableWidth = window.innerWidth - 140;
    const subtractionPerBlock = 18;
    const numBlocks = Math.floor(availableWidth / 290);
    const newWidth = (numBlocks * 290) - (numBlocks * subtractionPerBlock);
    favorites.style.width = `${newWidth}px`;
}

function openmobileHistory() {
    const favoritesSection = document.getElementById('history');
    favoritesSection.classList.toggle('mobile-history-open');
    const overlay = document.getElementById('favorites-overlay');
    overlay.classList.toggle('open');
}

function hashParams(params) {
    const jsonString = JSON.stringify(params);
    return btoa(jsonString); // Base64 encode
}

function unhashParams(hashed) {
    const jsonString = atob(hashed); // Base64 decode
    return JSON.parse(jsonString);
}

function menuButton() {
    const parentDiv = document.querySelector('.menu-container');
    parentDiv.querySelectorAll(':not(.menu-button)').forEach(element => {
        element.classList.toggle('hidden');
    });
}



// Generator Function for Slugs
function* generateSlugs(prefix, maxLength) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    function nextString(str) {
        let carry = true;
        let result = "";

        for (let i = str.length - 1; i >= 0; i--) {
            if (carry) {
                let nextCharIndex = alphabet.indexOf(str[i]) + 1;
                if (nextCharIndex === alphabet.length) {
                    result = alphabet[0] + result;
                } else {
                    result = alphabet[nextCharIndex] + result;
                    carry = false;
                }
            } else {
                result = str[i] + result;
            }
        }
        if (carry) {
            result = "a" + result;
        }
        return result;
    }

    let suffix = "a";
    while ((prefix + suffix).length <= maxLength) {
        yield prefix + suffix;
        suffix = nextString(suffix);
    }
}


async function automateSlugSearch() {
    const slugGenerator = generateSlugs("w1-", 4); // Adjust prefix and length as needed
    const manualInput = document.getElementById('manual-slug-input');

    // Wait for the DOMContentLoaded event to ensure the page is fully loaded
    await new Promise(resolve => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve(); // If DOM is already ready, resolve immediately
        }
    });

    for (let slug of slugGenerator) {
        // Input Slug and Trigger Fetch
        manualInput.value = slug;
        manualInput.dispatchEvent(new Event('input', { bubbles: true }));

        // Wait for the results to appear
        await waitForElement('.favorite-button');  // Wait for the favorite-button to appear

        const parentElement = document.getElementById('results');
        const elements = parentElement.querySelectorAll('.favorite-button');

        for (let element of elements) {
            element.click(); // Perform the click action for each button
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Wait before the next slug
        await new Promise(resolve => setTimeout(resolve, 2000));  // Adjust as necessary
    }
}

// Helper function to wait for a specific element to appear in the DOM
function waitForElement(selector) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (document.querySelector(selector)) {
                clearInterval(interval);
                resolve();
            }
        }, 100); // Check every 100ms
    });
}

