-- ============================================
-- Index the subscription lookup keys used by webhooks and self-serve flows.
-- ============================================
create unique index if not exists subscriptions_stripe_subscription_id_idx on public.subscriptions(stripe_subscription_id);
create unique index if not exists subscriptions_manage_token_idx on public.subscriptions(manage_token);
