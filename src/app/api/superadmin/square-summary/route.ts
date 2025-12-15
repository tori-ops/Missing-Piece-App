import squareClient from '@/lib/square';

export async function GET() {
  try {
    // Fetch all payments
    const paymentsApi = squareClient.paymentsApi;
    const { result } = await paymentsApi.listPayments();
    const payments = result.payments || [];

    // Calculate total revenue (YTD and all-time)
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    let totalRevenue = 0;
    let ytdRevenue = 0;
    let nextPaymentDue: string | null = null;

    for (const payment of payments) {
      // Square API returns amount as BigInt, convert to Number for math
      const rawAmount = payment.amountMoney?.amount;
      const amount = rawAmount ? Number(rawAmount) / 100 : 0;
      totalRevenue += amount;
      if (payment.createdAt && new Date(payment.createdAt) >= yearStart) {
        ytdRevenue += amount;
      }
    }

    // Find the next payment due (if using subscriptions/invoices)
    // Placeholder: Square API for subscriptions/invoices can be added here

    return new Response(
      JSON.stringify({
        totalRevenue,
        ytdRevenue,
        nextPaymentDue,
        paymentCount: payments.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to fetch Square summary.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
