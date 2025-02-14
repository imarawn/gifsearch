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
        fetchManualSlug();
    }
    if (unique === 'true') {
        const emotedUrl = await getEmoteURL(gifSlug)
        openModal(emotedUrl);
    }

});

function share(unique, gifSlug = null) {
    if (gifSlug) {
        window.history.pushState({}, '', `?gifSlug=${gifSlug}&unique=true`);
    } else {
        const manualInput = document.getElementById('manual-slug-input');
        window.history.pushState({}, '', `?gifSlug=${manualInput.value}&unique=false`);
    }
    navigator.share({
        title: 'GIFs',
        text: 'Check out this GIF!',
        url: window.location.href,
    }).then(() => {
        console.log('Successful share');
    }).catch((error) => {
        console.log('Error sharing', error);
    });
}