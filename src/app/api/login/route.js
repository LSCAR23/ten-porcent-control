import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, password } = body;
        if (!name || !password) {
            return new Response(JSON.stringify({ error: 'Nombre y contraseña son obligatorios' }), { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { name },
        });

        if (!user || user.password !== password) {
            return new Response(JSON.stringify({ error: 'Credenciales incorrectas' }), { status: 401 });
        }

        const response = NextResponse.json({
            message: 'Inicio de sesión exitoso',
            userType: user.userType,
          });
      
          response.cookies.set('userName', name, {
            path: '/',
          });
      
          return response;
    } catch (error) {
        console.error('Error en el inicio de sesión:', error instanceof Error ? error.message : error);
        return new Response(
            JSON.stringify({ error: 'Error en el servidor' }),
            { status: 500 }
        );
    }
}
