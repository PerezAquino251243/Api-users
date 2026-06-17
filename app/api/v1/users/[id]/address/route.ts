import { NextRequest, NextResponse } from 'next/server';
import { users, findUserIndexById } from '@/lib/db';

<<<<<<< HEAD
// Simulación de autenticación (igual que antes)
function checkAuth(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return { status: 401, error: 'No autorizado' };
    }
    const token = authHeader.split(' ')[1];
    if (token === 'admin-token' || token === 'user-token') {
        return { status: 200 };
    }
    return { status: 403, error: 'Prohibido' };
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const auth = checkAuth(request);
        if (auth.status !== 200) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await context.params;
        const userId = parseInt(id);
        if (isNaN(userId)) {
=======
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (isNaN(id) || id <= 0) {
>>>>>>> 615c3d42c5d5cfb0113f34f4f986cda9ebc7b16c
            return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
        }

        const body = await request.json();
        const { street, city, number } = body;

        if (street === undefined && city === undefined && number === undefined) {
            return NextResponse.json(
                { error: 'Debe enviar al menos un campo de dirección (street, city, number)' },
                { status: 400 }
            );
        }

        const index = findUserIndexById(userId);
        if (index === -1) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        if (!users[index].address) {
            users[index].address = {};
        }

        if (street !== undefined) users[index].address!.street = street;
        if (city !== undefined) users[index].address!.city = city;
        if (number !== undefined) users[index].address!.number = number;

        const { password, ...userWithoutPassword } = users[index];
        return NextResponse.json(userWithoutPassword, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 400 }
        );
    }
}