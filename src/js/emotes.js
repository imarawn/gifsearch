// Unified function for fetching emote data
async function fetchEmoteData(slug, single = false) {
    try {
        const url = `https://emote.highwebmedia.com/autocomplete?slug=${slug}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${slug}, Status: ${response.status}`);

        const data = await response.json();
        return single ? data.emoticons.find(e => e.slug === slug) : data.emoticons.reverse();
    } catch (error) {
        console.error(`Error fetching ${slug}:`, error);
        return null;
    }
}

// Helper Function: Displays a single emote
function displayEmote(emote, parentElement) {
    const emoteBox = document.createElement('div');
    emoteBox.className = 'emote-box';

    emoteBox.innerHTML = `
        <button class="visible-button tinybutton button" data-translate-title="buttons.visibleButton" onclick="toggleVisibility(this, '${emote.url}')"></button>
        <button class="favorite-button" data-translate-title="buttons.favoriteAdd" onclick="toggleFavorite(${emote})"></button>
        <div class="image-container">
            <img src="${emote.url}" alt="${emote.slug}" onclick="copyToClipboard(':${emote.slug}', ${JSON.stringify(emote)})">
        </div>
        <div class="details-container">
            <div class="emote-name">:${emote.slug}</div>
            <div class="button-container">
                <button class="button dimensions-button" title="" data-translate-title="buttons.dimensionsButton" onclick="openImageModal('${emote.url}')"></button>
                <button class="share-button tinybutton button" data-translate-title="buttons.shareButtonGif" onclick="share('true', '${emote.slug}')"></button>
                <button class="search-button tinybutton button" data-translate-title="buttons.similarButton" onclick="searchSimilar('${emote.slug}')"></button>
                <button class="change-list-button button tinybutton" data-translate-title="buttons.change-list-button" onclick="changeFavoriteList(${JSON.stringify(emote)})"></button>
            </div>
        </div>
    `;

    parentElement.appendChild(emoteBox);

    const img = emoteBox.querySelector("img");
    const dimensionsButton = emoteBox.querySelector(".dimensions-button");

    img.onload = () => {
        dimensionsButton.textContent = `${img.naturalWidth}x${img.naturalHeight}`;
        if (img.naturalWidth > 250 || img.naturalHeight > 80) emoteBox.style.backgroundColor = '#eb0c0c';
    };

    requestAnimationFrame(() => emoteBox.classList.add('visible'));
}

// Helper functions for visibility and favorite toggling
function toggleVisibility(button, url) {
    const img = button.parentElement.querySelector("img");
    img.src = img.src === url ? "https://static-pub.highwebmedia.com/uploads/avatar/2014/06/15/tOJg2O2TVM9h.jpg" : url;
}

function searchSimilar(slug) {
    document.getElementById('manual-slug-input').value = slug;
    fetchManualSlug();
}


// Function: Load and Fetch Emoticons from File
async function loadAndFetchEmoticons() {
    const fileInput = document.getElementById('file-input');
    fileInput.click();

    fileInput.onchange = async () => {
        if (!fileInput.files.length) return alert(getTranslation("alert.noFileSelected"));

        const text = await fileInput.files[0].text();
        const slugs = text.split('\n').map(slug => slug.trim()).filter(Boolean);

        if (!slugs.length) return alert(getTranslation("alert.fileError"));

        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        const emotePromises = slugs.map(async slug => {
            const emote = await fetchEmoteData(slug, true);
            if (emote) displayEmote(emote, resultsDiv);
        });

        await Promise.all(emotePromises);
    };
}

// Function: Manual Slug Search
async function fetchManualSlug() {
    const manualInput = document.getElementById('manual-slug-input');
    const resultsDiv = document.getElementById('results');
    const slug = manualInput.value.trim();

    if (!slug) return (resultsDiv.innerHTML = '');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const emotes = await fetchEmoteData(slug);
    resultsDiv.innerHTML = '';

    if (emotes) emotes.forEach(emote => displayEmote(emote, resultsDiv));

    translate();
}
