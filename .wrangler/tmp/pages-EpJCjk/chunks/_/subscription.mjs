function isSubscriptionActive(t){return!!t&&("active"===t.status?!t.cancelAtPeriodEnd||!t.currentPeriodEnd||new Date(t.currentPeriodEnd)>new Date:"trialing"===t.status)}export{isSubscriptionActive as i};
//# sourceMappingURL=subscription.mjs.map
