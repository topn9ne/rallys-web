"use client";

import { useEffect, useState, useTransition } from "react";
import { getSlotStaff, assignStaffToSlot, unassignStaffFromSlot } from "@/server/actions/staff";
import { X, Users, UserMinus, Plus, Check } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/Badge";

type SlotStaffData = Awaited<ReturnType<typeof getSlotStaff>>;

const roleVariant: Record<string, "blue" | "green" | "purple"> = {
  ADMIN: "blue",
  OPERATOR: "green",
  DRIVER: "purple",
};

interface Props {
  slotId: string;
  slotLabel: string;
  onClose: () => void;
}

export function SlotStaffModal({ slotId, slotLabel, onClose }: Props) {
  const [data, setData] = useState<SlotStaffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  function reload() {
    getSlotStaff(slotId).then((d) => { setData(d); setLoading(false); });
  }

  useEffect(() => { reload(); }, [slotId]);

  function handleAssign(staffId: string) {
    startTransition(async () => {
      await assignStaffToSlot(slotId, staffId);
      reload();
    });
  }

  function handleUnassign(staffId: string) {
    startTransition(async () => {
      await unassignStaffFromSlot(slotId, staffId);
      reload();
    });
  }

  const assignedIds = new Set(data?.assignments.map((a) => a.staffId) ?? []);
  const interestedIds = new Set(data?.interests.map((i) => i.staffId) ?? []);
  const available = data?.allStaff.filter((s) => !assignedIds.has(s.id) && !interestedIds.has(s.id)) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Users size={18} weight="duotone" color="#f97316" />
              <h2 className="font-extrabold text-orange-700">Staff Assignment</h2>
            </div>
            <p className="mt-0.5 truncate text-xs text-gray-400">{slotLabel}</p>
          </div>
          <button onClick={onClose} className="ml-4 shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Assigned */}
            <div>
              <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                Assigned ({data?.assignments.length ?? 0})
              </h3>
              {data?.assignments.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-center text-sm text-gray-400">
                  No staff assigned yet
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                  {data?.assignments.map((a) => (
                    <li key={a.staffId} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{a.staff.name}</p>
                          <Badge variant={roleVariant[a.staff.role] ?? "gray"} className="text-[10px]">
                            {a.staff.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{a.staff.email}</p>
                      </div>
                      <button
                        disabled={pending}
                        onClick={() => handleUnassign(a.staffId)}
                        className="shrink-0 flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <UserMinus size={13} weight="duotone" />
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Available to add */}
            {available.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-gray-400">
                  Add Staff
                </h3>
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                  {available.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                          <Badge variant={roleVariant[s.role] ?? "gray"} className="text-[10px]">
                            {s.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{s.email}</p>
                      </div>
                      <button
                        disabled={pending}
                        onClick={() => handleAssign(s.id)}
                        className="shrink-0 flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-500 hover:border-orange-500 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <Plus size={13} weight="bold" />
                        Assign
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interested (raised hand) */}
            {(data?.interests.length ?? 0) > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-orange-400">
                  Raised Hand ({data?.interests.length})
                </h3>
                <ul className="divide-y divide-orange-100 rounded-xl border border-orange-200 overflow-hidden">
                  {data?.interests.map((i) => (
                    <li key={i.staffId} className="flex items-center justify-between gap-3 bg-orange-50 px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{i.staff.name}</p>
                          <Badge variant={roleVariant[i.staff.role] ?? "gray"} className="text-[10px]">
                            {i.staff.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{i.staff.email}</p>
                      </div>
                      <button
                        disabled={pending}
                        onClick={() => handleAssign(i.staffId)}
                        className="shrink-0 flex items-center gap-1 rounded-lg border border-orange-400 bg-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
                      >
                        <Check size={13} weight="bold" />
                        Confirm
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {available.length === 0 && (data?.assignments.length ?? 0) > 0 && (data?.interests.length ?? 0) === 0 && (
              <p className="text-center text-xs text-gray-400">All active staff are assigned to this ride.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
