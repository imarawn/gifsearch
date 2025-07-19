export async function getUselessFact() {
    const field3 = document.querySelector('main .grid > div:last-child');
    if (!field3) return;

    field3.innerHTML = '<p class="text-zinc-400 italic">Loading fun fact...</p>';

    try {
        const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/today?language=en');
        const data = await res.json();

        field3.innerHTML = `
      <div class="text-sm text-white space-y-2">
        <p class="text-xl font-bold">🧠 Fact of the day:</p>
        <p class="text-zinc-300 text-lg">${data.text}</p>
      </div>
    `;
    } catch (error) {
        field3.innerHTML = `<p class="text-red-400">Failed to load fact 😢</p>`;
        console.error('Error fetching fun fact:', error);
    }
}