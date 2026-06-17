'use client';
import { useState, useEffect } from 'react';

export default function UsuariosPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [msgAddr, setMsgAddr] = useState('');
    const [form, setForm] = useState({ id: '', name: '', gmail: '', password: '', role: 'user' });
    const [addr, setAddr] = useState({ userId: '', street: '', city: '', number: '' });

    useEffect(() => {
        cargarUsuarios();
    }, []);

    async function cargarUsuarios() {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/users');
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
        const esActualizacion = form.id !== '';
        const url = esActualizacion ? `/api/v1/users/${form.id}` : '/api/v1/users';
        const metodo = esActualizacion ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    gmail: form.gmail,
                    password: form.password,
                    role: form.role
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error');
            setMsg(esActualizacion ? 'Usuario actualizado' : 'Usuario creado');
            setForm({ id: '', name: '', gmail: '', password: '', role: 'user' });
            cargarUsuarios();
        } catch (err) {
            setMsg('Error: ' + err.message);
        }
    }

<<<<<<< HEAD
  async function eliminarUsuario(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    console.log('Eliminando usuario con ID:', id);
    try {
      const res = await fetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      cargarUsuarios();
    } catch (err) {
      alert(err.message);
=======
    async function eliminarUsuario(id) {
        const idNum = Number(id);
        if (isNaN(idNum) || idNum <= 0) {
            alert('ID inválido');
            return;
        }
        if (!confirm('¿Eliminar este usuario?')) return;
        try {
            const res = await fetch(`/api/v1/users/${idNum}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Error al eliminar');
            cargarUsuarios();
        } catch (err) {
            alert(err.message);
        }
>>>>>>> 615c3d42c5d5cfb0113f34f4f986cda9ebc7b16c
    }

    function editarUsuario(user) {
        const idNum = Number(user.id);
        if (isNaN(idNum) || idNum <= 0) {
            alert('ID inválido');
            return;
        }
        setForm({
            id: idNum,
            name: user.name,
            gmail: user.gmail,
            password: '',
            role: user.role
        });
    }

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
                headers: { 'Content-Type': 'application/json' },
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
            setMsgAddr('Dirección actualizada');
            setAddr({ userId: '', street: '', city: '', number: '' });
            cargarUsuarios();
        } catch (err) {
            setMsgAddr('Error: ' + err.message);
        }
    }

    return (
        <div style={{ maxWidth: '700px', margin: '20px auto', fontFamily: 'Arial' }}>
            <h1>Usuarios</h1>

            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <h3>{form.id ? 'Actualizar usuario' : 'Nuevo usuario'}</h3>
                <form onSubmit={guardarUsuario}>
                    <input type="text" placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /><br/>
                    <input type="email" placeholder="Gmail" value={form.gmail} onChange={e => setForm({...form, gmail: e.target.value})} required /><br/>
                    <input type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!form.id} /><br/>
                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
                    </select><br/><br/>
                    <button type="submit">{form.id ? 'Actualizar' : 'Crear'}</button>
                    {form.id && <button type="button" onClick={() => setForm({ id: '', name: '', gmail: '', password: '', role: 'user' })}>Cancelar</button>}
                    <span style={{ marginLeft: '10px' }}>{msg}</span>
                </form>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <h3>Actualizar dirección</h3>
                <form onSubmit={guardarDireccion}>
                    <select value={addr.userId} onChange={e => setAddr({...addr, userId: e.target.value})}>
                        <option value="">Seleccionar usuario</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select><br/>
                    <input type="text" placeholder="Calle" value={addr.street} onChange={e => setAddr({...addr, street: e.target.value})} /><br/>
                    <input type="text" placeholder="Ciudad" value={addr.city} onChange={e => setAddr({...addr, city: e.target.value})} /><br/>
                    <input type="number" placeholder="Número" value={addr.number} onChange={e => setAddr({...addr, number: e.target.value})} /><br/><br/>
                    <button type="submit">Actualizar dirección</button>
                    <span style={{ marginLeft: '10px' }}>{msgAddr}</span>
                </form>
            </div>

            <h3>Lista de usuarios</h3>
            {loading ? <p>Cargando...</p> : (
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