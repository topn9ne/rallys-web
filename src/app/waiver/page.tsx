import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waiver & Liability Release — Rally's Indoor Training",
  description:
    "Assumption of risk, waiver of liability, and release agreement for Rally's Indoor Training LLC in Hastings, Nebraska.",
};

export default function WaiverPage() {
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
            Waiver &amp; Liability Release
          </h1>
          <p className="mt-4 text-sm text-white/50">
            Rally&rsquo;s Indoor Training LLC &middot; 203 S Woodland Ave, Bay 5,
            Hastings, NE 68901
          </p>
        </div>
      </section>

      {/* Draft Notice */}
      <section className="border-b border-amber-200 bg-amber-50 px-6 py-5 md:px-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[1px] text-amber-800">
            Draft &mdash; Requires Attorney Review Before Use
          </p>
          <p className="mt-1 text-sm leading-relaxed text-amber-700">
            This is a starting template, not a final legal document. Have a
            Nebraska attorney experienced in sports/recreation liability review
            and approve this waiver before any participant signs it.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white px-6 py-20 md:px-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-lg font-bold uppercase tracking-[1px] text-navy">
            Rally&rsquo;s Indoor Training LLC
          </h2>
          <p className="mt-1 text-center text-sm uppercase tracking-[1px] text-navy/60">
            Assumption of Risk, Waiver of Liability, and Release Agreement
          </p>
          <p className="mt-4 text-center text-[15px] text-navy/70">
            Facility: Rally&rsquo;s Indoor Training, 203 S Woodland Ave, Bay 5,
            Hastings, NE 68901
          </p>

          <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-navy/10 bg-navy/[0.03] px-6 py-5">
            <p className="text-[15px] font-medium leading-relaxed text-navy">
              Please read this document carefully. By signing, you are waiving
              certain legal rights, including the right to sue.
            </p>
          </div>

          <div className="mt-14 space-y-12">
            {/* 1 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                1. Activities
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                This waiver covers all activities at Rally&rsquo;s Indoor
                Training, including but not limited to: use of batting cages,
                pitching machines, batting tees, and related baseball and softball
                training equipment; use of the facility during booked sessions; and
                presence in the facility at any time.
              </p>
            </div>

            {/* 2 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                2. Acknowledgment of Risks
              </h3>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-navy/80">
                <p>
                  I understand and acknowledge that participation in baseball and
                  softball training activities involves inherent risks that cannot
                  be eliminated, including but not limited to:
                </p>
                <ul className="ml-5 list-disc space-y-2">
                  <li>
                    Being struck by batted, pitched, or thrown baseballs or
                    softballs
                  </li>
                  <li>
                    Equipment malfunction or failure, including pitching machines
                  </li>
                  <li>
                    Contact with nets, cages, walls, fencing, or other facility
                    structures
                  </li>
                  <li>
                    Slips, trips, and falls on the playing surface or in common
                    areas
                  </li>
                  <li>
                    Injuries resulting from physical exertion, improper technique,
                    or overuse
                  </li>
                  <li>
                    Injuries resulting from the actions of other participants using
                    the facility simultaneously
                  </li>
                </ul>
                <p>
                  I further acknowledge that Rally&rsquo;s Indoor Training is a
                  self-service, unmanned facility with no employees, attendants, or
                  supervisors on-site during operating hours. I understand that no
                  staff will be present to provide instruction, monitor equipment,
                  supervise participants, or render first aid.
                </p>
              </div>
            </div>

            {/* 3 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                3. Assumption of Risk
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                I voluntarily assume all risks associated with participation in
                activities at Rally&rsquo;s Indoor Training, whether or not
                described above, including risks arising from the negligence of
                Rally&rsquo;s Indoor Training LLC, its owners, officers, agents,
                and affiliates (collectively, &ldquo;Released Parties&rdquo;).
              </p>
            </div>

            {/* 4 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                4. Waiver and Release of Liability
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                In consideration of being permitted to use the facility, I hereby
                release, waive, discharge, and covenant not to sue the Released
                Parties from any and all liability, claims, demands, actions, or
                causes of action arising out of or related to any loss, damage, or
                injury, including death, that may be sustained by me or any
                participant I am signing for, whether caused by the negligence of
                the Released Parties or otherwise, while participating in
                activities at Rally&rsquo;s Indoor Training or while on the
                premises.
              </p>
            </div>

            {/* 5 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                5. Indemnification
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                I agree to indemnify and hold harmless the Released Parties from
                any loss, liability, damage, or costs, including attorney&rsquo;s
                fees, that they may incur due to any claim made by me or on behalf
                of any participant I am signing for, arising from participation in
                activities at Rally&rsquo;s Indoor Training.
              </p>
            </div>

            {/* 6 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                6. Medical Acknowledgment
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                I confirm that I (or the participant I am signing for) am
                physically fit to participate in baseball/softball training
                activities and have no medical condition that would make
                participation inadvisable. I understand that Rally&rsquo;s does not
                provide medical personnel on-site and that I am solely responsible
                for obtaining any medical attention needed.
              </p>
            </div>

            {/* 7 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                7. Facility Rules
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                I agree to abide by all posted facility rules and operating
                procedures. I understand that Rally&rsquo;s may terminate my
                membership and revoke my access for violation of facility rules,
                misuse of equipment, or conduct that endangers others or the
                facility.
              </p>
            </div>

            {/* 8 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                8. Camera Surveillance Consent
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                I understand and consent to video surveillance recording within the
                facility at all times. I understand that this footage may be used
                for security, to verify facility use, and to investigate reported
                incidents.
              </p>
            </div>

            {/* 9 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                9. Minor Participants
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                If the participant is under 18 years of age, I represent that I am
                the parent or legal guardian of the minor participant. I hereby give
                my consent for the minor to participate in activities at
                Rally&rsquo;s Indoor Training and I agree to the terms of this
                waiver on the minor&rsquo;s behalf. I understand that a coach,
                instructor, or other adult who is not the parent or legal guardian
                does not have authority to sign this waiver on behalf of a minor.
              </p>
            </div>

            {/* 10 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                10. Severability
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                If any provision of this agreement is found to be unenforceable,
                the remaining provisions shall remain in full force and effect.
              </p>
            </div>

            {/* 11 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                11. Governing Law
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                This agreement shall be governed by and construed in accordance
                with the laws of the State of Nebraska.
              </p>
            </div>

            {/* 12 */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-gold">
                12. Acknowledgment
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/80">
                I have read this waiver and liability release, fully understand its
                terms, and understand that I am giving up substantial rights,
                including the right to sue. I acknowledge that I am signing this
                agreement freely and voluntarily, and intend my signature to be a
                complete and unconditional release of all liability to the greatest
                extent allowed by law.
              </p>
            </div>

            {/* Signature Fields (display only) */}
            <div className="rounded-lg border border-navy/10 bg-navy/[0.03] px-6 py-8">
              <h3 className="text-sm font-bold uppercase tracking-[2px] text-navy">
                Participant Information
              </h3>
              <div className="mt-6 space-y-4 text-[15px] text-navy/60">
                <div className="border-b border-navy/10 pb-2">
                  Participant Name: ____________________
                </div>
                <div className="border-b border-navy/10 pb-2">
                  Date of Birth: ____________________
                </div>
                <div className="border-b border-navy/10 pb-2">
                  Signature: ____________________ (typed full legal name serves as
                  digital signature)
                </div>
                <div className="border-b border-navy/10 pb-2">
                  Date Signed: ____________________
                </div>
                <div className="pb-2">IP Address: (captured automatically)</div>
              </div>

              <h3 className="mt-10 text-sm font-bold uppercase tracking-[2px] text-navy">
                For Minor Participants (under 18)
              </h3>
              <div className="mt-6 space-y-4 text-[15px] text-navy/60">
                <div className="border-b border-navy/10 pb-2">
                  Minor&rsquo;s Name: ____________________
                </div>
                <div className="border-b border-navy/10 pb-2">
                  Parent/Legal Guardian Name: ____________________
                </div>
                <div className="border-b border-navy/10 pb-2">
                  Parent/Legal Guardian Signature: ____________________
                  (typed full legal name)
                </div>
                <div className="border-b border-navy/10 pb-2">
                  Relationship to Minor: ____________________
                </div>
                <div className="pb-2">Date Signed: ____________________</div>
              </div>
            </div>

            {/* Attorney Review Notes */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-6">
              <h3 className="text-sm font-bold uppercase tracking-[1px] text-amber-800">
                Attorney Review Notes
              </h3>
              <p className="mt-3 text-sm text-amber-700">
                Areas to verify with Nebraska counsel:
              </p>
              <ul className="mt-3 ml-5 list-disc space-y-2 text-sm leading-relaxed text-amber-700">
                <li>
                  Enforceability of pre-injury liability waivers in Nebraska
                  (Nebraska courts have historically been skeptical of broad
                  liability waivers &mdash; the scope of the release should be
                  reviewed)
                </li>
                <li>
                  Whether the waiver adequately addresses the unmanned/self-service
                  nature of the facility
                </li>
                <li>
                  Whether the digital signature method (typed name + timestamp + IP
                  address) meets Nebraska electronic signature requirements under
                  the Uniform Electronic Transactions Act (UETA)
                </li>
                <li>
                  Whether the minor waiver provisions are enforceable in Nebraska
                  (many states limit a parent&rsquo;s ability to waive a
                  minor&rsquo;s future claims)
                </li>
                <li>
                  Whether additional language is needed regarding assumption of
                  risk for an unmanned facility specifically
                </li>
                <li>
                  Whether the indemnification clause is appropriate for a
                  consumer-facing recreational facility
                </li>
                <li>
                  Insurance carrier review &mdash; confirm waiver language
                  satisfies the GL policy requirements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
