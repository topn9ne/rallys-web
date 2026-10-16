"use client";

import { useActionState } from "react";
import { createStaff } from "@/server/actions/staff";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PaperPlaneTilt } from "@phosphor-icons/react";

const initialState = { error: undefined as any, success: false };

export function StaffForm() {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createStaff(formData) as Promise<typeof initialState>;
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <Input label="Name" name="name" required error={state.error?.name?.[0]} />
      <Input label="Email" name="email" type="email" required error={state.error?.email?.[0]} />
      <Input label="Phone" name="phone" type="tel" />
      <Select label="Role" name="role" defaultValue="OPERATOR">
        <option value="OPERATOR">Operator</option>
        <option value="DRIVER">Driver</option>
        <option value="ADMIN">Admin</option>
      </Select>
      {state.success && (
        <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700">
          Invite sent! They'll receive an email to set their password.
        </p>
      )}
      <Button type="submit" loading={pending} className="w-full gap-2">
        <PaperPlaneTilt size={15} weight="duotone" />
        Send Invite
      </Button>
    </form>
  );
}
