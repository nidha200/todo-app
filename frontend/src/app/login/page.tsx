'use client'; 
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      // store token in localStorage for API calls
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.role) localStorage.setItem('role', data.role);
      }
      alert('Login successful!');
      router.push('/todos'); // Redirect to todos page after login
    } else {
      alert(`Login failed: ${data.message}`);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '350px',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          backgroundColor: 'white',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>LOGIN</h2>
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{ padding: '0.6rem', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{ padding: '0.6rem', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{
            padding: '0.7rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Login
        </button>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          Don't have an account?{' '}
          <Link href="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}
