"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import {
  addNotificationContact,
  updateNotificationContact,
  updateNotificationPreferences,
  removeNotificationContact,
} from "@/server/actions/notificationContacts";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  relationship: string;
  sendCodes: boolean;
  sendBookings: boolean;
  sendBilling: boolean;
  viaSms: boolean;
  viaEmail: boolean;
  isPrimary: boolean;
}

const RELATIONSHIPS = ["Parent", "Player", "Coach", "Other"];

function PreferencesCard({ contact }: { contact: Contact }) {
  function action(
    _prev: { error?: string; success?: boolean } | null,
    formData: FormData
  ) {
    return updateNotificationPreferences(formData);
  }

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="contactId" value={contact.id} />

        <div>
          <h3 className="text-sm font-semibold text-gray-900">Message types</h3>
          <p className="text-xs text-gray-500">What notifications you receive.</p>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="sendCodes"
                defaultChecked={contact.sendCodes}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              Door codes
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="sendBookings"
                defaultChecked={contact.sendBookings}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              Booking confirmations
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="sendBilling"
                defaultChecked={contact.sendBilling}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              Billing &amp; receipts
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">Channels</h3>
          <p className="text-xs text-gray-500">How you receive them.</p>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="viaSms"
                defaultChecked={contact.viaSms}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              Text message (SMS)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="viaEmail"
                defaultChecked={contact.viaEmail}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
              />
              Email
            </label>
          </div>
        </div>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-green-700">Saved!</p>
        )}

        <Button type="submit" variant="primary" size="sm" loading={isPending}>
          Save preferences
        </Button>
      </form>
    </div>
  );
}

function ContactForm({
  contact,
  onDone,
}: {
  contact?: Contact;
  onDone?: () => void;
}) {
  function formAction(
    _prev: { error?: string; success?: boolean } | null,
    formData: FormData
  ) {
    return contact ? updateNotificationContact(formData) : addNotificationContact(formData);
  }

  const [state, action, isPending] = useActionState(formAction, null);

  if (state?.success && onDone) {
    onDone();
  }

  return (
    <form action={action} className="space-y-3">
      {contact && <input type="hidden" name="contactId" value={contact.id} />}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          name="firstName"
          defaultValue={contact?.firstName ?? ""}
          required
        />
        <Input
          label="Last name"
          name="lastName"
          defaultValue={contact?.lastName ?? ""}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relationship
          </label>
          <select
            name="relationship"
            defaultValue={contact?.relationship ?? "Parent"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          >
            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <PhoneInput
          label="Phone"
          name="phone"
          defaultValue={contact?.phone ?? ""}
        />
      </div>

      <Input
        label="Email"
        name="email"
        type="email"
        defaultValue={contact?.email ?? ""}
        placeholder="email@example.com"
      />

      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-1.5">
          Send this person
        </legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="sendCodes"
              defaultChecked={contact?.sendCodes ?? true}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            Door codes
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="sendBookings"
              defaultChecked={contact?.sendBookings ?? true}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            Bookings
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="sendBilling"
              defaultChecked={contact?.sendBilling ?? false}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            Billing
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-1.5">
          Via
        </legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="viaSms"
              defaultChecked={contact?.viaSms ?? true}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            Text
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="viaEmail"
              defaultChecked={contact?.viaEmail ?? true}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            Email
          </label>
        </div>
      </fieldset>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="submit" variant="primary" size="sm" loading={isPending}>
          {contact ? "Save" : "Add contact"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-brand-blue/30 bg-blue-50 p-4">
        <ContactForm contact={contact} onDone={() => setEditing(false)} />
      </div>
    );
  }

  const types = [
    contact.sendCodes && "Codes",
    contact.sendBookings && "Bookings",
    contact.sendBilling && "Billing",
  ].filter(Boolean);

  const channels = [
    contact.viaSms && "SMS",
    contact.viaEmail && "Email",
  ].filter(Boolean);

  return (
    <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{contact.firstName} {contact.lastName}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {contact.relationship}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-gray-500">
          {contact.phone && <span>{contact.phone}</span>}
          {contact.email && <span>{contact.email}</span>}
        </div>
        {types.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {types.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700"
              >
                {t}
              </span>
            ))}
            <span className="text-[10px] text-gray-400 px-1">via</span>
            {channels.map((c) => (
              <span
                key={c}
                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <form action={removeNotificationContact}>
          <input type="hidden" name="contactId" value={contact.id} />
          <Button variant="ghost" size="sm" type="submit">
            Remove
          </Button>
        </form>
      </div>
    </div>
  );
}

export function NotificationContacts({ contacts }: { contacts: Contact[] }) {
  const [adding, setAdding] = useState(false);
  const primaryContact = contacts.find((c) => c.isPrimary);
  const additionalContacts = contacts.filter((c) => !c.isPrimary);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <p className="mt-1 text-sm text-gray-600">
          Set your communication preferences.
        </p>
      </div>

      {/* Your preferences */}
      {primaryContact && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Your preferences
          </h3>
          <PreferencesCard contact={primaryContact} />
        </div>
      )}

      {/* Additional contacts */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Additional contacts
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          Other people who should receive door codes, booking info, or billing
          notifications.
        </p>

        <div className="space-y-3">
          {additionalContacts.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}

          {adding ? (
            <div className="rounded-xl border border-brand-blue/30 bg-blue-50 p-4">
              <ContactForm onDone={() => setAdding(false)} />
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
              + Add a contact
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
