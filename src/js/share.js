function getUrlParams() {
    const getParams = new URLSearchParams(window.location.search);
    const hashedData = getParams.get('data');

    if (hashedData) {
        const decodedParams = unhashParams(hashedData);
        return new URLSearchParams(decodedParams);
    }
    return getParams;
}


document.addEventListener('DOMContentLoaded', async () => {
    const gifSlug = getUrlParams().get('gifSlug');
    const unique = getUrlParams().get('unique');
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    if (gifSlug) {
        const manualInput = document.getElementById('manual-slug-input');
        manualInput.value = gifSlug;
        await fetchManualSlug();
    }
    if (unique === 'true') {
        const emotedUrl = await getEmoteURL(gifSlug);
        const img = new Image();
        img.src = emotedUrl;
        img.onload = () => {
            openModal(emotedUrl);
        };
        img.onerror = () => {
            console.error('Image failed to load:', emotedUrl);
        };
    }
    removeParams();
});

function share(unique, gifSlug = null) {
    let params = {};
    if (gifSlug) {
        params = { gifSlug: gifSlug, unique: 'true' };
    } else {
        const manualInput = document.getElementById('manual-slug-input');
        params = { gifSlug: manualInput.value, unique: 'false' };
    }
    const hashedParams = hashParams(params);

    navigator.share({
        title: `Check out this ${gifSlug ? 'GIF' : 'Slug'}!`,
        url: window.location.origin + window.location.pathname + '?data=' + hashedParams,
    }).then(() => {
        console.log('Successful share');
    }).catch((error) => {
        console.log('Error sharing', error);
    });

    removeParams();
}


function removeParams() {
    const url = new URL(window.location);
    url.searchParams.delete('data');
    window.history.replaceState({}, '', url);
}

async function getEmoteURL(slug) {
    const results = `https://emote.highwebmedia.com/autocomplete?slug=${slug}`
    const response = await fetch(results);
    const data = await response.json();
    return data.emoticons.reverse()[0].url;
}