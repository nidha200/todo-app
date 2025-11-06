'use client';
import { useState } from 'react';

export default function LogoutButton() {
  const [message, setMessage] = useState('');

  async function handleLogout() {
    try {
      const res = await fetch('http://localhost:8000/auth/logout', {
        method: 'POST', // or GET depending on your backend
        credentials: 'include', // include cookies if using session cookies
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Logged out successfully!');
      } else {
        setMessage(`Logout failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setMessage('Something went wrong while logging out.');
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <button
        onClick={handleLogout}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}
