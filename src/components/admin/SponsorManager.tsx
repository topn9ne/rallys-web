"use client";

import { useState, useRef, useActionState } from "react";
import NextImage from "next/image";
import { PencilSimple, Trash, Eye, EyeSlash, UploadSimple, Image, PlusCircle } from "@phosphor-icons/react";
import { createSponsor, updateSponsor, deleteSponsor, toggleSponsor } from "@/server/actions/sponsors";
import type { Sponsor } from "@prisma/client";

const initialState = { error: undefined as string | undefined, success: false };

function SponsorForm({ sponsor, onSuccess }: { sponsor?: Sponsor; onSuccess?: () => void }) {
  const action = sponsor
    ? async (_prev: typeof initialState, formData: FormData) => {
        const res = (await updateSponsor(sponsor.id, formData)) as typeof initialState;
        if (res.success && onSuccess) onSuccess();
        return res;
      }
    : async (_prev: typeof initialState, formData: FormData) => {
        const res = (await createSponsor(formData)) as typeof initialState;
        if (res.success && onSuccess) onSuccess();
        return res;
      };

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-white/80">Sponsor Name</label>
        <input
          name="name"
          required
          defaultValue={sponsor?.name}
          placeholder="e.g. Acme Brewing Co."
          className="w-full rounded-[10px] border border-white/15 bg-white/[0.07] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-admin-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-[13px] font-semibold text-white/80">
          Website URL <span className="font-normal text-white/35">(optional)</span>
        </label>
        <input
          name="websiteUrl"
          type="url"
          defaultValue={sponsor?.websiteUrl ?? ""}
          placeholder="https://example.com"
          className="w-full rounded-[10px] border border-white/15 bg-white/[0.07] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-admin-accent focus:outline-none"
        />
      </div>
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state.success && !sponsor && <p className="text-xs text-green-400">Sponsor added. Upload a logo below.</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-[10px] bg-admin-accent px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(255,46,136,0.3)] transition-[filter] hover:brightness-110 disabled:opacity-50"
      >
        {pending ? "Saving…" : sponsor ? "Save Changes" : "Add Sponsor"}
      </button>
    </form>
  );
}

function SponsorRow({ sponsor }: { sponsor: Sponsor }) {
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState(sponsor.active);
  const [logoUrl, setLogoUrl] = useState(sponsor.logoUrl);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleLogoUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`/api/admin/sponsor-image?id=${sponsor.id}`, { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setLogoUrl(url);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleLogoRemove() {
    setUploading(true);
    try {
      await fetch(`/api/admin/sponsor-image?id=${sponsor.id}`, { method: "DELETE" });
      setLogoUrl("");
    } finally {
      setUploading(false);
    }
  }

  async function handleToggle() {
    const next = !active;
    setActive(next);
    await toggleSponsor(sponsor.id, next);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${sponsor.name}"?`)) return;
    setDeleting(true);
    await deleteSponsor(sponsor.id);
  }

  return (
    <li className={`border-b border-white/10 px-5 py-4 last:border-0 ${!active ? "opacity-50" : ""}`}>
      {editing ? (
        <div className="space-y-3">
          <SponsorForm sponsor={sponsor} onSuccess={() => setEditing(false)} />
          <button onClick={() => setEditing(false)} className="text-xs text-white/40 hover:text-white/70">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Logo preview */}
          <div className="relative h-12 w-24 flex-none overflow-hidden rounded border border-white/15 bg-white/[0.06]">
            {logoUrl ? (
              <NextImage src={logoUrl} alt={sponsor.name} fill sizes="96px" className="object-contain p-1" />
            ) : (
              <div className="flex h-full items-center justify-center text-white/20">
                <Image size={20} weight="thin" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-[10px] text-white/70">…</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white">{sponsor.name}</p>
            {sponsor.websiteUrl && (
              <p className="text-xs text-white/40 truncate">{sponsor.websiteUrl}</p>
            )}
            {/* Logo upload controls */}
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/[0.06] px-2 py-1 text-xs font-medium text-white/60 hover:text-white disabled:opacity-50"
              >
                <UploadSimple size={11} weight="bold" />
                {logoUrl ? "Replace logo" : "Upload logo"}
              </button>
              {logoUrl && (
                <button
                  onClick={handleLogoRemove}
                  disabled={uploading}
                  className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/[0.06] px-2 py-1 text-xs font-medium text-red-400/70 hover:text-red-400 disabled:opacity-50"
                >
                  <Trash size={11} weight="regular" />
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button onClick={handleToggle} title={active ? "Hide from site" : "Show on site"} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white/50 hover:text-white transition-colors">
              {active ? <Eye size={15} /> : <EyeSlash size={15} />}
            </button>
            <button onClick={() => setEditing(true)} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white/50 hover:text-white transition-colors">
              <PencilSimple size={15} weight="duotone" />
            </button>
            <button onClick={handleDelete} disabled={deleting} title="Delete" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50">
              <Trash size={15} weight="regular" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function SponsorManager({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-[13px] font-bold uppercase tracking-[1px] text-white/70">
            Sponsors ({sponsors.length})
          </h2>
          <p className="text-xs text-white/35">Eye icon toggles visibility on site</p>
        </div>
        {sponsors.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-white/35">
            No sponsors yet. Add one →
          </p>
        ) : (
          <ul>
            {sponsors.map((s) => (
              <SponsorRow key={s.id} sponsor={s} />
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[1px] text-white/70">
          <PlusCircle size={15} weight="duotone" />
          Add Sponsor
        </h2>
        <SponsorForm />
      </div>
    </div>
  );
}
