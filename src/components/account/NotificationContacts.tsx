"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  addNotificationContact,
  updateNotificationContact,
  removeNotificationContact,
} from "@/server/actions/notificationContacts";

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  relationship: string;
  sendCodes: boolean;
  sendBookings: boolean;
  sendBilling: boolean;
  isPrimary: boolean;
}

const RELATIONSHIPS = ["Parent", "Player", "Coach", "Other"];

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
          label="Name"
          name="name"
          defaultValue={contact?.name ?? ""}
          required
          placeholder="First Last"
        />
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={contact?.phone ?? ""}
          placeholder="+1 (555) 000-0000"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          defaultValue={contact?.email ?? ""}
          placeholder="email@example.com"
        />
      </div>

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
            Booking confirmations
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

  const badges = [
    contact.sendCodes && "Codes",
    contact.sendBookings && "Bookings",
    contact.sendBilling && "Billing",
  ].filter(Boolean);

  return (
    <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{contact.name}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {contact.relationship}
          </span>
          {contact.isPrimary && (
            <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold text-brand-blue">
              You
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-gray-500">
          {contact.phone && <span>{contact.phone}</span>}
          {contact.email && <span>{contact.email}</span>}
        </div>
        {badges.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
      {!contact.isPrimary && (
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
      )}
    </div>
  );
}

export function NotificationContacts({ contacts }: { contacts: Contact[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Notification contacts</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Who gets door codes, booking confirmations, and billing notifications.
        </p>
      </div>

      {contacts.map((c) => (
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
  );
}
