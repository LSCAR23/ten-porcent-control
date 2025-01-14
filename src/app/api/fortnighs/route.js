import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, startDate, endDate } = body;
        // Verificar si la quincena ya existe
        const existingFortnigh = await prisma.fortnigh.findUnique({
            where: { name },
        });

        if (existingFortnigh) {
            return new Response(JSON.stringify({ error: 'La quincena ya ha sido iniciada' }), { status: 409 });
        }

        const days = [];
        for (let date = new Date(startDate); date <= new Date(endDate); date.setDate(date.getDate() + 1)) {
            const day = await prisma.day.create({
                data: {
                    date: new Date(date)
                },
            });
            days.push({ id: day.id });
        }
        const fortnigh = await prisma.fortnigh.create({
            data: {
                name,
                days: {
                    connect: days, // Asociar los días creados
                },
            },
        });

        return new Response(JSON.stringify(fortnigh), { status: 201 });
    } catch (error) {
        console.error('Error al crear la quincena:', error instanceof Error ? error.message : error);
        return new Response(
            JSON.stringify({ error: 'Error al crear la quincena' }),
            { status: 500 }
        );

    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    if (!name) {
        return new Response(JSON.stringify({ error: 'Nombre de la quincena requerido' }), { status: 400 });
    }

    const existingFortnigh = await prisma.fortnigh.findUnique({
        where: { name },
    });

    return new Response(
        JSON.stringify({ exists: !!existingFortnigh }),
        { status: 200 }
    );
}
