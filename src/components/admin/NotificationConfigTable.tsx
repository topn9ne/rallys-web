"use client";

import { useState, useTransition } from "react";
import { XCircle, CheckCircle, Envelope, DeviceMobile, CaretDown, CaretUp } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { setNotificationEnabled } from "@/server/actions/notifications";
import { NOTIFICATION_DEFINITIONS, ALWAYS_ON_DEFINITIONS } from "@/lib/notificationDefinitions";
import type { NotificationConfigMap, NotificationTrigger, NotificationChannel, NotificationAudience } from "@/lib/notificationDefinitions";

interface Props {
  configs: NotificationConfigMap;
}

export function NotificationConfigTable({ configs: initial }: Props) {
  const [configs, setConfigs] = useState<NotificationConfigMap>(initial);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [showAlwaysOn, setShowAlwaysOn] = useState(false);
  const [, startTransition] = useTransition();

  function handleToggle(
    trigger: NotificationTrigger,
    channel: NotificationChannel,
    audience: NotificationAudience
  ) {
    const key = `${trigger}:${channel}:${audience}` as keyof NotificationConfigMap;
    const current = configs[key] ?? true;
    setPendingKey(key);
    startTransition(async () => {
      await setNotificationEnabled(trigger, channel, audience, !current);
      setConfigs((prev) => ({ ...prev, [key]: !current }));
      setPendingKey(null);
    });
  }

  return (
    <div>
      {/* Configurable triggers */}
      <div className="divide-y divide-gray-100">
        {NOTIFICATION_DEFINITIONS.map((def, i) => (
          <div key={def.trigger} className={`flex ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>

            {/* Left — toggles */}
            <div className="w-1/2">
              <div className="px-6 py-4">
                <p className="font-semibold text-gray-900">{def.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{def.description}</p>
              </div>
              <div className="border-t border-gray-50">
                {def.rows.map((row) => {
                  const key = `${def.trigger}:${row.channel}:${row.audience}` as keyof NotificationConfigMap;
                  const enabled = configs[key] ?? true;
                  const isPending = pendingKey === key;

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 px-6 py-3 bg-gray-50/50 border-t border-gray-100 first:border-t-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant={row.audience === "OWNER" ? "blue" : "gray"} className="shrink-0 text-[10px]">
                          {row.audience === "OWNER" ? "Owner" : "Customer"}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                          {row.channel === "EMAIL"
                            ? <Envelope size={13} weight="duotone" />
                            : <DeviceMobile size={13} weight="duotone" />}
                          {row.channel === "EMAIL" ? "Email" : "SMS"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={enabled ? "green" : "gray"} className="text-[10px]">
                          {enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        {enabled ? (
                          <button
                            disabled={isPending}
                            onClick={() => handleToggle(def.trigger as NotificationTrigger, row.channel, row.audience)}
                            className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-red-400 transition-all hover:bg-red-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
                          >
                            <XCircle size={16} weight="duotone" className="shrink-0" />
                            <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
                              {isPending ? "Saving…" : "Disable"}
                            </span>
                          </button>
                        ) : (
                          <button
                            disabled={isPending}
                            onClick={() => handleToggle(def.trigger as NotificationTrigger, row.channel, row.audience)}
                            className="group flex h-8 items-center gap-0 overflow-hidden rounded-lg pl-2 pr-2 text-green-500 transition-all hover:bg-green-50 hover:gap-1.5 hover:pr-3 disabled:opacity-50"
                          >
                            <CheckCircle size={16} weight="duotone" className="shrink-0" />
                            <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-200 group-hover:max-w-[60px]">
                              {isPending ? "Saving…" : "Enable"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — preview */}
            <div className="w-1/2 p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">
                Message Preview
              </p>
              <div className="space-y-3">
                {def.rows.map((row) => (
                  <div key={`${row.channel}:${row.audience}`} className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
                      {row.channel === "EMAIL" ? "Email" : "SMS"} — {row.audience === "OWNER" ? "Owner" : "Customer"}
                    </p>
                    {row.channel === "EMAIL" && (
                      <p className="text-xs text-gray-500 mb-1.5">
                        <span className="font-semibold text-gray-700">Subject: </span>
                        <span className="font-mono">{row.subjectPreview}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">Body: </span>
                      {row.bodyPreview}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Show all — always-on transactional */}
      <div className="border-t border-gray-200">
        <button
          onClick={() => setShowAlwaysOn((v) => !v)}
          className="flex w-full items-center justify-end gap-1.5 px-6 py-3 text-[10px] font-extrabold uppercase tracking-wide text-gray-400 hover:bg-gray-50 transition-colors"
        >
          {showAlwaysOn ? "Hide always-on notifications" : "Show all notifications"}
          {showAlwaysOn ? <CaretUp size={11} weight="bold" /> : <CaretDown size={11} weight="bold" />}
        </button>

        {showAlwaysOn && (
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {ALWAYS_ON_DEFINITIONS.map((def, i) => {
              const rowIndex = NOTIFICATION_DEFINITIONS.length + i;
              return (
                <div key={def.trigger} className={`flex ${rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>

                  {/* Left — read-only rows */}
                  <div className="w-1/2">
                    <div className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{def.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{def.description}</p>
                    </div>
                    <div className="border-t border-gray-50">
                      {def.rows.map((row) => (
                        <div
                          key={`${row.channel}:${row.audience}`}
                          className="flex items-center justify-between gap-4 px-6 py-3 bg-gray-50/50 border-t border-gray-100 first:border-t-0"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Badge variant="amber" className="shrink-0 text-[10px]">System</Badge>
                            <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                              {row.channel === "EMAIL"
                                ? <Envelope size={13} weight="duotone" />
                                : <DeviceMobile size={13} weight="duotone" />}
                              {row.channel === "EMAIL" ? "Email" : "SMS"}
                            </span>
                          </div>
                          <Badge variant="gray" className="text-[10px]">Always On</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right — preview */}
                  <div className="w-1/2 p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">
                      Message Preview
                    </p>
                    <div className="space-y-3">
                      {def.rows.map((row) => (
                        <div key={`${row.channel}:${row.audience}`} className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
                            {row.channel === "EMAIL" ? "Email" : "SMS"} — System
                          </p>
                          {row.channel === "EMAIL" && row.subjectPreview && (
                            <p className="text-xs text-gray-500 mb-1.5">
                              <span className="font-semibold text-gray-700">Subject: </span>
                              <span className="font-mono">{row.subjectPreview}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">Body: </span>
                            {row.bodyPreview}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
