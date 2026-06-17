import { NextRequest, NextResponse } from 'next/server';
import { users, findUserById, findUserIndexById, isGmailTaken } from '@/lib/db';

function checkAuth(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return { status: 401, error: 'No autorizado' };
    const token = authHeader.split(' ')[1];
    if (token === 'admin-token') return { status: 200, role: 'admin' };
    if (token === 'user-token') return { status: 200, role: 'user' };
    return { status: 403, error: 'Prohibido' };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const auth = checkAuth(request);
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const id = Number(params.id);
    if (isNaN(id) || id <= 0) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const user = findUserById(id);
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const { password, ...rest } = user;
    return NextResponse.json(rest, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const auth = checkAuth(request);
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status });
    if (auth.role !== 'admin') return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

    const id = Number(params.id);
    if (isNaN(id) || id <= 0) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const index = findUserIndexById(id);
    if (index === -1) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    users.splice(index, 1);
    return NextResponse.json({ message: 'Usuario eliminado' }, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const auth = checkAuth(request);
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const id = Number(params.id);
    if (isNaN(id) || id <= 0) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const body = await request.json();
    const { name, gmail, password, role } = body;
    if (!name || !gmail || !password || !role) {
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const index = findUserIndexById(id);
    if (index === -1) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    if (isGmailTaken(gmail, id)) {
        return NextResponse.json({ error: 'Gmail ya registrado' }, { status: 409 });
    }

    users[index] = { ...users[index], name, gmail, password, role };
    const { password: _, ...updated } = users[index];
    return NextResponse.json(updated, { status: 200 });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const auth = checkAuth(request);
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const id = Number(params.id);
    if (isNaN(id) || id <= 0) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const body = await request.json();
    const { name, gmail, password, role } = body;

    const index = findUserIndexById(id);
    if (index === -1) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

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