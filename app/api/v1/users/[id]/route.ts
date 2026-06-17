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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    const index = findUserIndexById(id);
    if (index === -1) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    users.splice(index, 1);
    return NextResponse.json({ message: 'Usuario eliminado' }, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
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