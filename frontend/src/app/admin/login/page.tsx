"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      if (data.role !== 'admin') {
        setError('This login is not an admin account');
        // clear any token
        try { localStorage.removeItem('token'); localStorage.removeItem('role'); } catch (e) {}
        return;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
      }
      router.push('/admin/users');
    } else {
      setError(data.message || 'Login failed');
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f7f7f7' }}>
      <form onSubmit={handleSubmit} style={{ width: 420, padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center' }}>ADMIN LOGIN</h2>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#d32f2f', color: 'white', border: 'none', borderRadius: 4 }}>Login as admin</button>
      </form>
    </div>
  );
}
