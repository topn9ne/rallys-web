"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import {
  createSubscriptionCheckout,
  createBillingPortalSession,
} from "@/server/actions/subscription";
import type { MemberTier, SubscriptionStatus } from "@prisma/client";

interface MembershipActionsProps {
  status: SubscriptionStatus | "NONE";
  tier?: MemberTier;
  annual?: boolean;
  hasStripeCustomer: boolean;
}

export function MembershipActions({
  status,
  tier,
  annual,
  hasStripeCustomer,
}: MembershipActionsProps) {
  const [pending, startTransition] = useTransition();

  function handleSubscribe() {
    if (!tier) return;
    startTransition(async () => {
      const result = await createSubscriptionCheckout(tier, annual);
      if (result?.url) {
        window.location.href = result.url;
      }
    });
  }

  function handleManageBilling() {
    startTransition(async () => {
      const result = await createBillingPortalSession();
      if (result?.url) {
        window.location.href = result.url;
      }
    });
  }

  if (status === "ACTIVE" || status === "PAST_DUE") {
    return (
      <div className="mt-4">
        <Button
          onClick={handleManageBilling}
          loading={pending}
          variant="outline"
          size="sm"
          disabled={!hasStripeCustomer}
        >
          Manage Billing
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <Button
        onClick={handleSubscribe}
        loading={pending}
        size="lg"
        className="w-full"
      >
        Subscribe
      </Button>
    </div>
  );
}
