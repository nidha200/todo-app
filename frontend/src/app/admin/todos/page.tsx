"use client";

import { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function AdminTodosPage() {
  const [todos, setTodos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  async function load() {
    try {
      const res = await fetch('http://localhost:8000/todos', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || 'Failed to load');
        return;
      }
      const data = await res.json();
      setTodos(data);
    } catch (e) {
      setError('Failed to load todos');
    }
  }

  useEffect(() => { load(); }, []);

  function logout() {
    try { localStorage.removeItem('token'); localStorage.removeItem('role'); } catch (e) {}
    router.push('/');
  }

  function handleDelete(id: string) {
    setToDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!toDeleteId) return;
    try {
      const res = await fetch(`http://localhost:8000/todos/${toDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || 'Delete failed');
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      setToDeleteId(null);
      load();
    } catch (e) {
      setError('Delete failed');
      setConfirmOpen(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>All Todos (admin)</h2>
        <div>
          <Button variant="outlined" onClick={load} sx={{ mr: 1 }}>Reload</Button>
          <Button color="secondary" variant="outlined" onClick={logout}>Logout</Button>
        </div>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Completed</th>
            <th style={{ textAlign: 'left', padding: 8 }}>User</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((t) => (
            <tr key={t.id} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{t.id}</td>
              <td style={{ padding: 8 }}>{t.name}</td>
              <td style={{ padding: 8 }}>{t.completed ? 'Yes' : 'No'}</td>
              <td style={{ padding: 8 }}>{t.userId}</td>
              <td style={{ padding: 8 }}>
                <Button color="error" variant="outlined" onClick={() => handleDelete(t.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this todo?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
