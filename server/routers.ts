import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Configuration endpoints
  config: router({
    hubVendor: publicProcedure.query(async () => {
      const { loadHubVendor, getCurrentHubVendorId } = await import('./config-loader');
      const hubVendorId = getCurrentHubVendorId();
      return loadHubVendor(hubVendorId);
    }),
    spokeIntegrations: publicProcedure.query(async () => {
      const { loadHubVendor, getCurrentHubVendorId, getHubSpokeIntegrations } = await import('./config-loader');
      const hubVendorId = getCurrentHubVendorId();
      const hubVendor = loadHubVendor(hubVendorId);
      return getHubSpokeIntegrations(hubVendor);
    }),
    branding: publicProcedure.query(async () => {
      const { loadBranding } = await import('./config-loader');
      return loadBranding();
    }),
    pricing: publicProcedure.query(async () => {
      const { loadPricing } = await import('./config-loader');
      return loadPricing();
    }),
  }),

  // Purchase flow endpoints
  purchase: router({
    create: publicProcedure
      .input((val: unknown) => val as any)
      .mutation(async ({ input }) => {
        const { createPurchase } = await import('./db');
        const { randomUUID } = await import('crypto');
        
        const purchaseId = randomUUID();
        const purchase = await createPurchase({
          id: purchaseId,
          ...input,
          templateId: process.env.TEMPLATE_HUB_VENDOR || 'zendesk',
        });
        
        return { success: true, purchaseId: purchase?.id };
      }),
    
    update: publicProcedure
      .input((val: unknown) => val as any)
      .mutation(async ({ input }) => {
        const { updatePurchase } = await import('./db');
        const { id, ...updates } = input;
        await updatePurchase(id, updates);
        return { success: true };
      }),
    
    get: publicProcedure
      .input((val: unknown) => val as { id: string })
      .query(async ({ input }) => {
        const { getPurchase } = await import('./db');
        return await getPurchase(input.id);
      }),
  }),

  // Stripe payment endpoints
  stripe: router({
    createCheckoutSession: publicProcedure
      .input((val: unknown) => val as any)
      .mutation(async ({ input }) => {
        const { createCheckoutSession } = await import('./stripe-integration');
        const { getPurchase } = await import('./db');
        
        const purchase = await getPurchase(input.purchaseId);
        if (!purchase) {
          throw new Error('Purchase not found');
        }
        
        const session = await createCheckoutSession({
          purchaseId: input.purchaseId,
          customerEmail: purchase.customerEmail,
          customerName: purchase.customerName,
          pricingTierName: input.pricingTierName,
          amount: parseFloat(purchase.paymentAmount || '0'),
          currency: purchase.paymentCurrency || 'USD',
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
        });
        
        // Update purchase with Stripe session ID
        const { updatePurchase } = await import('./db');
        await updatePurchase(input.purchaseId, {
          stripeSessionId: session.id,
        });
        
        return { sessionId: session.id, url: session.url };
      }),
    
    getSession: publicProcedure
      .input((val: unknown) => val as { sessionId: string })
      .query(async ({ input }) => {
        const { getCheckoutSession } = await import('./stripe-integration');
        return await getCheckoutSession(input.sessionId);
      }),
  }),

  // Notification endpoints
  notification: router({
    sendPurchaseNotification: publicProcedure
      .input((val: unknown) => val as any)
      .mutation(async ({ input }) => {
        const { sendStepNotification } = await import('./step-notification');
        
        const success = await sendStepNotification({
          purchaseId: input.purchaseId,
          step: input.step,
          data: input.data,
        });
        
        return { success };
      }),
  }),
});

export type AppRouter = typeof appRouter;
