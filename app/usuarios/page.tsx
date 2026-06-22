'use client';

import { useState, useEffect } from 'react';
import { logout } from '@/app/actions/logout';

const TOKEN = 'admin-token';

export default function UsuariosPage() {
  // Estados para la lista
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el modal de creación
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    gmail: '',
    password: '',
    role: 'user',
    address: { street: '', city: '', number: '' },
  });
  const [createMsg, setCreateMsg] = useState('');

  // Estados para el modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    gmail: '',
    password: '',
    role: 'user',
    address: { street: '', city: '', number: '' },
  });
  const [editMsg, setEditMsg] = useState('');

  // Cargar usuarios al montar
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

  // ---- Crear usuario ----
  async function handleCreate(e) {
    e.preventDefault();
    setCreateMsg('');
    try {
      const body = {
        name: createForm.name,
        gmail: createForm.gmail,
        password: createForm.password,
        role: createForm.role,
      };
      const { street, city, number } = createForm.address;
      if (street || city || number) {
        body.address = {
          street: street || undefined,
          city: city || undefined,
          number: number ? parseInt(number) : undefined,
        };
      }

      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear');
      setCreateMsg('Usuario creado correctamente');
      setCreateForm({
        name: '',
        gmail: '',
        password: '',
        role: 'user',
        address: { street: '', city: '', number: '' },
      });
      setCreateModalOpen(false);
      cargarUsuarios();
    } catch (err) {
      setCreateMsg('Error: ' + err.message);
    }
  }

  // ---- Editar usuario ----
  function openEditModal(user) {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      gmail: user.gmail,
      password: '',
      role: user.role,
      address: user.address ? { ...user.address } : { street: '', city: '', number: '' },
    });
    setEditMsg('');
    setEditModalOpen(true);
  }

  async function handleEdit(e) {
    e.preventDefault();
    setEditMsg('');
    try {
      const userUpdate = {
        name: editForm.name,
        gmail: editForm.gmail,
        role: editForm.role,
      };
      if (editForm.password) {
        userUpdate.password = editForm.password;
      }

      const resUser = await fetch(`/api/v1/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(userUpdate),
      });
      if (!resUser.ok) {
        const errData = await resUser.json();
        throw new Error(errData.error || 'Error al actualizar usuario');
      }

      const { street, city, number } = editForm.address;
      if (street || city || number) {
        const addressData = {
          street: street || undefined,
          city: city || undefined,
          number: number ? parseInt(number) : undefined,
        };
        const resAddr = await fetch(`/api/v1/users/${editingUser.id}/address`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify(addressData),
        });
        if (!resAddr.ok) {
          const errData = await resAddr.json();
          throw new Error(errData.error || 'Error al actualizar dirección');
        }
      }

      setEditMsg('Usuario actualizado correctamente');
      setEditModalOpen(false);
      cargarUsuarios();
    } catch (err) {
      setEditMsg('Error: ' + err.message);
    }
  }

  // ---- Eliminar usuario ----
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
    <div style={{ maxWidth: '800px', margin: '20px auto', fontFamily: 'Arial' }}>
      {/* Encabezado con botones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Usuarios</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
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
          <button
            onClick={() => setCreateModalOpen(true)}
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

      {/* Modal de creación */}
      {createModalOpen && (
        <Modal
          title="Nuevo usuario"
          onClose={() => {
            setCreateModalOpen(false);
            setCreateMsg('');
            setCreateForm({
              name: '',
              gmail: '',
              password: '',
              role: 'user',
              address: { street: '', city: '', number: '' },
            });
          }}
        >
          <form onSubmit={handleCreate}>
            <Input
              type="text"
              placeholder="Nombre"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Gmail"
              value={createForm.gmail}
              onChange={(e) => setCreateForm({ ...createForm, gmail: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
            />
            <Select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              options={[
                { value: 'user', label: 'Usuario' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <h4 style={{ margin: '10px 0 5px', color: '#000' }}>Dirección (opcional)</h4>
            <Input
              type="text"
              placeholder="Calle"
              value={createForm.address.street}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  address: { ...createForm.address, street: e.target.value },
                })
              }
            />
            <Input
              type="text"
              placeholder="Ciudad"
              value={createForm.address.city}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  address: { ...createForm.address, city: e.target.value },
                })
              }
            />
            <Input
              type="number"
              placeholder="Número"
              value={createForm.address.number}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  address: { ...createForm.address, number: e.target.value },
                })
              }
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <Button type="submit" bg="#0070f3">
                Guardar
              </Button>
              <Button
                type="button"
                bg="#dc3545"
                onClick={() => {
                  setCreateModalOpen(false);
                  setCreateMsg('');
                  setCreateForm({
                    name: '',
                    gmail: '',
                    password: '',
                    role: 'user',
                    address: { street: '', city: '', number: '' },
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
            {createMsg && (
              <p style={{ marginTop: '12px', color: '#28a745', fontWeight: 'bold' }}>{createMsg}</p>
            )}
          </form>
        </Modal>
      )}

      {/* Modal de edición */}
      {editModalOpen && editingUser && (
        <Modal
          title="Editar usuario"
          onClose={() => {
            setEditModalOpen(false);
            setEditMsg('');
            setEditingUser(null);
          }}
        >
          <form onSubmit={handleEdit}>
            <Input
              type="text"
              placeholder="Nombre"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Gmail"
              value={editForm.gmail}
              onChange={(e) => setEditForm({ ...editForm, gmail: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Nueva contraseña (dejar en blanco para no cambiar)"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            />
            <Select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              options={[
                { value: 'user', label: 'Usuario' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <h4 style={{ margin: '10px 0 5px', color: '#000' }}>Dirección</h4>
            <Input
              type="text"
              placeholder="Calle"
              value={editForm.address.street}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  address: { ...editForm.address, street: e.target.value },
                })
              }
            />
            <Input
              type="text"
              placeholder="Ciudad"
              value={editForm.address.city}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  address: { ...editForm.address, city: e.target.value },
                })
              }
            />
            <Input
              type="number"
              placeholder="Número"
              value={editForm.address.number}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  address: { ...editForm.address, number: e.target.value },
                })
              }
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <Button type="submit" bg="#0070f3">
                Actualizar
              </Button>
              <Button
                type="button"
                bg="#dc3545"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditMsg('');
                  setEditingUser(null);
                }}
              >
                Cancelar
              </Button>
            </div>
            {editMsg && (
              <p style={{ marginTop: '12px', color: '#28a745', fontWeight: 'bold' }}>{editMsg}</p>
            )}
          </form>
        </Modal>
      )}

      {/* Lista de usuarios */}
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
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{u.name}</strong> - {u.gmail} - {u.role}
                {u.address &&
                  ` - ${u.address.street || ''} ${u.address.number || ''}, ${u.address.city || ''}`}
              </div>
              <div>
                <button
                  onClick={() => openEditModal(u)}
                  style={{ marginRight: '8px', padding: '4px 10px', cursor: 'pointer' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarUsuario(u.id)}
                  style={{ color: 'red', padding: '4px 10px', cursor: 'pointer' }}
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

// ---- Componentes auxiliares (reutilizables) ----
function Modal({ title, children, onClose }) {
  return (
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
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          color: '#000',
        }}
      >
        <h2 style={{ marginTop: 0, color: '#000' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Input({ type, placeholder, value, onChange, required }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      style={{
        width: '100%',
        padding: '8px',
        marginBottom: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: 'white',
        color: '#000',
        boxSizing: 'border-box',
      }}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '8px',
        marginBottom: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: 'white',
        color: '#000',
        boxSizing: 'border-box',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Button({ type, bg, children, onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: '8px 16px',
        backgroundColor: bg,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}