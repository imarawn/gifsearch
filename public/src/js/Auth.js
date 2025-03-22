import { supabase } from './Database.js';

export async function login() {
    const form = document.getElementById('login-form');
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert(`Login failed: ${error.message}`);
        return;
    }

    await checkSession();
    closeLoginModal();
    updateFavoritesCounter();
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert(`Logout failed: ${error.message}`);
        return;
    }

    localStorage.removeItem('favorites');
    await checkSession();
}

export async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error fetching session:', error);
        return;
    }
    return session?.user || null;
}
