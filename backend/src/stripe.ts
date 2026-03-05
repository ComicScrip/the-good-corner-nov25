import type { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { invalidateAdsCache, invalidateCache } from "./db";
import { Purchase, PurchaseStatus } from "./entities/Purchase";
import env from "./env";

if (!env.STRIPE_SECRET_KEY) {
  console.warn(
    "[Stripe] STRIPE_SECRET_KEY is not set — Stripe features will be unavailable.",
  );
}

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

export function injectStripeRoutes(fastify: FastifyInstance) {
  fastify.register(async (webhookScope) => {
    webhookScope.addContentTypeParser(
      "application/json",
      { parseAs: "buffer" },
      (_req, body, done) => done(null, body),
    );
    webhookScope.post("/webhook/stripe", async (request, reply) => {
      if (!stripe)
        return reply.status(503).send({ error: "Stripe not configured" });
      const sig = request.headers["stripe-signature"];
      const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret)
        return reply
          .status(503)
          .send({ error: "Webhook secret not configured" });

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          request.body as Buffer,
          sig as string,
          webhookSecret,
        );
      } catch (err) {
        fastify.log.error(
          `Stripe webhook signature verification failed: ${err}`,
        );
        return reply.status(400).send({ error: "Invalid signature" });
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const purchase = await Purchase.findOne({
          where: { stripeSessionId: session.id },
          relations: { ad: true },
        });

        if (purchase) {
          purchase.status = PurchaseStatus.Completed;
          await purchase.save();

          // Mark the ad as sold
          const ad = purchase.ad;
          if (ad) {
            ad.sold = true;
            await ad.save();
            await invalidateCache([`ad:${ad.id}`]);
            await invalidateAdsCache();
          }
        }
      }

      if (event.type === "checkout.session.expired") {
        const session = event.data.object as Stripe.Checkout.Session;
        const purchase = await Purchase.findOne({
          where: { stripeSessionId: session.id },
        });
        if (purchase) {
          purchase.status = PurchaseStatus.Failed;
          await purchase.save();
        }
      }

      return reply.send({ received: true });
    });
  });
}
