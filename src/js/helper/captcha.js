captcha_site_key = "091a109c-def0-41ca-a682-3b12bf02dd18"
captcha_site_verification_url = "https://api.hcaptcha.com/siteverify"

async function getCaptchaToken() {
    try {
        const response = await fetch(captcha_site_verification_url, {});
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error("Fehler beim Abrufen des Captcha-Tokens:", error);
        return null;
    }
}