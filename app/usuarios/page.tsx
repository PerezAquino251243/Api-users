'use client';

import { useState, useEffect } from 'react';

const TOKEN = 'admin-token';

export default function UsuariosPage() {
  // Estados para la lista
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para el modal
  const [showModal, setShowModal] = useState(false);

  // Estado para el formulario de creación (solo para crear)
  const [newUser, setNewUser] = useState({ name: '', gmail: '', password: '', role: 'user' });
  const [msg, setMsg] = useState('');

  // Estados para edición (sin modal, directo en la lista)
  const [editForm, setEditForm] = useState({ id: '', name: '', gmail: '', password: '', role: 'user' });
  const [editMsg, setEditMsg] = useState('');

  // Estados para dirección
  const [addr, setAddr] = useState({ userId: '', street: '', city: '', number: '' });
  const [msgAddr, setMsgAddr] = useState('');

  // Cargar usuarios al inicio
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // === FUNCIONES CRUD ===

  async function cargarUsuarios() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/users', {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      const data = await res.json();
      setUsers(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Crear usuario (desde modal)
  async function crearUsuario(e) {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          name: newUser.name,
          gmail: newUser.gmail,
          password: newUser.password,
          role: newUser.role
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setMsg('Usuario creado correctamente');
      setNewUser({ name: '', gmail: '', password: '', role: 'user' });
      cargarUsuarios();
      // Cerrar modal después de éxito
      setTimeout(() => {
        setShowModal(false);
        setMsg('');
      }, 1000);
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  }

  // Actualizar usuario (desde lista)
  async function actualizarUsuario(e) {
    e.preventDefault();
    setEditMsg('');
    if (!editForm.id) return;
    try {
      const res = await fetch(`/api/v1/users/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          name: editForm.name,
          gmail: editForm.gmail,
          password: editForm.password,
          role: editForm.role
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setEditMsg('Usuario actualizado correctamente');
      setEditForm({ id: '', name: '', gmail: '', password: '', role: 'user' });
      cargarUsuarios();
      setTimeout(() => setEditMsg(''), 2000);
    } catch (err) {
      setEditMsg('Error: ' + err.message);
    }
  }

  // Eliminar usuario
  async function eliminarUsuario(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      const res = await fetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      cargarUsuarios();
    } catch (err) {
      alert(err.message);
    }
  }

  // Cargar datos en el formulario de edición
  function editarUsuario(user) {
    setEditForm({
      id: user.id,
      name: user.name,
      gmail: user.gmail,
      password: '',
      role: user.role
    });
  }

  // Cancelar edición
  function cancelarEdicion() {
    setEditForm({ id: '', name: '', gmail: '', password: '', role: 'user' });
    setEditMsg('');
  }

  // Actualizar dirección
  async function guardarDireccion(e) {
    e.preventDefault();
    setMsgAddr('');
    if (!addr.userId) {
      setMsgAddr('Selecciona un usuario');
      return;
    }
    try {
      const res = await fetch(`/api/v1/users/${addr.userId}/address`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
          street: addr.street,
          city: addr.city,
          number: addr.number ? parseInt(addr.number) : undefined
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error');
      }
      setMsgAddr('Dirección actualizada correctamente');
      setAddr({ userId: '', street: '', city: '', number: '' });
      cargarUsuarios();
      setTimeout(() => setMsgAddr(''), 2000);
    } catch (err) {
      setMsgAddr('Error: ' + err.message);
    }
  }

  // === RENDER ===

  return (
    <div style={{ maxWidth: '700px', margin: '20px auto', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Usuarios</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Agregar
        </button>
      </div>

      {/* === MODAL PARA CREAR === */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            <h3>Nuevo usuario</h3>
            <form onSubmit={crearUsuario}>
              <input
                type="text"
                placeholder="Nombre"
                value={newUser.name}
                onChange={e => setNewUser({...newUser, name: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              /><br/>
              <input
                type="email"
                placeholder="Gmail"
                value={newUser.gmail}
                onChange={e => setNewUser({...newUser, gmail: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              /><br/>
              <input
                type="password"
                placeholder="Contraseña"
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              /><br/>
              <select
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value})}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              >
                <option value="user">Usuario</option>
                <option value="admin">Admin</option>
              </select><br/>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setMsg(''); setNewUser({ name: '', gmail: '', password: '', role: 'user' }); }}
                  style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
              {msg && <p style={{ marginTop: '10px' }}>{msg}</p>}
            </form>
          </div>
        </div>
      )}

      {/* === FORMULARIO DE EDICIÓN (en línea) === */}
      {editForm.id && (
        <div style={{ border: '1px solid #ccc', padding: '15px', margin: '20px 0' }}>
          <h3>Actualizar usuario</h3>
          <form onSubmit={actualizarUsuario}>
            <input
              type="text"
              placeholder="Nombre"
              value={editForm.name}
              onChange={e => setEditForm({...editForm, name: e.target.value})}
              required
            /><br/>
            <input
              type="email"
              placeholder="Gmail"
              value={editForm.gmail}
              onChange={e => setEditForm({...editForm, gmail: e.target.value})}
              required
            /><br/>
            <input
              type="password"
              placeholder="Contraseña (opcional)"
              value={editForm.password}
              onChange={e => setEditForm({...editForm, password: e.target.value})}
            /><br/>
            <select
              value={editForm.role}
              onChange={e => setEditForm({...editForm, role: e.target.value})}
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select><br/><br/>
            <button type="submit">Actualizar</button>
            <button type="button" onClick={cancelarEdicion} style={{ marginLeft: '10px' }}>Cancelar</button>
            <span style={{ marginLeft: '10px' }}>{editMsg}</span>
          </form>
        </div>
      )}

      {/* === FORMULARIO DE DIRECCIÓN === */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Actualizar dirección</h3>
        <form onSubmit={guardarDireccion}>
          <select
            value={addr.userId}
            onChange={e => setAddr({...addr, userId: e.target.value})}
          >
            <option value="">Seleccionar usuario</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select><br/>
          <input
            type="text"
            placeholder="Calle"
            value={addr.street}
            onChange={e => setAddr({...addr, street: e.target.value})}
          /><br/>
          <input
            type="text"
            placeholder="Ciudad"
            value={addr.city}
            onChange={e => setAddr({...addr, city: e.target.value})}
          /><br/>
          <input
            type="number"
            placeholder="Número"
            value={addr.number}
            onChange={e => setAddr({...addr, number: e.target.value})}
          /><br/><br/>
          <button type="submit">Actualizar dirección</button>
          <span style={{ marginLeft: '10px' }}>{msgAddr}</span>
        </form>
      </div>

      {/* === LISTA DE USUARIOS === */}
      <h3>Lista de usuarios</h3>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map(u => (
            <li key={u.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
              <strong>{u.name}</strong> - {u.gmail} - {u.role}
              {u.address && ` - ${u.address.street || ''} ${u.address.number || ''}, ${u.address.city || ''}`}
              <br/>
              <button onClick={() => editarUsuario(u)}>Editar</button>
              <button onClick={() => eliminarUsuario(u.id)} style={{ color: 'red', marginLeft: '10px' }}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}