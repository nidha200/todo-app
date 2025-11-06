'use client';

import { useEffect, useState } from 'react';
import { Button, TextField, List, ListItem, Checkbox, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Card, CardContent, CardHeader, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getTodos, createTodo, updateTodo, deleteTodo, bulkDelete } from '../lib/api';
import { isAdmin, getUserId } from '../lib/auth';
import { useRouter } from 'next/navigation';

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectionMode, setSelectionMode] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await getTodos();
      setTodos(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load todos. Are you logged in?');
    }
  }

  useEffect(() => {
    load();
    try { setAdmin(isAdmin()); } catch (e) { setAdmin(false); }
    try { setUserId(getUserId()); } catch (e) { setUserId(null); }
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createTodo(newName.trim());
      setNewName('');
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggle(todo: any) {
    try {
      await updateTodo(todo.id, { completed: !todo.completed });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function saveEdit(id: string) {
    try {
      await updateTodo(id, { name: editingName });
      setEditingId(null);
      setEditingName('');
      load();
    } catch (err) {
      console.error(err);
    }
  }

  function toggleSelect(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  async function handleDelete(id: string) {
    setToDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!toDeleteId) return;
    try {
      await deleteTodo(toDeleteId);
      setConfirmOpen(false);
      setToDeleteId(null);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBulkDelete() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) return alert('No todos selected');
    setConfirmBulkOpen(true);
  }

  async function confirmBulkDelete() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    try {
      await bulkDelete(ids);
      setConfirmBulkOpen(false);
      setSelected({});
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Box sx={{ padding: 3, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', maxWidth: 760 }}>
        <CardHeader
          title="My Todos"
          action={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Only admins can enter selection mode and delete multiple todos */}
              {admin && (selectionMode ? (
                <>
                  <Button color="error" variant="outlined" onClick={handleBulkDelete} disabled={!Object.values(selected).some(Boolean)}>
                    Delete selected
                  </Button>
                  <Button onClick={() => { setSelected({}); setSelectionMode(false); }}>Cancel</Button>
                </>
              ) : (
                <Button onClick={() => setSelectionMode(true)}>Select</Button>
              ))}
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  try {
                    localStorage.removeItem('token');
                  } catch (e) {}
                  router.push('/');
                }}
              >
                Logout
              </Button>
            </div>
          }
        />
        <CardContent>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <TextField
              label="Add a new todo"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{ height: 40, alignSelf: 'center', px: 3 }}
            >
              Add
            </Button>
            {/* Inline bulk delete removed — header controls are the single source of bulk actions */}
          </div>

          <List>
        {todos.map((t) => (
          <ListItem
            key={t.id}
            sx={selected[t.id] ? { bgcolor: 'rgba(25,118,210,0.08)' } : undefined}
            secondaryAction={
              (admin || userId === t.userId) ? (
                <div>
                  {/* ✅ Disable edit/delete if completed */}
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    disabled={t.completed}
                    onClick={() => {
                      if (!t.completed) {
                        setEditingId(t.id);
                        setEditingName(t.name);
                      }
                    }}
                  >
                    <EditIcon color={t.completed ? 'disabled' : 'action'} />
                  </IconButton>
                  {admin && (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      disabled={t.completed}
                      onClick={() => {
                        if (!t.completed) handleDelete(t.id);
                      }}
                    >
                      <DeleteIcon color={t.completed ? 'disabled' : 'error'} />
                    </IconButton>
                  )}
                </div>
              ) : null
            }
          >
            <Checkbox
              checked={selectionMode ? !!selected[t.id] : t.completed}
              onClick={(e) => {
                e.stopPropagation();
                if (selectionMode) {
                  toggleSelect(t.id);
                } else {
                  toggle(t);
                }
              }}
              sx={{ mr: 1 }}
              inputProps={{
                'aria-label': selectionMode ? `select todo ${t.name}` : `toggle complete ${t.name}`,
                title: selectionMode ? 'Click to select for bulk actions' : 'Click to toggle complete',
              }}
            />
            {editingId === t.id && !t.completed ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <TextField
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <Button onClick={() => saveEdit(t.id)} variant="contained">
                  Save
                </Button>
                <Button onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            ) : (
              // ✅ Elegant strike-through + muted style when completed
              <span
                role="button"
                tabIndex={0}
                onClick={() => toggle(t)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(t); } }}
                aria-pressed={t.completed}
                style={{
                  marginLeft: 8,
                  textDecoration: t.completed ? 'line-through' : 'none',
                  textDecorationThickness: t.completed ? '2px' : undefined,
                  textDecorationColor: t.completed ? 'rgba(0,0,0,0.6)' : undefined,
                  color: t.completed ? 'rgba(0,0,0,0.6)' : undefined,
                  opacity: t.completed ? 0.85 : 1,
                  fontStyle: t.completed ? 'italic' : 'normal',
                  transition: 'all 0.18s ease-in-out',
                  cursor: 'pointer',
                  display: 'inline-block',
                  userSelect: 'none',
                }}
              >
                {t.name}
              </span>
            )}
          </ListItem>
        ))}
          </List>

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

          <Dialog open={confirmBulkOpen} onClose={() => setConfirmBulkOpen(false)}>
            <DialogTitle>Confirm delete</DialogTitle>
            <DialogContent>
              <DialogContentText>Are you sure you want to delete the selected todos?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmBulkOpen(false)}>Cancel</Button>
              <Button color="error" onClick={confirmBulkDelete}>Delete selected</Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
}
