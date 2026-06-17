import { NextRequest, NextResponse } from 'next/server';
import { users, getNextId, isGmailTaken } from '@/lib/db';

// GET /api/v1/users?page=1&limit=10&search=texto
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        if (page < 1 || limit < 1) {
            return NextResponse.json(
                { error: 'page y limit deben ser números mayores o iguales a 1' },
                { status: 400 }
            );
        }

        let filtered = users;
        if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(lower) ||
                u.gmail.toLowerCase().includes(lower)
            );
        }

        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);

        const data = paginated.map(({ password, ...rest }) => rest);

        return NextResponse.json({
            data,
            total: filtered.length,
            page,
            limit,
            totalPages: Math.ceil(filtered.length / limit)
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

// POST /api/v1/users
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, gmail, password, role } = body;

        if (!name || !gmail || !password || !role) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos: name, gmail, password, role' },
                { status: 400 }
            );
        }

        if (isGmailTaken(gmail)) {
            return NextResponse.json(
                { error: 'El gmail ya está registrado' },
                { status: 409 }
            );
        }

        const newUser = {
            id: getNextId(), // ← CORREGIDO
            name,
            gmail,
            password,
            role,
            address: null
        };
        users.push(newUser);

        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 400 }
        );
    }
}