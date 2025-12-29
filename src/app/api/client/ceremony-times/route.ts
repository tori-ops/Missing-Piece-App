'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { clientId, ceremonyType, timeOfDay } = await req.json();

    if (!clientId || !ceremonyType || !timeOfDay) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Fetch current ceremony times
    const client = await prisma.clientProfile.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return new Response(JSON.stringify({ error: 'Client not found' }), { status: 404 });
    }

    // Parse existing ceremony times
    const ceremonyTimes = Array.isArray(client.ceremonyTimes) ? client.ceremonyTimes : [];

    // Check if ceremony type already exists and update, or add new
    const existingIndex = ceremonyTimes.findIndex(
      (c: any) => c.ceremonyType === ceremonyType
    );

    if (existingIndex >= 0) {
      ceremonyTimes[existingIndex] = { ceremonyType, timeOfDay };
    } else {
      ceremonyTimes.push({ ceremonyType, timeOfDay });
    }

    // Update client profile with new ceremony times
    const updated = await prisma.clientProfile.update({
      where: { id: clientId },
      data: {
        ceremonyTimes: ceremonyTimes,
      },
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error('Error saving ceremony times:', error);
    return new Response(JSON.stringify({ error: 'Failed to save ceremony times' }), {
      status: 500,
    });
  }
}
