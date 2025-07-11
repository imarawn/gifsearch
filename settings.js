function showSettings() {
    cleanupFavoritesView()
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
  <p>If you had Favorites saved on the old Version of the Site, you can transfer them here.</p>
  <button id="transfer" style="margin-top:0.5rem;">🔻 Transfer</button>
  <div id="progress-container" style="margin-top:1rem; display:none;">
    <progress id="progress-bar" value="0" max="100" style="width:100%; height:1rem;"></progress>
    <div id="progress-text" style="margin-top:0.5rem; text-align:center; color: var(--accent); font-weight: bold;"></div>
  </div>
`;


    results.appendChild(panel2);

    // Add panel for list filters
    const panel3 = document.createElement('div');
    panel3.id = 'filter-panel';
    panel3.style.padding = '1rem';
    panel3.style.border = '1px solid #666';
    panel3.style.background = '#222';
    panel3.style.marginTop = '1rem';
    panel3.style.borderRadius = '8px';

    const excludedLists = JSON.parse(localStorage.getItem('emote_exclude_lists') || '[]');

    const availableLists = JSON.parse(localStorage.getItem('emoteAvailableLists') || '[]'); // you must set this before

    let listOptions = availableLists.map(list => {
        const checked = excludedLists.includes(list) ? '' : 'checked';
        return `<label style="display:block;"><input type="checkbox" class="filter-list" value="${list}" ${checked}> ${list}</label>`;
    }).join('');

    panel3.innerHTML = `
  <h3 style="margin-bottom:0.5rem;">🚫 Hide Lists from Favorites</h3>
  <p>Unchecked lists will not appear when clicking the Favorites tab.</p>
  ${listOptions}
  <button id="save-filter-settings" style="margin-top:0.5rem;">💾 Save Filters</button>
`;

    results.appendChild(panel3);

    document.getElementById('save-filter-settings').addEventListener('click', () => {
        const selected = [...document.querySelectorAll('.filter-list')]
            .filter(input => !input.checked)
            .map(input => input.value);

        localStorage.setItem('emote_exclude_lists', JSON.stringify(selected));
        alert('✅ List filters saved');
    });


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
