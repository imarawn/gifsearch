const SUPABASE_URL='https://wocqopootglovmnhxcjw.supabase.co'
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY3FvcG9vdGdsb3Ztbmh4Y2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNTA4MjYsImV4cCI6MjA1MzYyNjgyNn0.YsKQxWGBhlB6qCVIoRok9DXUzYQTts6lx_lo8Ps8utU'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        alert(`Login failed: ${error.message}`);
        return;
    }

    console.log('Logged in successfully:', data);
    await checkSession();
    closeLoginModal()
    await syncFavorites();
    await loadFavoritesFromSupabase();
}

async function logout() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        alert(`Logout failed: ${error.message}`);
        return;
    }

    console.log('Logged out successfully');

    await checkSession();
}

async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error fetching session:', error);
        return;
    }

    const user = session?.user || null;
    
    if (user) {
        console.log('User is logged in:', user);
    } else {
        console.log('No user logged in');
    }
}
