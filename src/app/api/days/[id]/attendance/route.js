import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req, context) {
  try {
    const { id } = await context.params; // ID del día
    const {
      userName,
      breakfast,
      dinner,
      breakfastStart,
      breakfastEnd,
      breakfastHours,
      dinnerStart,
      dinnerEnd,
      dinnerHours,
    } = await req.json();

    if (!id || !userName) {
      throw new Error('ID del día o nombre de usuario faltante');
    }

    const userId = await getUserId(userName);
    if (!userId) {
      throw new Error(`Usuario con nombre ${userName} no encontrado`);
    }

    const parseTimeToDate = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return null;
    
      // Configurar un día fijo (1970-01-01)
      const date = new Date('1970-01-01T00:00:00');
      date.setUTCHours(hours, minutes, 0, 0); // Establecer explícitamente la hora y los minutos
    
      return date;
    };

    // Manejo de desayuno
    if (breakfast) {
      const breakfastStartDate = parseTimeToDate(breakfastStart);
      const breakfastEndDate = parseTimeToDate(breakfastEnd);

      if (breakfastStartDate && breakfastEndDate && breakfastHours !== undefined) {
        await prisma.shift.upsert({
          where: {
            userId_dayId_turn: {
              userId,
              dayId: parseInt(id, 10),
              turn: 'BREAKFAST',
            },
          },
          update: {
            startTime: breakfastStartDate,
            endTime: breakfastEndDate,
            totalHours: parseFloat(breakfastHours),
          },
          create: {
            userId,
            dayId: parseInt(id, 10),
            turn: 'BREAKFAST',
            startTime: breakfastStartDate,
            endTime: breakfastEndDate,
            totalHours: parseFloat(breakfastHours),
          },
        });
      }
    } else {
      // Eliminar registro de desayuno si se deseleccionó
      await prisma.shift.deleteMany({
        where: {
          userId,
          dayId: parseInt(id, 10),
          turn: 'BREAKFAST',
        },
      });
    }

    // Manejo de cena
    if (dinner) {
      const dinnerStartDate = parseTimeToDate(dinnerStart);
      const dinnerEndDate = parseTimeToDate(dinnerEnd);

      if (dinnerStartDate && dinnerEndDate && dinnerHours !== undefined) {
        await prisma.shift.upsert({
          where: {
            userId_dayId_turn: {
              userId,
              dayId: parseInt(id, 10),
              turn: 'DINNER',
            },
          },
          update: {
            startTime: dinnerStartDate,
            endTime: dinnerEndDate,
            totalHours: parseFloat(dinnerHours),
          },
          create: {
            userId,
            dayId: parseInt(id, 10),
            turn: 'DINNER',
            startTime: dinnerStartDate,
            endTime: dinnerEndDate,
            totalHours: parseFloat(dinnerHours),
          },
        });
      }
    } else {
      // Eliminar registro de cena si se deseleccionó
      await prisma.shift.deleteMany({
        where: {
          userId,
          dayId: parseInt(id, 10),
          turn: 'DINNER',
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Asistencia actualizada' }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la asistencia:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al actualizar la asistencia' }),
      { status: 500 }
    );
  }
}

export async function GET(req, context) {
  try {
    const { id } = await context.params; // ID del día
    const userName = new URL(req.url).searchParams.get('user'); // Buscar el parámetro `user`

    if (!id) {
      throw new Error('ID del día faltante');
    }

    const day = await prisma.day.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        shifts: {
          include: { user: true }, // Incluir la relación con el usuario
        },
      },
    });

    if (!day) {
      return new Response(JSON.stringify({ error: 'Día no encontrado' }), { status: 404 });
    }

    if (userName) {
      // Filtrar turnos del usuario específico
      const userShifts = day.shifts.filter((shift) => shift.user.name === userName);

      // Buscar turnos de desayuno y cena
      const breakfastShift = userShifts.find((shift) => shift.turn === 'BREAKFAST');
      const dinnerShift = userShifts.find((shift) => shift.turn === 'DINNER');

      return new Response(
        JSON.stringify({
          breakfast: !!breakfastShift,
          breakfastStart: breakfastShift?.startTime?.toISOString() || null,
          breakfastEnd: breakfastShift?.endTime?.toISOString() || null,
          breakfastHours: breakfastShift?.totalHours || 0,
          dinner: !!dinnerShift,
          dinnerStart: dinnerShift?.startTime?.toISOString() || null,
          dinnerEnd: dinnerShift?.endTime?.toISOString() || null,
          dinnerHours: dinnerShift?.totalHours || 0,
        }),
        { status: 200 }
      );
    } else {
      // Obtener lista de todos los usuarios y turnos
      const shifts = day.shifts.map((shift) => ({
        user: shift.user.name,
        turn: shift.turn,
        startTime: shift.startTime?.toISOString() || null,
        endTime: shift.endTime?.toISOString() || null,
        totalHours: shift.totalHours || 0,
      }));
      return new Response(
        JSON.stringify({ shifts }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error al obtener asistencia:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al obtener asistencia' }),
      { status: 500 }
    );
  }
}




// Helper: Obtener ID del usuario por nombre
async function getUserId(userName) {
  const user = await prisma.user.findUnique({
    where: { name: userName },
  });
  return user?.id || null;
}
