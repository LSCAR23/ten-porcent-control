import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, password, userType } = body;

    if (!name || !password || !userType) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son obligatorios' }),
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'El nombre de usuario ya existe' }),
        { status: 409 } // Código HTTP 409: Conflicto
      );
    }

    // Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        name,
        password,
        userType,
      },
    });

    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    return new Response(
      JSON.stringify({ error: 'Error al registrar el usuario' }),
      { status: 500 }
    );
  }
}
