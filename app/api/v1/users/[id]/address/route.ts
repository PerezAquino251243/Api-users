import { NextRequest, NextResponse } from 'next/server';
import { users, findUserIndexById } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (isNaN(id) || id <= 0) {
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

        const index = findUserIndexById(id);
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