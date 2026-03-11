// Stripe webhook event handler
const logger = require('../../../lib/@system/Logger');

async function handleStripeWebhook(event) {
  const { type, data } = event;
  const obj = data.object;

  switch (type) {
    // Checkout completed — link stripe customer to user and upsert subscription
    case 'checkout.session.completed': {
      if (obj.mode !== 'subscription') break;
      const userId = obj.client_reference_id ?? obj.metadata?.user_id;
      if (!userId) {
        logger.warn({ sessionId: obj.id }, 'checkout.session.completed: no user_id in metadata');
        break;
      }

      // TODO(#8808): Implement SubscriptionRepo and UserRepo persistence
      logger.info({ userId, sessionId: obj.id }, 'checkout completed');
      break;
    }

    // Subscription created
    case 'customer.subscription.created': {
      logger.info({ subscriptionId: obj.id, status: obj.status }, 'subscription created');
      break;
    }

    // Subscription updated (plan change, renewal, cancellation toggle)
    case 'customer.subscription.updated': {
      logger.info({ subscriptionId: obj.id, status: obj.status }, 'subscription updated');
      break;
    }

    // Subscription cancelled / ended
    case 'customer.subscription.deleted': {
      logger.info({ subscriptionId: obj.id }, 'subscription cancelled');
      break;
    }

    // Payment failed
    case 'invoice.payment_failed': {
      logger.warn({ subscriptionId: obj.subscription, invoiceId: obj.id }, 'payment failed');
      break;
    }

    // Invoice paid
    case 'invoice.payment_succeeded': {
      logger.info({ subscriptionId: obj.subscription }, 'invoice paid');
      break;
    }

    default:
      logger.debug({ eventType: type }, 'unhandled stripe event type');
  }
}

module.exports = { handleStripeWebhook };
