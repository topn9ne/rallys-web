import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Rally's Indoor Training",
  description:
    "Terms of service for Rally's Indoor Training LLC in Hastings, Nebraska. Membership, booking, cancellation, and facility use policies.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen font-sans">
      <SiteNav />

      {/* Header */}
      <section className="bg-navy px-6 py-24 md:px-14">
        <div className="mx-auto max-w-3xl">
          <div className="text-[13px] font-bold uppercase tracking-[2px] text-gold">
            Legal
          </div>
          <h1 className="mt-4 text-4xl font-bold uppercase leading-tight tracking-[-1px] text-white sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-white/50">
            Rally&rsquo;s Indoor Training LLC &middot; 203 S Woodland Ave, Bay 5,
            Hastings, NE 68901
          </p>
          <p className="mt-1 text-sm text-white/50">
            Last updated: October 28, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white px-6 py-20 md:px-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-navy/80">
            By creating an account, purchasing a membership, or booking a session
            at Rally&rsquo;s Indoor Training (&ldquo;Rally&rsquo;s,&rdquo;
            &ldquo;the facility,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), you
            agree to the following terms.
          </p>

          <div className="mt-14 space-y-12">
            {/* 1 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                1. Membership &amp; Billing
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-navy/80">
                <p>
                  Memberships are billed monthly on the date of enrollment via
                  Stripe. Two tiers are available: Family ($50/month) and Team
                  ($75/month). All prices include applicable Nebraska sales tax.
                </p>
                <p>
                  Memberships renew automatically each month until cancelled. You
                  authorize Rally&rsquo;s to charge the payment method on file for
                  each renewal. You may cancel at any time through the member
                  portal &mdash; cancellation takes effect at the end of the
                  current billing period. No partial-month refunds.
                </p>
                <p>
                  Rally&rsquo;s reserves the right to change membership pricing.
                  Changes apply to new subscriptions and renewals only. Existing
                  members will receive at least 30 days&rsquo; written notice
                  before a price change takes effect on their account.
                </p>
              </div>
            </div>

            {/* 2 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                2. Drop-In Sessions
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                Drop-in sessions are one-time purchases at the posted rate plus
                applicable Nebraska sales tax. No membership is required. Payment
                is collected at the time of booking via Stripe.
              </p>
            </div>

            {/* 3 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                3. Booking &amp; Cancellation
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-navy/80">
                <p>
                  All sessions are booked through rallysindoor.com. Each booking
                  reserves a 30-minute cage slot.
                </p>
                <p>
                  Cancellations made at least 2 hours before the scheduled start
                  time will release the slot with no penalty. Cancellations made
                  less than 2 hours before the start time are non-refundable.
                  Drop-in cancellations within the allowed window will receive a
                  full refund to the original payment method.
                </p>
                <p>
                  Rally&rsquo;s reserves the right to cancel or reschedule
                  bookings due to facility maintenance, weather events, or
                  emergencies. Members will be notified via SMS and/or email.
                </p>
              </div>
            </div>

            {/* 4 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                4. Access &amp; Door Codes
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                Upon booking, you will receive a time-limited door code via SMS.
                This code is valid only during your scheduled session window (15
                minutes before start through 15 minutes after end). Door codes are
                personal and non-transferable. Sharing your door code with
                non-members or entering the facility outside your booked window is
                a violation of these terms and may result in membership
                termination.
              </p>
            </div>

            {/* 5 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                5. Facility Rules
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-navy/80">
                <p>
                  Rally&rsquo;s is a self-service, unmanned facility. No employees
                  are on-site during operating hours (6 AM &ndash; 10 PM daily).
                  By entering the facility, you agree to:
                </p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>
                    Use all equipment (pitching machines, tees, nets) at your own
                    risk and in accordance with posted instructions
                  </li>
                  <li>
                    Return all equipment to its designated location after your
                    session
                  </li>
                  <li>
                    Leave the facility in the condition you found it
                  </li>
                  <li>
                    Report any equipment damage or safety concerns immediately via
                    text to the Rally&rsquo;s phone number
                  </li>
                  <li>
                    Refrain from tampering with facility hardware (locks, cameras,
                    electrical systems, HVAC)
                  </li>
                  <li>Abide by all posted facility rules</li>
                </ul>
                <p>
                  Rally&rsquo;s reserves the right to terminate membership and
                  revoke access for violations of these rules.
                </p>
              </div>
            </div>

            {/* 6 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                6. Camera Surveillance
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                The facility is monitored by security cameras during all hours. By
                entering the facility, you consent to video surveillance and
                recording. Camera footage may be reviewed for security purposes,
                to verify facility use, and to investigate reported incidents.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                7. Player Profiles &amp; Family Access
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-navy/80">
                <p>
                  Family and Team memberships allow the account holder to add
                  player profiles (minors or other household members) to their
                  account. The account holder is responsible for the conduct of all
                  players associated with their account during booked sessions.
                </p>
                <p>
                  Team-tier bookings designated as team practices must involve only
                  players associated with the booking account&rsquo;s team roster.
                  Family and individual sessions are for players listed on the
                  account holder&rsquo;s player roster only.
                </p>
              </div>
            </div>

            {/* 8 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                8. Waivers
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                All participants must sign a digital waiver before their first
                session. For participants under 18, a parent or legal guardian must
                sign the waiver. Coach signatures do not satisfy the parental
                consent requirement. Waivers remain on file for the duration of the
                membership. Rally&rsquo;s may update the waiver text, in which case
                members will be prompted to re-sign.
              </p>
            </div>

            {/* 9 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                9. Assumption of Risk
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                Baseball and softball involve inherent risks including but not
                limited to injury from batted, thrown, or pitched balls, contact
                with equipment, slips, trips, and falls. By using the facility, you
                acknowledge these risks and assume full responsibility for any
                injury to yourself or the players on your account.
              </p>
            </div>

            {/* 10 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                10. Limitation of Liability
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                To the fullest extent permitted by Nebraska law, Rally&rsquo;s
                Indoor Training LLC, its owners, officers, and agents shall not be
                liable for any injury, loss, or damage arising from the use of the
                facility, equipment, or services, except in cases of gross
                negligence or willful misconduct.
              </p>
            </div>

            {/* 11 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                11. Auto-Renewal Disclosure (Nebraska)
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                In compliance with Nebraska law: your membership subscription will
                automatically renew each month at the then-current rate unless you
                cancel before the next billing date. You may cancel at any time
                through the member portal at rallysindoor.com or by contacting us
                at the phone number listed above. Cancellation takes effect at the
                end of the current billing period.
              </p>
            </div>

            {/* 12 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                12. Termination
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                Rally&rsquo;s may terminate or suspend your membership at any time
                for violation of these terms, misuse of the facility, non-payment,
                or conduct that endangers other members or the facility. In the
                event of termination by Rally&rsquo;s, any remaining prepaid period
                will be refunded on a prorated basis.
              </p>
            </div>

            {/* 13 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                13. Changes to Terms
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                Rally&rsquo;s may update these terms at any time. Updated terms
                will be posted at rallysindoor.com/terms. Continued use of the
                facility after changes are posted constitutes acceptance of the
                updated terms.
              </p>
            </div>

            {/* 14 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                14. Governing Law
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                These terms are governed by the laws of the State of Nebraska. Any
                disputes arising under these terms shall be resolved in the courts
                of Adams County, Nebraska.
              </p>
            </div>

            {/* 15 */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                15. Contact
              </h2>
              <div className="mt-4 text-[15px] leading-relaxed text-navy/80">
                <p>Rally&rsquo;s Indoor Training LLC</p>
                <p>203 S Woodland Ave, Bay 5</p>
                <p>Hastings, NE 68901</p>
                <p className="mt-2">
                  Phone:{" "}
                  <a href="tel:+13083909955" className="underline">
                    (308) 390-9955
                  </a>
                </p>
                <p>
                  Email:{" "}
                  <a href="mailto:hello@rallysindoor.com" className="underline">
                    hello@rallysindoor.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
