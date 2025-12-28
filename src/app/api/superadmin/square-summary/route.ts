export async function GET() {
  try {
    // Square API integration disabled (requires updated SDK implementation)
    // Return mock data for now
    return new Response(
      JSON.stringify({
        totalRevenue: 0,
        ytdRevenue: 0,
        nextPaymentDue: null,
        paymentCount: 0,
        message: 'Square integration pending'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch square summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
