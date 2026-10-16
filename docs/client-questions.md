# Railside Rides — Client Questions

Open items that need client input before implementation.

---

## 1. Merge Add-Ons and In-Ride Items?

**Context:** "Add-Ons" (selected during booking checkout) and "In-Ride Items" (purchased via bike QR code) are currently two separate lists in the admin. A product like SHOTSKI makes sense in both places — available at booking and during the ride.

**Options:**
- **A) Keep separate lists** — admin manually adds the same item in both places. Simple, but duplicated maintenance.
- **B) Merge into a single item list** with toggles for "Available at booking" and "Available in-ride." One admin page, one source of truth.

**Recommendation:** Option B — cleaner long-term, avoids price/name drift between duplicates.

**Waiting on:** Client preference.

---
