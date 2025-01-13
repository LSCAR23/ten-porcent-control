import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { date, breakfastIds, dinnerIds } = req.body;
    try {
      const day = await prisma.day.create({
        data: {
          date: new Date(date),
          breakfast: { connect: breakfastIds.map((id) => ({ id })) },
          dinner: { connect: dinnerIds.map((id) => ({ id })) },
        },
      });
      res.status(201).json(day);
    } catch (error) {
      console.error('Error creating day:', error);
      res.status(500).json({ error: 'Error creating day' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
