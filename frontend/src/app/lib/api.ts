import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

export const getTodos = () => api.get('/todos');
export const createTodo = (name: string) => api.post('/todos', { name });
export const updateTodo = (id: string, data: any) => api.patch(`/todos/${id}`, data);
export const deleteTodo = (id: string) => api.delete(`/todos/${id}`);
export const bulkDelete = (ids: string[]) => api.post('/todos/bulk-delete', { ids });
export const setUserRole = (userId: string, role: string) => api.patch(`/auth/users/${userId}/role`, { role });

export default api;
