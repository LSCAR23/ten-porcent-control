import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  const lastFortnigh = await prisma.fortnigh.findFirst({
    orderBy: { id: 'desc' },
    include: { days: true },
  });

  return new Response(JSON.stringify(lastFortnigh), { status: 200 });
}
