function getBrowserLanguage() {
    const browserLanguage = navigator.languages?.[0] || navigator.language
    return browserLanguage.split('-')[0];
}

async function loadTranslations(language) {
    try {
        const response = await fetch(`https://cdn.simplelocalize.io/e9eb255f1b71408b988aa27d231bbf9b/_latest/${language}`);
        return await response.json();
    } catch (error) {
        console.error(`[loadTranslations] Error loading translations for language: ${language}`, error);
        return {};
    }
}

// Apply translations to HTML elements
async function applyTranslations(language = 'en') {
    const translations = await loadTranslations(language);
    if (!translations) {
        return;
    }

    document.title = translations.title;

    // Translate Titles
    document.querySelectorAll('[data-translate-title]').forEach(element => {
        const key = element.getAttribute('data-translate-title');
        const value = getTranslationFromObject(translations, key);
        if (value) {
            element.title = value;
        } else {
            console.warn(`[applyTranslations] No translation found for title key: ${key}`);
        }
    });

    // Translate Placeholders
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        const value = getTranslationFromObject(translations, key);
        if (value) {
            element.placeholder = value;
        } else {
            console.warn(`[applyTranslations] No translation found for placeholder key: ${key}`);
        }
    });

    // Translate Text Content (e.g., headings, paragraphs, buttons)
    document.querySelectorAll('[data-translate-text]').forEach(element => {
        const key = element.getAttribute('data-translate-text');
        const value = getTranslationFromObject(translations, key);
        if (value) {
            element.textContent = value;
        } else {
            console.warn(`[applyTranslations] No translation found for text key: ${key}`);
        }
    });

    // Translate Alert Messages
    const alertMessages = document.querySelectorAll('[data-translate-alert]');
    alertMessages.forEach(element => {
        const key = element.getAttribute('data-translate-alert');
        const value = getTranslationFromObject(translations, key);
        if (value) {
            element.setAttribute('data-alert-message', value);
        } else {
            console.warn(`[applyTranslations] No translation found for alert key: ${key}`);
        }
    });
}

// Helper function to retrieve the translation from the translation object
function getTranslationFromObject(translations, key) {
    return translations[key] || key;
}

async function getTranslation(key) {
    const language = document.getElementById('language-selector').value;
    const translations = await loadTranslations(language);
    if (!translations) {
        return key;
    }
    return getTranslationFromObject(translations, key);

}

function translate() {
    applyTranslations(getBrowserLanguage());
}

// Event Listener for Language Change
document.getElementById('language-selector').addEventListener('change', (event) => {
    const selectedLanguage = event.target.value;
    translationsCache = {};  // Clear cache so the new language translations are fetched
    applyTranslations(selectedLanguage);
});


