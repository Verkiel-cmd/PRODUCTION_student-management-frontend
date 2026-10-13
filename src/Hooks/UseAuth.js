import { useState } from 'react';

export default function useAuth() {
    const [user] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    return { isAdmin: user?.role === 'admin' };
}