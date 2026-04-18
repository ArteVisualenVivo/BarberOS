import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error("Missing signature or endpoint secret");
    }
    if (!stripe) {
      throw new Error("Stripe not configured");
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const { barberiaId } = session.metadata;
        const customerId = session.customer;

        if (barberiaId) {
          await db.collection("barberias").doc(barberiaId).update({
            plan: "pro",
            stripeCustomerId: customerId,
            updatedAt: new Date(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        const snapshot = await db.collection("barberias")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();
        
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            plan: "free",
            updatedAt: new Date(),
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
