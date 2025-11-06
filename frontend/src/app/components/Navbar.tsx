
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRole } from '../lib/auth';

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      setLoggedIn(!!token);
      try { setRole(getRole()); } catch (e) { setRole(null); }
    } catch (e) {
      setLoggedIn(false);
    }
  }, []);

  // Logout handler
  async function handleLogout() {
    try {
      const res = await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        // clear token and update UI
        try { localStorage.removeItem('token'); localStorage.removeItem('role'); } catch (e) {}
        setLoggedIn(false);
        alert(data.message || 'Logged out successfully!');
        router.push('/');
      } else {
        alert(data.message || 'Logout failed.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Error logging out');
    }
  }

  return (
    <nav
      style={{
        backgroundColor: '#f1f1f1',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <Link href="/" style={{ marginRight: '15px', textDecoration: 'none' }}>
          Home
        </Link>
        {!loggedIn && (
          <Link href="/register" style={{ marginRight: '15px', textDecoration: 'none' }}>
            Register
          </Link>
        )}

        {!loggedIn && (
          <Link href="/login" style={{ marginRight: '15px', textDecoration: 'none' }}>
            Login
          </Link>
        )}

        {loggedIn && (
          <>
            <Link href="/todos" style={{ marginRight: '15px', textDecoration: 'none' }}>
              Todos
            </Link>
            {role === 'admin' && (
              <>
                <Link href="/admin/users" style={{ marginRight: '15px', textDecoration: 'none' }}>
                  Users
                </Link>
                <Link href="/admin/todos" style={{ marginRight: '15px', textDecoration: 'none' }}>
                  Admin Todos
                </Link>
              </>
            )}
            {role && <span style={{ marginRight: '10px' }}>{role.toUpperCase()}</span>}
            <button onClick={handleLogout} style={{ marginLeft: 8 }}>
              Logout
            </button>
          </>
        )}
        {/* Shortcut for admins to reach admin login when logged out */}
        {!loggedIn && (
          <Link href="/admin/login" style={{ marginLeft: 12, textDecoration: 'none' }}>
            Admin Login
          </Link>
        )}
      </div>
    </nav>
  );
}

