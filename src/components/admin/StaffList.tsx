"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { StaffToggle } from "@/components/admin/StaffToggle";
import { StaffEditModal } from "@/components/admin/StaffEditModal";
import { PencilSimple, PaperPlaneTilt, Trash } from "@phosphor-icons/react";
import { resendInvite, deleteStaff } from "@/server/actions/staff";

const roleVariant: Record<string, "blue" | "green" | "purple"> = {
  ADMIN: "blue",
  OPERATOR: "green",
  DRIVER: "purple",
};

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
  passwordHash: string | null;
}

function ResendInviteButton({ staffId }: { staffId: string }) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleResend() {
    startTransition(async () => {
      await resendInvite(staffId);
      setSent(true);
    });
  }

  return (
    <button
      onClick={handleResend}
      disabled={pending || sent}
      title="Resend invite"
      className="grid h-8 w-8 place-items-center rounded-lg border border-admin-line bg-[#f2f4fb] text-admin-primary transition-colors hover:bg-admin-primary hover:text-white disabled:opacity-50"
    >
      <PaperPlaneTilt size={14} weight={sent ? "fill" : "regular"} />
    </button>
  );
}

export function StaffList({ staff }: { staff: StaffMember[] }) {
  const [editing, setEditing] = useState<StaffMember | null>(null);

  return (
    <>
      <ul className="divide-y divide-gray-100">
        {staff.map((member) => (
          <li key={member.id} className="flex items-center justify-between px-6 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{member.name}</p>
                <Badge variant={roleVariant[member.role] ?? "gray"}>{member.role}</Badge>
                {!member.active && <Badge variant="gray">Inactive</Badge>}
                {!member.passwordHash && (
                  <Badge variant="amber">Invite pending</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{member.email}</p>
              {member.phone && (
                <p className="text-xs text-gray-400">{member.phone}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!member.passwordHash && (
                <ResendInviteButton staffId={member.id} />
              )}
              <button
                onClick={() => setEditing(member)}
                title="Edit staff member"
                className="grid h-8 w-8 place-items-center rounded-lg border border-admin-line bg-[#f2f4fb] text-admin-primary transition-colors hover:bg-admin-primary hover:text-white"
              >
                <PencilSimple size={14} weight="regular" />
              </button>
              <StaffToggle staff={member as any} />
              <button
                onClick={async () => {
                  if (!confirm(`Delete ${member.name}? This cannot be undone.`)) return;
                  await deleteStaff(member.id);
                }}
                title="Delete staff member"
                className="grid h-8 w-8 place-items-center rounded-lg border border-admin-line bg-[#f2f4fb] text-red-400 transition-colors hover:bg-red-500 hover:text-white hover:border-red-500"
              >
                <Trash size={14} weight="regular" />
              </button>
            </div>
          </li>
        ))}
        {staff.length === 0 && (
          <li className="px-6 py-8 text-center text-sm text-gray-500">No staff yet.</li>
        )}
      </ul>

      {editing && (
        <StaffEditModal
          member={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
