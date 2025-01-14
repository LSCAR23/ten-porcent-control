import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req, context) {
  try {
    // Asegurarse de que `params` sea válido y extraer el ID
    const { id } = await context.params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID del usuario es requerido' }),
        { status: 400 }
      );
    }

    const userId = parseInt(id, 10);

    // Verificar si el usuario tiene días asociados
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { breakfastDays: true, dinnerDays: true },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404 }
      );
    }

    if (user.breakfastDays.length > 0 || user.dinnerDays.length > 0) {
      return new Response(
        JSON.stringify({ error: 'No se puede eliminar el usuario porque tiene días asociados' }),
        { status: 400 }
      );
    }

    // Eliminar el usuario
    await prisma.user.delete({ where: { id: userId } });

    return new Response(
      JSON.stringify({ message: 'Usuario eliminado exitosamente' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar el usuario' }),
      { status: 500 }
    );
  }
}
