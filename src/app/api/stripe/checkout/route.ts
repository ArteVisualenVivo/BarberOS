import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    if (!isStripeConfigured) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const { barberiaId, userId, email, planId } = await req.json();

    if (!barberiaId || !userId || !email || planId !== "pro") {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],
      line_items: [
        {
          price: PLANS.pro.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: email,
      success_url: `${req.headers.get("origin")}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/dashboard/settings`,
      metadata: {
        barberiaId,
        userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
