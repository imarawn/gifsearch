function showSettings() {
    cleanupFavoritesView();
    const results = document.getElementById('results');
    if (!results) return;
    results.innerHTML = '';

    const existing = document.getElementById('settings-panel');
    if (existing) {
        existing.remove();
        return;
    }

    // Panel 1 – Settings
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.style.cssText = panelStyle();
    panel.innerHTML = `
        <h3 style="margin-bottom:0.5rem;">🔐 Settings</h3>
        <label>Username:<br><input type="text" id="emote-username" style="width:100%" /></label><br><br>
        <label>Password:<br><input type="text" id="emote-password" style="width:100%" /></label><br><br>
        <label>Secret Key:<br><input type="text" id="emote-secret" style="width:100%" /></label><br><br>
        <button id="save-settings" class="setting-button">💾 Save</button>
    `;
    results.appendChild(panel);

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

    // Panel 2 – Old Favorites Transfer
    const panel2 = document.createElement('div');
    panel2.id = 'save-panel';
    panel2.style.cssText = panelStyle();
    panel2.innerHTML = `
        <h3 style="margin-bottom:0.5rem;">💾 Save old Favorites</h3>
        <p>If you had Favorites saved on the old Version of the Site, you can transfer them here.</p>
        <button id="transfer" class="setting-button">🔻 Transfer</button>
        <div id="progress-container" style="margin-top:1rem; display:none;">
            <progress id="progress-bar" value="0" max="100" style="width:100%; height:1rem;"></progress>
            <div id="progress-text" style="margin-top:0.5rem; text-align:center; color: var(--accent); font-weight: bold;"></div>
        </div>
    `;
    results.appendChild(panel2);

    // Panel 3 – List Filter
    const panel3 = document.createElement('div');
    panel3.id = 'filter-panel';
    panel3.style.cssText = panelStyle();

    const excludedLists = JSON.parse(localStorage.getItem('emote_exclude_lists') || '[]');
    const availableLists = JSON.parse(localStorage.getItem('emoteAvailableLists') || '[]');

    let listOptions = availableLists.map(list => {
        const checked = excludedLists.includes(list) ? '' : 'checked';
        return `<label style="display:block;"><input type="checkbox" class="filter-list" value="${list}" ${checked}> ${list}</label>`;
    }).join('');

    panel3.innerHTML = `
        <h3 style="margin-bottom:0.5rem;">🚫 Hide Lists from Favorites</h3>
        <p>Unchecked lists will not appear when clicking the Favorites tab.</p>
        ${listOptions}
        <button id="save-filter-settings" class="setting-button">💾 Save Filters</button>
    `;
    results.appendChild(panel3);

    document.getElementById('save-filter-settings').addEventListener('click', () => {
        const selected = [...document.querySelectorAll('.filter-list')]
            .filter(input => !input.checked)
            .map(input => input.value);

        localStorage.setItem('emote_exclude_lists', JSON.stringify(selected));
        alert('✅ List filters saved');
    });

    // Panel 4 – Clear History
    const panel4 = document.createElement('div');
    panel4.id = 'clear-history-panel';
    panel4.style.cssText = panelStyle();
    panel4.innerHTML = `
        <h3 style="margin-bottom:0.5rem;">🧹 Clear History</h3>
        <p>This will permanently delete your entire emote usage history.</p>
        <button id="clear-history-btn" class="danger-button">🗑️ Delete History</button>
    `;
    results.appendChild(panel4);

    document.getElementById('clear-history-btn').addEventListener('click', () => {
        const confirmClear = confirm('⚠️ Are you sure you want to delete ALL emote history?');
        if (confirmClear) {
            localStorage.removeItem('emoteHistory');
            alert('✅ History deleted');
        }
    });

    // Panel 5 – Admin Panel Link (immer sichtbar)
    const panel5 = document.createElement('div');
    panel5.id = 'admin-panel';
    panel5.style.cssText = panelStyle();
    panel5.innerHTML = `
        <h3 style="margin-bottom:0.5rem;">🛠️ Admin Panel</h3>
        <p>Open the advanced admin interface for reviewing emotes and managing visibility.</p>
        <button id="open-admin-panel" class="setting-button">🔓 Open Admin Panel</button>
    `;
    results.appendChild(panel5);

    document.getElementById('open-admin-panel').addEventListener('click', () => {
        window.open('admin.html', '_blank');
    });

    // 🔧 Helper: get panel style as string
    function panelStyle() {
        return `
            padding: 1rem;
            border: 1px solid #666;
            background: #222;
            margin-top: 1rem;
            border-radius: 8px;
        `;
    }
}
