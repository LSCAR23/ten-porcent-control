import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, context) {
  try {
    const url = new URL(req.url);
    const userName = url.searchParams.get('user'); // Buscar el parámetro `user`
    const fortnighId = url.searchParams.get('fortnighId'); // Buscar el parámetro `fortnighId`

    if (!userName || !fortnighId) {
      return new Response(
        JSON.stringify({ error: 'Nombre de usuario o ID de quincena faltante' }),
        { status: 400 }
      );
    }

    // Obtener el ID del usuario
    const user = await prisma.user.findUnique({
      where: { name: userName },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404 }
      );
    }

    // Sumar las horas totales de los shifts relacionados con la quincena
    const totalHours = await prisma.shift.aggregate({
      _sum: { totalHours: true },
      where: {
        userId: user.id,
        day: {
          fortnighId: parseInt(fortnighId, 10), // Filtrar por ID de la quincena
        },
      },
    });

    return new Response(
      JSON.stringify({ totalHours: totalHours._sum.totalHours || 0 }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al calcular las horas totales:', error.message);
    return new Response(
      JSON.stringify({ error: 'Error al calcular las horas totales' }),
      { status: 500 }
    );
  }
}
