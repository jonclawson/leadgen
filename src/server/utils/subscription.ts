import { Subscription } from '../../../generated/prisma';

/**
 * Checks if a subscription is considered "active" for visibility purposes.
 * A subscription is active if its status is 'active' 
 * OR if it is 'active' but 'canceled' scheduled to end in the future.
 */
export function isSubscriptionActive(subscription: Subscription | null | undefined): boolean {
  if (!subscription) return false;

  // If Stripe says it's active, it's active.
  if (subscription.status === 'active') {
    // If it's scheduled to cancel, check if the date hasn't passed yet.
    if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
      return new Date(subscription.currentPeriodEnd) > new Date();
    }
    return true;
  }

  // If status is specifically 'trialing', we might consider it active too.
  if (subscription.status === 'trialing') return true;

  // Any other status (canceled, past_due, unpaid, incomplete) is considered inactive for public visibility.
  return false;
}
