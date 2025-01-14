import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const { userName, breakfast, dinner } = await req.json();

    const updateData = {};

    // Manejo de desayuno
    if (breakfast !== undefined) {
      updateData.breakfast = breakfast
        ? { connect: [{ name: userName }] } // Conectar usuario si es true
        : { disconnect: [{ name: userName }] }; // Desconectar usuario si es false
    }

    // Manejo de cena
    if (dinner !== undefined) {
      updateData.dinner = dinner
        ? { connect: [{ name: userName }] } // Conectar usuario si es true
        : { disconnect: [{ name: userName }] }; // Desconectar usuario si es false
    }

    // Actualizar datos en la base de datos
    await prisma.day.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    return new Response(JSON.stringify({ message: 'Asistencia actualizada' }), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la asistencia:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar la asistencia' }),
      { status: 500 }
    );
  }
}

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const userName = new URL(req.url).searchParams.get('user'); // Buscar el parámetro `user`

    const day = await prisma.day.findUnique({
      where: { id: parseInt(id, 10) },
      include: { breakfast: true, dinner: true },
    });

    if (!day) {
      return new Response(JSON.stringify({ error: 'Día no encontrado' }), { status: 404 });
    }

    if (userName) {
      // Verificar si el usuario está en las listas
      const breakfast = day.breakfast.some((user) => user.name === userName);
      const dinner = day.dinner.some((user) => user.name === userName);

      return new Response(JSON.stringify({ breakfast, dinner }), { status: 200 });
    } else {
      // Devolver las listas completas si no se especifica `user`
      return new Response(
        JSON.stringify({
          breakfast: day.breakfast.map((user) => ({ name: user.name })),
          dinner: day.dinner.map((user) => ({ name: user.name })),
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener asistencia' }),
      { status: 500 }
    );
  }
}


/*console.error('Error en el inicio de sesión:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );*/