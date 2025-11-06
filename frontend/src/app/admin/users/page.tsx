"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRole } from '../../lib/auth';
import { setUserRole } from '../../lib/api';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<any | null>(null);
  const [targetRole, setTargetRole] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch('http://localhost:8000/auth/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || 'Failed to load');
        return;
      }
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError('Failed to load users');
    }
  }

  const router = useRouter();

  useEffect(() => { load(); }, []);

  async function handleLogout() {
    try {
      // best-effort notify backend
      await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (e) {
      // ignore network errors
    }
    try { localStorage.removeItem('token'); localStorage.removeItem('role'); } catch (e) {}
    router.push('/');
  }

  function openConfirm(user: any, role: string) {
    setTargetUser(user);
    setTargetRole(role);
    setConfirmOpen(true);
  }

  async function confirmChange() {
    if (!targetUser || !targetRole) return;
    try {
      await setUserRole(targetUser.id, targetRole);
      setConfirmOpen(false);
      setTargetUser(null);
      setTargetRole(null);
      load();
    } catch (e) {
      setError('Failed to update role');
    }
  }

  if (getRole() !== 'admin') return <div style={{ padding: 20 }}>Access denied</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Users</h2>
        <div>
          <Button variant="outlined" onClick={load} sx={{ mr: 1 }}>Reload</Button>
          <Button color="secondary" variant="outlined" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{u.name}</td>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>{u.role}</td>
              <td style={{ padding: 8 }}>
                {u.role !== 'admin' ? (
                  <Button variant="outlined" color="primary" onClick={() => openConfirm(u, 'admin')}>Make admin</Button>
                ) : (
                  <Button variant="outlined" color="secondary" onClick={() => openConfirm(u, 'user')}>Revoke admin</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm role change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {targetUser && targetRole ? `Are you sure you want to change ${targetUser.name} to role ${targetRole}?` : 'Confirm role change'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="primary" onClick={confirmChange}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
