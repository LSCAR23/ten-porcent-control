import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, context) {
  try {
    const { id } = await context.params; // Obtener el ID de la quincena desde los parámetros

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de la quincena faltante' }),
        { status: 400 }
      );
    }

    // Obtener los días relacionados con la quincena
    const days = await prisma.day.findMany({
      where: {
        fortnighId: parseInt(id, 10), // Filtrar por ID de la quincena
      },
      orderBy: {
        date: 'asc', // Ordenar los días por fecha
      },
      select: {
        id: true,
        date: true,
      },
    });

    return new Response(JSON.stringify(days), { status: 200 });
  } catch (error) {
    console.error('Error al obtener los días de la quincena:', error.message);
    return new Response(
      JSON.stringify({ error: 'Error al obtener los días de la quincena' }),
      { status: 500 }
    );
  }
}
