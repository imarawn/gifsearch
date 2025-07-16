async function fetchCount() {
    const el = document.getElementById('counter');
    if (!el) return console.warn('⚠️ #counter element not found');

    // 1. Get total count
    const { count: totalCount, error: totalError } = await supabase
        .from('emotes')
        .select('*', { count: 'exact', head: true });

    // 2. Count with llm_nsfw_reason IS NOT NULL
    const { count: reasonCount, error: reasonError } = await supabase
        .from('emotes')
        .select('*', { count: 'exact', head: true })
        .not('llm_nsfw_reason', 'is', null);

    // 3. Count SFW-labeled
    const { count: sfwCount, error: sfwError } = await supabase
        .from('emotes')
        .select('*', { count: 'exact', head: true })
        .eq('nsfw_label', 'sfw');

    // 4. Count AI-labeled (llm_nsfw_reason NOT LIKE 'user marked as%')
    const { count: aiCount, error: aiError } = await supabase
        .from('emotes')
        .select('*', { count: 'exact', head: true })
        .not('llm_nsfw_reason', 'ilike', 'user marked as%');

    // ❌ Handle any errors
    if (totalError || reasonError || sfwError || aiError) {
        console.error('❌ Error loading counts:', {
            totalError,
            reasonError,
            sfwError,
            aiError
        });
        el.textContent = '❌ Error loading stats';
        return;
    }

    // ✅ Inject into DOM
    el.innerHTML = `
    👀 <span style="color:#888">${reasonCount}/${totalCount}</span> Checked GIFs.
    <span style="color:green">${sfwCount} marked as SFW</span>,
    <span style="color:red">${reasonCount - sfwCount} marked as NSFW.</span>
    <span style="color:orange">${aiCount} by AI, ${reasonCount - aiCount} by User.</span>
  `;
}

// 🔁 Realtime update with debounce (optional)
let updateTimeout;
const debounceFetchCount = () => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(fetchCount, 500); // wait 500ms after last update
};

// 📦 Initial load
fetchCount();

// 🔔 Realtime listener
supabase
    .channel('realtime:emotes')
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'emotes',
    }, debounceFetchCount)
    .subscribe();
