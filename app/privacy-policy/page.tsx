import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - BlueScale",
  description:
    "Learn how BlueScale collects, uses, stores, and protects your personal data.",
};

const effectiveDate = "March 23, 2026";

export default function PrivacyPolicyPage() {
  return (
    <section className="min-h-screen bg-slate-50 px-6 py-10 sm:px-8 lg:px-24">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-500">Effective date: {effectiveDate}</p>
        <p className="mt-6 text-slate-700 leading-7">
          This Privacy Policy explains how BlueScale ("we", "us", "our")
          collects, uses, discloses, and protects personal information when you
          use our platform, including web applications, integrations, and
          related services.
        </p>

        <div className="mt-8 space-y-8 text-slate-700">
          <PolicySection title="1. Information We Collect">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Account information: name, email address, profile information,
                authentication identifiers.
              </li>
              <li>
                Event and meeting information: event metadata, meeting links,
                scheduling details, selected streaming destinations.
              </li>
              <li>
                OAuth and connection data: encrypted tokens and connection
                metadata for Twitch, YouTube, Facebook, or other connected
                platforms.
              </li>
              <li>
                Payment information: subscription and billing metadata processed
                through Stripe. We do not store full card details.
              </li>
              <li>
                Technical data: IP address, browser/device details, log data,
                and usage analytics required for operations, security, and
                troubleshooting.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="2. How We Use Your Information">
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide, operate, and improve the BlueScale platform.</li>
              <li>
                Authenticate users, manage sessions, and secure accounts.
              </li>
              <li>
                Enable live streaming workflows and social platform
                integrations.
              </li>
              <li>
                Process subscriptions, billing, and account administration.
              </li>
              <li>
                Monitor platform performance, prevent fraud or abuse, and comply
                with legal obligations.
              </li>
              <li>
                Communicate service-related notices, product updates, and
                support responses.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Legal Bases (Where Applicable)">
            <p>
              Depending on your location, we process data based on one or more
              of the following: performance of a contract, legitimate interests,
              legal obligations, and consent (for specific processing activities
              where consent is required).
            </p>
          </PolicySection>

          <PolicySection title="4. Cookies and Similar Technologies">
            <p>
              We use essential cookies and similar technologies for
              authentication, session security, and basic platform
              functionality. We may also use analytics-related storage
              technologies to understand feature usage and improve performance.
            </p>
          </PolicySection>

          <PolicySection title="5. Sharing and Disclosure">
            <p>We may share personal data with:</p>
            <ul className="list-disc space-y-2 pl-5 mt-2">
              <li>
                Service providers that support our operations (for example:
                hosting infrastructure, authentication, billing, and analytics).
              </li>
              <li>
                Third-party platforms you choose to connect (such as Twitch,
                YouTube, Facebook, or BigBlueButton environments).
              </li>
              <li>
                Legal authorities when required by applicable law, regulation,
                or valid legal process.
              </li>
              <li>
                Successors in business transfers (such as merger, acquisition,
                or asset sale), subject to confidentiality and applicable law.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="6. Data Retention">
            <p>
              We retain personal data only for as long as necessary to fulfill
              the purposes outlined in this policy, provide our services, comply
              with legal obligations, resolve disputes, and enforce agreements.
              Retention periods vary depending on data category and legal
              requirements.
            </p>
          </PolicySection>

          <PolicySection title="7. Security">
            <p>
              We use technical and organizational safeguards designed to protect
              personal data, including encrypted transport, controlled access,
              and secure credential/token handling. No method of transmission or
              storage is completely secure, but we continuously improve our
              protections.
            </p>
          </PolicySection>

          <PolicySection title="8. International Transfers">
            <p>
              Your information may be processed in countries other than your
              own. Where required, we implement appropriate safeguards to ensure
              your personal data remains protected during cross-border transfers.
            </p>
          </PolicySection>

          <PolicySection title="9. Your Privacy Rights">
            <p>
              Subject to local law, you may have rights to access, correct,
              delete, or restrict processing of your personal data, as well as
              rights to portability or objection. You may also withdraw consent
              where processing is based on consent.
            </p>
          </PolicySection>

          <PolicySection title="10. Children’s Privacy">
            <p>
              Our services are not directed to children under the age required
              by applicable law, and we do not knowingly collect personal data
              from children without proper authorization.
            </p>
          </PolicySection>

          <PolicySection title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. If we make
              material changes, we will update the effective date and provide
              additional notice where required.
            </p>
          </PolicySection>

          <PolicySection title="12. Contact Us">
            <p>
              For privacy questions or requests, contact us at
              {" "}
              <a
                href="mailto:contact@craftschoolship.com"
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                contact@craftschoolship.com
              </a>
              .
            </p>
          </PolicySection>
        </div>
      </div>
    </section>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 leading-7">{children}</div>
    </section>
  );
}