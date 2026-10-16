"use client";

import { useActionState } from "react";
import { updateStaff, resendInvite } from "@/server/actions/staff";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { X, PaperPlaneTilt } from "@phosphor-icons/react";
import { useTransition } from "react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  passwordHash: string | null;
}

interface Props {
  member: StaffMember;
  onClose: () => void;
}

const initialState = { error: undefined as any, success: false };

export function StaffEditModal({ member, onClose }: Props) {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateStaff(formData) as typeof initialState;
      if (result.success) onClose();
      return result;
    },
    initialState
  );

  const [invitePending, startInvite] = useTransition();
  const [inviteSent, setInviteSent] = useTransition();
  const hasPassword = !!member.passwordHash;

  function handleResendInvite() {
    startInvite(async () => {
      await resendInvite(member.id);
      setInviteSent(() => {});
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[14px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-display text-[18px] leading-none tracking-[-0.3px] text-admin-ink">
              Edit Staff Member
            </h2>
            <p className="mt-1 text-xs text-gray-400">{member.email}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Form */}
        <form action={action} className="px-6 py-5 space-y-4">
          <input type="hidden" name="id" value={member.id} />

          <Input
            label="Name"
            name="name"
            defaultValue={member.name}
            required
            error={state.error?.name?.[0]}
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={member.phone ?? ""}
          />
          <Select label="Role" name="role" defaultValue={member.role}>
            <option value="OPERATOR">Operator</option>
            <option value="DRIVER">Driver</option>
            <option value="ADMIN">Admin</option>
          </Select>

          {state.error && typeof state.error === "string" && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={pending} className="flex-1">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Invite status / resend */}
        <div className="border-t border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Account status
              </p>
              <p className="mt-0.5 text-sm text-gray-700">
                {hasPassword ? "Password set — active account" : "Invite pending — no password yet"}
              </p>
            </div>
            {!hasPassword && (
              <Button
                variant="outline"
                size="sm"
                loading={invitePending}
                onClick={handleResendInvite}
                className="shrink-0 gap-1.5"
              >
                <PaperPlaneTilt size={13} weight="duotone" />
                Resend Invite
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
