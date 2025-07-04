function showSettings() {
    const results = document.getElementById('results');
    if (!results) return;
    results.innerHTML = '';
    const existing = document.getElementById('settings-panel');
    if (existing) {
        existing.remove();
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.style.padding = '1rem';
    panel.style.border = '1px solid #666';
    panel.style.background = '#222';
    panel.style.marginTop = '1rem';
    panel.style.borderRadius = '8px';

    panel.innerHTML = `
            <h3 style="margin-bottom:0.5rem;">🔐 Settings</h3>
            <label>Username:<br><input type="text" id="emote-username" style="width:100%" /></label><br><br>
            <label>Password:<br><input type="text" id="emote-password" style="width:100%" /></label><br><br>
            <label>Secret Key:<br><input type="text" id="emote-secret" style="width:100%" /></label><br><br>
            <button id="save-settings" style="margin-top:0.5rem;">💾 Save</button>
        `;

    results.appendChild(panel);

    const panel2 = document.createElement('div');
    panel2.id = 'save-panel';
    panel2.style.padding = '1rem';
    panel2.style.border = '1px solid #666';
    panel2.style.background = '#222';
    panel2.style.marginTop = '1rem';
    panel2.style.borderRadius = '8px';
    panel2.innerHTML = `
            <h3 style="margin-bottom:0.5rem;">💾 Save old Favorites</h3>
            <p>If you had Favorites saved on the old Version of the Site, they will not show up anymore now. However, you can transfer them here to the new Site Version.</p>
            <button id="transfer" style="margin-top:0.5rem;" onclick="autoMigrateEmotes()">🔻 Transfer</button>
        `;

    results.appendChild(panel2);

    document.getElementById('emote-username').value = localStorage.getItem('emote_username') || '';
    document.getElementById('emote-password').value = localStorage.getItem('emote_password') || '';
    document.getElementById('emote-secret').value = localStorage.getItem('emote_secret') || '';

    document.getElementById('save-settings').addEventListener('click', () => {
        const username = document.getElementById('emote-username').value.trim();
        const password = document.getElementById('emote-password').value.trim();
        const secret = document.getElementById('emote-secret').value.trim();

        localStorage.setItem('emote_username', username);
        localStorage.setItem('emote_password', password);
        localStorage.setItem('emote_secret', secret);

        alert('✅ Settings saved');
    });
}
