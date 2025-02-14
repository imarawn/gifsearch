function getUrlParams() {
    return new URLSearchParams(window.location.search);
}

document.addEventListener('DOMContentLoaded', async () => {
    const gifSlug = getUrlParams().get('gifSlug');
    const unique = getUrlParams().get('unique');
    if (gifSlug) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
        const manualInput = document.getElementById('manual-slug-input');
        manualInput.value = gifSlug;
        await fetchManualSlug();
    }
    if (unique === 'true') {
        const emotedUrl = await getEmoteURL(gifSlug)
        openModal(emotedUrl);
    }
    removeParams();
});

function share(unique, gifSlug = null) {
    let params = ''
    if (gifSlug) {
        params = `?gifSlug=${gifSlug}&unique=true`;
    } else {
        const manualInput = document.getElementById('manual-slug-input');
        params = `?gifSlug=${manualInput.value}&unique=false`
    }
    navigator.share({
        title: 'GIFs',
        text: `Check out this ${gifSlug ? 'GIF' : 'Slug'}!`,
        url: window.location.href + params,
    }).then(() => {
        console.log('Successful share');
    }).catch((error) => {
        console.log('Error sharing', error);
    });
    removeParams();
}

function removeParams() {
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, '', url);
}