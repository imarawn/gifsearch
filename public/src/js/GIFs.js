import { supabase } from './Database.js';
import { displayEmote } from './UI.js';
import { debounce } from './Utils.js';

export async function renderPredefinedGifs() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    try {
        const { data: gifs, error } = await supabase
            .from('predefined_gifs')
            .select('slug, url');

        if (error) {
            console.error('Error fetching GIFs:', error);
            resultsDiv.innerHTML = `<p>Error fetching GIFs. Please try again later.</p>`;
            return;
        }

        if (gifs.length > 0) {
            gifs.forEach((gif) => displayEmote(gif, resultsDiv));
        } else {
            resultsDiv.innerHTML = `<p>No GIFs found.</p>`;
        }
    } catch (err) {
        resultsDiv.innerHTML = `<p>An unexpected error occurred. Please try again later.</p>`;
    }
}

export async function fetchEmoteData(slug) {
    try {
        const resultsDiv = document.getElementById('results');

        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        resultsDiv.innerHTML = '';
        resultsDiv.appendChild(spinner);

        const response = await fetch(`https://chaturbate.com/api/ts/emoticons/autocomplete/?slug=${slug}`);
        if (!response.ok) {
            console.error(`Failed to fetch slug: ${slug}, Status: ${response.status}`);
            return null;
        }

        const data = await response.json();

        return data.emoticons ? data.emoticons.reverse() : [];
    } catch (error) {
        console.error(`Error fetching ${slug}:`, error);
        return null;
    }
}


export async function renderUserGifs(list) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) {
        console.error("⚠️ #results element not found in DOM!");
        return;
    }

    resultsDiv.innerHTML = '<p>Loading...</p>';

    try {
        const { data: gifs, error } = await supabase
            .from(list)
            .select('slug, url')

        if (error) {
            console.error('Error fetching GIFs:', error);
            resultsDiv.innerHTML = `<p>Error loading GIFs. Please try again.</p>`;
            return;
        }

        resultsDiv.innerHTML = '';

        if (gifs.length > 0) {
            gifs.forEach(gif => displayEmote(gif, resultsDiv)); // Display GIFs
        } else {
            resultsDiv.innerHTML = `<p>No GIFs found for this category.</p>`;
        }
    } catch (err) {
        resultsDiv.innerHTML = `<p>An unexpected error occurred. Please try again later.</p>`;
    }
}

export function generateRandomSlugAndScroll() {
    const slugInput = document.getElementById('manual-slug-input');
    if (!slugInput) {
        console.error("⚠️ #manual-slug-input not found!");
        return;
    }

    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
    const slugLength = Math.floor(Math.random() * (12 - 5 + 1)) + 3;
    let randomSlug = '';

    for (let i = 0; i < slugLength; i++) {
        randomSlug += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    slugInput.value = randomSlug;

    debouncedFetchManualSlug();
}


async function fetchManualSlug() {
    const manualInput = document.getElementById('manual-slug-input');
    const resultsDiv = document.getElementById('results');

    if (!manualInput || !resultsDiv) {
        console.error("⚠️ Missing #manual-slug-input or #results in DOM!");
        return;
    }

    const slug = manualInput.value.trim();
    if (!slug) {
        resultsDiv.innerHTML = '<p>Please enter an emote slug.</p>';
        return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const emotes = await fetchEmoteData(slug);

    resultsDiv.innerHTML = '';

    if (emotes && emotes.length > 0) {
        emotes.forEach(emote => {
            displayEmote(emote, resultsDiv);
        });
    } else {
        resultsDiv.innerHTML = `<p>No emotes found for ":${slug}".</p>`;
    }
}

export const debouncedFetchManualSlug = debounce(fetchManualSlug, 500);

export async function fetchSingleEmote(slug) {
    try {
        // ✅ Fetch emote data from the API
        const response = await fetch(`https://chaturbate.com/api/ts/emoticons/autocomplete/?slug=${slug}`);

        if (!response.ok) {
            console.error(`❌ Failed to fetch slug: ${slug}, Status: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // ✅ Ensure `emoticons` exist before searching
        if (!data.emoticons || data.emoticons.length === 0) {
            console.warn(`⚠️ No emotes found for slug: "${slug}"`);
            return null;
        }

        // ✅ Find exact emote match by slug (fallback to first emote if no exact match)
        const emote = data.emoticons.find(emote => emote.slug === slug) || data.emoticons[0];

        return emote;
    } catch (error) {
        console.error(`❌ Error fetching ${slug}:`, error);
        return null;
    }
}

export function searchSimilarGifs(slug) {
    const input = document.getElementById('manual-slug-input');
    input.value = slug;
    debouncedFetchManualSlug();
}


