import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, context) {
  try {
    const url = new URL(req.url);
    const userName = url.searchParams.get('user'); // Parámetro `user`
    const fortnighId = url.searchParams.get('fortnighId'); // Parámetro `fortnighId`

    if (!fortnighId) {
      return new Response(
        JSON.stringify({ error: 'ID de quincena faltante' }),
        { status: 400 }
      );
    }

    if (userName) {
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

      // Sumar las horas totales del usuario en la quincena
      const totalHours = await prisma.shift.aggregate({
        _sum: { totalHours: true },
        where: {
          userId: user.id,
          day: {
            fortnighId: parseInt(fortnighId, 10),
          },
        },
      });

      return new Response(
        JSON.stringify({ totalHours: totalHours._sum.totalHours || 0 }),
        { status: 200 }
      );
    }

    // Obtener las horas totales de todos los usuarios
    const users = await prisma.user.findMany({
      where: {
        userType: 'SALONERO', // Filtrar solo usuarios con userType "SALONERO"
      },
      include: {
        shifts: {
          where: {
            day: {
              fortnighId: parseInt(fortnighId, 10),
            },
          },
        },
      },
    });

    const report = users.map((user) => ({
      user: user.name,
      totalHours: user.shifts.reduce((sum, shift) => sum + shift.totalHours, 0),
    }));

    return new Response(JSON.stringify({ report }), { status: 200 });
  } catch (error) {
    console.error('Error al generar el reporte de horas:', error.message);
    return new Response(
      JSON.stringify({ error: 'Error al generar el reporte de horas' }),
      { status: 500 }
    );
  }
}
