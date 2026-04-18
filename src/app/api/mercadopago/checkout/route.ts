import { NextResponse } from "next/server";
import mercadopago from "@/lib/mercadopago";

export async function POST(req: Request) {
  try {
    const { barberiaId } = await req.json();

    const preference = {
      items: [
        {
          title: "BarberOS PRO",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 5000, // 💰 precio mensual (ajustalo)
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?paid=true`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=true`,
      },
      auto_return: "approved",
      metadata: {
        barberiaId,
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
    };

    const response = await mercadopago.preferences.create(preference);

    return NextResponse.json({
      url: response.body.init_point,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error MP" }, { status: 500 });
  }
}