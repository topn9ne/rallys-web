"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createTheme, updateTheme } from "@/server/actions/themes";
import type { Theme } from "@prisma/client";

interface ThemeFormProps {
  theme?: Theme;
  onSuccess?: () => void;
}

const initialState = { error: undefined as any, success: false };

export function ThemeForm({ theme, onSuccess }: ThemeFormProps) {
  const action = theme
    ? async (_prev: typeof initialState, formData: FormData) => {
        const res = await updateTheme(theme.id, formData) as typeof initialState;
        if (res.success && onSuccess) onSuccess();
        return res;
      }
    : async (_prev: typeof initialState, formData: FormData) => {
        return createTheme(formData) as Promise<typeof initialState>;
      };

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Theme Name"
        name="name"
        required
        defaultValue={theme?.name}
        placeholder="e.g. Nashville Night, Bachelorette Bash"
        error={state.error?.name?.[0]}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-semibold text-gray-800">
          Description <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={theme?.description ?? ""}
          placeholder="Brief description of this theme..."
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue resize-none"
        />
      </div>

      {state.success && !theme && (
        <p className="text-sm text-green-600">Theme created.</p>
      )}
      {state.success && theme && (
        <p className="text-sm text-green-600">Theme updated.</p>
      )}
      {state.error?.name && (
        <p className="text-sm text-red-600">{state.error.name[0]}</p>
      )}

      <Button type="submit" loading={pending} className="w-full">
        {theme ? "Save Changes" : "Create Theme"}
      </Button>
    </form>
  );
}
