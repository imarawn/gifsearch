async function getUserHash(username, password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${username}:${password}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}