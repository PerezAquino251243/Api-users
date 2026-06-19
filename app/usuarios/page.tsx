'use client';

import { useState, useEffect } from 'react';
import { logout } from '@/app/actions/logout'; // 👈 Importar la acción

const TOKEN = 'admin-token';

export default function UsuariosPage() {
  // Estados
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', gmail: '', password: '', role: 'user' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/users', {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const data = await res.json();
      setUsers(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function guardarUsuario(e) {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear');
      setMsg('Usuario creado correctamente');
      setForm({ name: '', gmail: '', password: '', role: 'user' });
      setModalOpen(false);
      cargarUsuarios();
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  }

  async function eliminarUsuario(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      const res = await fetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error('Error al eliminar');
      cargarUsuarios();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '20px auto', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Usuarios</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* 👇 Botón de logout */}
          <form action={logout}>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cerrar sesión
            </button>
          </form>
          {/* Botón de agregar usuario (ya existente) */}
          <button
            onClick={() => setModalOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Agregar usuario
          </button>
        </div>
      </div>

      {/* Modal (sin cambios) */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              color: '#000',
            }}
          >
            <h2 style={{ marginTop: 0, color: '#000' }}>Nuevo usuario</h2>
            <form onSubmit={guardarUsuario}>
              <input
                type="text"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#000',
                }}
              />
              <input
                type="email"
                placeholder="Gmail"
                value={form.gmail}
                onChange={(e) => setForm({ ...form, gmail: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#000',
                }}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#000',
                }}
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#000',
                }}
              >
                <option value="user">Usuario</option>
                <option value="admin">Admin</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setMsg('');
                    setForm({ name: '', gmail: '', password: '', role: 'user' });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
              {msg && (
                <p style={{ marginTop: '12px', color: '#28a745', fontWeight: 'bold' }}>{msg}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Lista de usuarios (sin cambios) */}
      <h3>Lista de usuarios</h3>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map((u) => (
            <li
              key={u.id}
              style={{
                borderBottom: '1px solid #eee',
                padding: '8px 0',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>{u.name}</strong> - {u.gmail} - {u.role}
                {u.address &&
                  ` - ${u.address.street || ''} ${u.address.number || ''}, ${u.address.city || ''}`}
              </div>
              <div>
                <button
                  onClick={() => alert('Editar no implementado en esta versión')}
                  style={{ marginRight: '8px' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarUsuario(u.id)}
                  style={{ color: 'red' }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}