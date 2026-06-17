import { NextRequest, NextResponse } from 'next/server';
import { users, findUserById, findUserIndexById, isGmailTaken } from '@/lib/db';

// Helper para responder con 401 o 403 (simulados)
// En una implementación real, aquí validarías el token y permisos
function checkAuthAndPermissions(request: NextRequest, userId?: number) {
    // Simular autenticación: si no hay header 'Authorization', devolver 401
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return { status: 401, error: 'No autorizado' };
    }
    // Simular que solo el admin puede eliminar o actualizar roles
    // Por ejemplo, si el token es 'admin-token' tiene permisos, si no, 403
    // Esto es solo para cumplir con los códigos de estado.
    // Puedes personalizarlo.
    const token = authHeader.split(' ')[1];
    if (token === 'admin-token') {
        return { status: 200, role: 'admin' };
    } else if (token === 'user-token') {
        // Usuario normal, permitir solo si es su propio id (para PUT/PATCH/DELETE)
        // Pero como es simulación, permitimos todo para usuario con user-token,
        // excepto que quieras bloquear ciertas acciones.
        return { status: 200, role: 'user' };
    } else {
        return { status: 403, error: 'Prohibido' };
    }
}

// GET /api/v1/users/:id
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Simular autenticación (401)
        const auth = checkAuthAndPermissions(request);
        if (auth.status !== 200) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        const user = findUserById(id);
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

// DELETE /api/v1/users/:id
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Simular autenticación (401 y 403)
        const auth = checkAuthAndPermissions(request);
        if (auth.status !== 200) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }
        // Si el usuario no es admin, podría devolver 403 (ejemplo)
        if (auth.role !== 'admin') {
            return NextResponse.json({ error: 'No tienes permisos para eliminar usuarios' }, { status: 403 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        const index = findUserIndexById(id);
        if (index === -1) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        users.splice(index, 1);
        return NextResponse.json({ message: 'Usuario eliminado correctamente' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

// PUT /api/v1/users/:id (actualización completa)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auth = checkAuthAndPermissions(request);
        if (auth.status !== 200) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
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

        const index = findUserIndexById(id);
        if (index === -1) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        if (isGmailTaken(gmail, id)) {
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
    { params }: { params: { id: string } }
) {
    try {
        const auth = checkAuthAndPermissions(request);
        if (auth.status !== 200) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        const body = await request.json();
        const { name, gmail, password, role } = body;

        const index = findUserIndexById(id);
        if (index === -1) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Validar duplicado de gmail si se envía
        if (gmail && isGmailTaken(gmail, id)) {
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
    }
}