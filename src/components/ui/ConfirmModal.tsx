"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { XCircle, Trash, ProhibitInset, ArrowBendUpLeft } from "@phosphor-icons/react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmIcon?: "delete" | "cancel";
  confirmVariant?: "danger-ghost" | "restore-ghost";
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const confirmIcons: Record<string, ReactNode> = {
  delete: <Trash size={15} weight="duotone" />,
  cancel: <ProhibitInset size={15} weight="duotone" />,
};

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Delete",
  confirmIcon = "delete",
  confirmVariant = "danger-ghost",
  cancelLabel = "Back",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="gray"
            size="sm"
            onClick={onCancel}
            disabled={loading}
            className="font-extrabold uppercase tracking-wide"
          >
            <ArrowBendUpLeft size={15} weight="bold" />
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            loading={loading}
            onClick={onConfirm}
            className="font-extrabold uppercase tracking-wide"
          >
            {confirmIcons[confirmIcon]}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
