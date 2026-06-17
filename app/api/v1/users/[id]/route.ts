import { NextRequest, NextResponse } from 'next/server';
import { users, findUserById, findUserIndexById, isGmailTaken } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    const user = findUserById(id);
    if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    const { password, ...rest } = user;
    return NextResponse.json(rest, { status: 200 });
}

<<<<<<< HEAD
// GET /api/v1/users/:id
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Simular autenticación (401)
        const auth = checkAuthAndPermissions(request);
        if (auth.status !== 200) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await context.params;
        const userId = parseInt(id);
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        const user = findUserById(userId);
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
=======
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
>>>>>>> 615c3d42c5d5cfb0113f34f4f986cda9ebc7b16c
    }
    const index = findUserIndexById(id);
    if (index === -1) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    users.splice(index, 1);
    return NextResponse.json({ message: 'Usuario eliminado' }, { status: 200 });
}

<<<<<<< HEAD
// DELETE /api/v1/users/:id
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // <-- Cambio aquí: params es una Promesa
) {
    try {
        const auth = checkAuthAndPermissions(request);
        if (auth.status !== 200) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }
        if (auth.role !== 'admin') {
            return NextResponse.json({ error: 'No tienes permisos para eliminar usuarios' }, { status: 403 });
        }

        // Esperar los params
        const { id } = await context.params; 

        const userId = parseInt(id);
        if (isNaN(userId)) {
            return NextResponse.json({ error: `ID inválido: ${id}` }, { status: 400 });
        }

        const index = findUserIndexById(userId);
        if (index === -1) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        users.splice(index, 1);
        return NextResponse.json({ message: 'Usuario eliminado correctamente' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
=======
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
>>>>>>> 615c3d42c5d5cfb0113f34f4f986cda9ebc7b16c
    }
    const body = await request.json();
    const { name, gmail, password, role } = body;
    if (!name || !gmail || !password || !role) {
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }
    const index = findUserIndexById(id);
    if (index === -1) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    if (isGmailTaken(gmail, id)) {
        return NextResponse.json({ error: 'Gmail ya registrado' }, { status: 409 });
    }
    users[index] = { ...users[index], name, gmail, password, role };
    const { password: _, ...updated } = users[index];
    return NextResponse.json(updated, { status: 200 });
}

<<<<<<< HEAD
// PUT /api/v1/users/:id (actualización completa)
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = checkAuthAndPermissions(request);
        if (auth.status !== 200) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await context.params;
        const userId = parseInt(id);
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        const body = await request.json();
        const { name, gmail, password, role } = body;

        if (!name || !gmail || !password || !role) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos: name, gmail, password, role' },
                { status: 400 }
            );
        }

        const index = findUserIndexById(userId);
        if (index === -1) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        if (isGmailTaken(gmail, userId)) {
            return NextResponse.json(
                { error: 'El gmail ya está registrado por otro usuario' },
                { status: 409 }
            );
        }

        // Actualizar todos los campos
        users[index] = {
            ...users[index],
            name,
            gmail,
            password,
            role
        };

        const { password: _, ...updated } = users[index];
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 400 });
    }
}

// PATCH /api/v1/users/:id (actualización parcial)
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = checkAuthAndPermissions(request);
        if (auth.status !== 200) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await context.params;
        const userId = parseInt(id);
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        const body = await request.json();
        const { name, gmail, password, role } = body;

        const index = findUserIndexById(userId);
        if (index === -1) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Validar duplicado de gmail si se envía
        if (gmail && isGmailTaken(gmail, userId)) {
            return NextResponse.json(
                { error: 'El gmail ya está registrado por otro usuario' },
                { status: 409 }
            );
        }

        // Actualizar solo los campos enviados
        const updatedUser = {
            ...users[index],
            ...(name && { name }),
            ...(gmail && { gmail }),
            ...(password && { password }),
            ...(role && { role }),
        };
        users[index] = updatedUser;

        const { password: _, ...updated } = users[index];
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 400 });
=======
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    const body = await request.json();
    const { name, gmail, password, role } = body;
    const index = findUserIndexById(id);
    if (index === -1) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
>>>>>>> 615c3d42c5d5cfb0113f34f4f986cda9ebc7b16c
    }
    if (gmail && isGmailTaken(gmail, id)) {
        return NextResponse.json({ error: 'Gmail ya registrado' }, { status: 409 });
    }
    const updated = { ...users[index] };
    if (name) updated.name = name;
    if (gmail) updated.gmail = gmail;
    if (password) updated.password = password;
    if (role) updated.role = role;
    users[index] = updated;
    const { password: _, ...result } = updated;
    return NextResponse.json(result, { status: 200 });
}