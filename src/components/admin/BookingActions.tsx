"use client";

import { useState, useTransition } from "react";
import { cancelBookingAdmin, refundBookingAdmin } from "@/server/actions/adminBookings";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { XCircle } from "@phosphor-icons/react";

interface BookingActionsProps {
  bookingId: string;
  status: string;
  stripePaymentIntentId: string | null;
  onSuccess?: () => void;
}

export function BookingActions({ bookingId, status, stripePaymentIntentId, onSuccess }: BookingActionsProps) {
  const [pending, startTransition] = useTransition();
  const [modal, setModal] = useState<"cancel" | "refund" | null>(null);

  const canCancel = ["PENDING", "CONFIRMED"].includes(status);
  const canRefund = ["CONFIRMED", "CANCELLED"].includes(status) && !!stripePaymentIntentId;

  if (!canCancel && !canRefund) return <span className="text-xs text-gray-400">—</span>;

  function handleConfirm() {
    if (modal === "cancel") {
      startTransition(async () => {
        await cancelBookingAdmin(bookingId);
        setModal(null);
        onSuccess?.();
      });
    } else if (modal === "refund") {
      startTransition(async () => {
        await refundBookingAdmin(bookingId);
        setModal(null);
        onSuccess?.();
      });
    }
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        {canCancel && (
          <Button
            variant="restore-ghost"
            size="sm"
            loading={pending}
            className="font-extrabold uppercase tracking-wide"
            onClick={() => setModal("cancel")}
          >
            <XCircle size={15} weight="duotone" />
            Cancel Booking
          </Button>
        )}
        {canRefund && (
          <Button
            variant="danger"
            size="sm"
            loading={pending}
            onClick={() => setModal("refund")}
          >
            Refund
          </Button>
        )}
      </div>

      {modal === "cancel" && (
        <ConfirmModal
          title="Cancel this booking?"
          message="The booking will be marked as cancelled. Issue a refund separately if payment was collected."
          confirmLabel="Cancel"
          confirmIcon="cancel"
          confirmVariant="danger-ghost"
          cancelLabel="Back"
          loading={pending}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {modal === "refund" && (
        <ConfirmModal
          title="Issue full refund?"
          message="This will immediately refund the full amount via Stripe. This cannot be undone."
          confirmLabel="Issue Refund"
          confirmIcon="cancel"
          confirmVariant="danger-ghost"
          cancelLabel="Back"
          loading={pending}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
