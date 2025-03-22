function getUrlParams() {
    const getParams = new URLSearchParams(window.location.search);
    const hashedData = getParams.get('data');

    if (hashedData) {
        const decodedParams = unhashParams(hashedData);
        return new URLSearchParams(decodedParams);
    }
    return getParams;
}




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
    const results = `https://chaturbate.com/api/ts/emoticons/autocomplete/?slug=${slug}`
    const response = await fetch(results);
    const data = await response.json();
    return data.emoticons.reverse()[0].url;
}