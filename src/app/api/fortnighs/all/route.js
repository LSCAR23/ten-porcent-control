import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, res) {
  try {
    // Obtener todas las quincenas ordenadas por fecha de inicio
    const fortnights = await prisma.fortnigh.findMany({
      orderBy: {
        id: 'desc', // Ordenar por fecha de inicio
      },
      select: {
        id: true,
        name: true,
      },
    });

    return new Response(JSON.stringify(fortnights), { status: 200 });
  } catch (error) {
    console.error('Error al obtener las quincenas:', error.message);
    return new Response(
      JSON.stringify({ error: 'Error al obtener las quincenas' }),
      { status: 500 }
    );
  }
}
