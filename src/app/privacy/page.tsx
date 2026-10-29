import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Rally's Indoor Training",
  description:
    "Privacy policy for Rally's Indoor Training LLC. What information we collect, how we use it, and your choices.",
};

export default function PrivacyPage() {
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
            Privacy Policy
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
            This policy describes what information Rally&rsquo;s Indoor Training
            (&ldquo;Rally&rsquo;s,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;)
            collects, how we use it, and your choices.
          </p>

          <div className="mt-14 space-y-12">
            {/* Information We Collect */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                Information We Collect
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-navy/80">
                <p>
                  <strong className="text-navy">Account information:</strong>{" "}
                  Name, email address, phone number, and payment method (processed
                  and stored by Stripe &mdash; we do not store full card numbers).
                </p>
                <p>
                  <strong className="text-navy">Player profiles:</strong> First
                  name, last name, date of birth, playing positions, school, and
                  travel team affiliation. Provided by the account holder for
                  players associated with their membership.
                </p>
                <p>
                  <strong className="text-navy">Booking data:</strong> Session
                  dates, times, lane assignments, booking type (player session or
                  team practice), and which players were designated for each
                  session.
                </p>
                <p>
                  <strong className="text-navy">Usage data:</strong> Hours logged
                  per player, milestone achievements, and Cage Rats program
                  progress. Derived from booking data.
                </p>
                <p>
                  <strong className="text-navy">Access data:</strong> Door code
                  generation and usage timestamps, recorded through our smart lock
                  system (Seam/Schlage).
                </p>
                <p>
                  <strong className="text-navy">Camera footage:</strong> Video
                  surveillance of the facility entrance and cage area, recorded
                  during all hours. Footage captures anyone entering or using the
                  facility.
                </p>
                <p>
                  <strong className="text-navy">Communications:</strong> SMS and
                  email messages sent to you (booking confirmations, door codes,
                  reminders, engagement messages), and any messages you send to our
                  business phone number.
                </p>
              </div>
            </div>

            {/* How We Use */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                How We Use Your Information
              </h2>
              <ul className="mt-4 ml-5 list-disc space-y-2 text-[15px] leading-relaxed text-navy/80">
                <li>
                  <strong className="text-navy">Operate the facility:</strong>{" "}
                  Process bookings, generate and deliver door codes, manage
                  memberships, collect payments
                </li>
                <li>
                  <strong className="text-navy">Track player progress:</strong>{" "}
                  Accumulate session hours, determine Cage Rats qualification,
                  trigger milestone awards
                </li>
                <li>
                  <strong className="text-navy">Communicate with you:</strong>{" "}
                  Booking confirmations, reminders, door codes, payment receipts,
                  membership updates, engagement nudges (weather prompts,
                  inactivity reminders, milestone notifications)
                </li>
                <li>
                  <strong className="text-navy">Facility security:</strong>{" "}
                  Monitor the facility via camera surveillance, match access events
                  to bookings, investigate reported incidents
                </li>
                <li>
                  <strong className="text-navy">Improve the service:</strong>{" "}
                  Analyze booking patterns, utilization, and member activity to
                  inform scheduling, pricing, and programming decisions
                </li>
                <li>
                  <strong className="text-navy">
                    Target relevant programming:
                  </strong>{" "}
                  Use player profile data (positions, school, team, age) to notify
                  you of relevant lessons, camps, clinics, and events
                </li>
              </ul>
            </div>

            {/* Third-Party Services */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                Third-Party Services
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                We share your information only with the following service
                providers, solely to operate the facility:
              </p>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-[14px] text-navy/80">
                  <thead>
                    <tr className="border-b border-navy/10">
                      <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-[1px] text-navy">
                        Service
                      </th>
                      <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-[1px] text-navy">
                        What They Receive
                      </th>
                      <th className="pb-3 text-xs font-bold uppercase tracking-[1px] text-navy">
                        Purpose
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                    <tr>
                      <td className="py-3 pr-4 font-medium text-navy">
                        Stripe
                      </td>
                      <td className="py-3 pr-4">Name, email, payment method</td>
                      <td className="py-3">
                        Payment processing, subscriptions, invoicing
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-navy">
                        Twilio
                      </td>
                      <td className="py-3 pr-4">
                        Phone number, message content
                      </td>
                      <td className="py-3">
                        SMS delivery (door codes, confirmations, reminders)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-navy">
                        Resend
                      </td>
                      <td className="py-3 pr-4">
                        Email address, message content
                      </td>
                      <td className="py-3">
                        Email delivery (confirmations, receipts, waivers)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-navy">Seam</td>
                      <td className="py-3 pr-4">
                        Door code data, access timestamps
                      </td>
                      <td className="py-3">Smart lock management</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-navy">
                        Vercel
                      </td>
                      <td className="py-3 pr-4">Technical logs</td>
                      <td className="py-3">Website hosting</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-navy">
                        Supabase
                      </td>
                      <td className="py-3 pr-4">
                        All account and booking data
                      </td>
                      <td className="py-3">Database hosting</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-[15px] leading-relaxed text-navy/80">
                We do not sell, rent, or share your personal information with
                advertisers, data brokers, or any third parties for marketing
                purposes.
              </p>
            </div>

            {/* Camera Footage */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                Camera Footage
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                Security cameras record video of the facility entrance and cage
                area. Footage is stored on our camera provider&rsquo;s cloud
                platform and retained for up to 30 days. Footage may be reviewed by
                Rally&rsquo;s owners to verify facility use, investigate damage or
                safety reports, and confirm session attendance. Footage is not
                shared publicly or with third parties except when required by law or
                to support an insurance claim.
              </p>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                Data Retention
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-navy/80">
                <p>
                  Account and booking data is retained for the duration of your
                  membership and for 12 months after cancellation, after which it
                  is deleted upon request.
                </p>
                <p>
                  Player profile data is deleted when the player is removed from
                  your account or upon account deletion.
                </p>
                <p>Camera footage is retained for up to 30 days.</p>
                <p>
                  Payment records are retained as required by tax and financial
                  reporting obligations.
                </p>
              </div>
            </div>

            {/* Your Choices */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                Your Choices
              </h2>
              <ul className="mt-4 ml-5 list-disc space-y-3 text-[15px] leading-relaxed text-navy/80">
                <li>
                  <strong className="text-navy">SMS opt-out:</strong> Reply STOP
                  to any Rally&rsquo;s text message to unsubscribe from
                  non-essential messages. Transactional messages (door codes,
                  booking confirmations) will still be sent for active bookings.
                </li>
                <li>
                  <strong className="text-navy">Email opt-out:</strong> Click the
                  unsubscribe link in any marketing email. Transactional emails
                  (receipts, waiver links) will still be sent.
                </li>
                <li>
                  <strong className="text-navy">Account deletion:</strong> Contact
                  us to request deletion of your account and associated data. We
                  will complete deletion within 30 days, except for records
                  required for legal or tax purposes.
                </li>
                <li>
                  <strong className="text-navy">Player profile updates:</strong>{" "}
                  You may add, edit, or remove player profiles from your account at
                  any time through your member dashboard.
                </li>
              </ul>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                Children&rsquo;s Privacy
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                Player profiles may include information about minors. This
                information is provided and managed by the parent or legal guardian
                who holds the membership account. We do not collect information
                directly from children. Player profile data for minors is subject
                to the same protections described in this policy.
              </p>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                Security
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                We use industry-standard security measures to protect your
                information, including encrypted connections (HTTPS), secure
                authentication (Supabase Auth), and PCI-compliant payment
                processing (Stripe). However, no system is completely secure, and
                we cannot guarantee absolute security.
              </p>
            </div>

            {/* Changes */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                Changes to This Policy
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                We may update this policy at any time. Updated versions will be
                posted at rallysindoor.com/privacy. Continued use of the facility
                after changes are posted constitutes acceptance.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                Contact
              </h2>
              <div className="mt-4 text-[15px] leading-relaxed text-navy/80">
                <p>Questions about this privacy policy:</p>
                <p className="mt-2">Rally&rsquo;s Indoor Training LLC</p>
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
