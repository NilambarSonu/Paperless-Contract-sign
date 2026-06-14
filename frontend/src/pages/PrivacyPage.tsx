import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as any },
  }),
};

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f4f8fd]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-24 pt-28">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-[#106EBE]/10 text-[#106EBE] mb-4">
              Legal
            </span>
            <h1 className="font-display text-4xl font-bold text-[#0A1628] tracking-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-slate-500 text-sm">
              Last updated: June 14, 2025 · Effective immediately
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-12 space-y-10 text-slate-700 leading-relaxed"
        >
          {/* Intro */}
          <section>
            <p className="text-slate-600">
              Saathi Sign ("we", "our", "us") operates the Saathi Sign e-signature platform accessible at{" "}
              <strong>saathisign.app</strong> (the "Service"). This Privacy Policy explains what personal data
              we collect, why we collect it, how we use it, and your rights regarding that data.
            </p>
            <p className="mt-3 text-slate-600">
              By using the Service, you agree to the collection and use of information described in this policy.
              If you do not agree, please discontinue use of the Service.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">1. Information We Collect</h2>

            <h3 className="font-semibold text-[#0A1628] mb-2">1.1 Account Information (Contract Creators)</h3>
            <p>
              When you create an account, we collect your name, email address, and any business details
              you optionally provide (business name, phone, address, bank details for payment instructions
              printed on contracts). Account authentication is handled by Clerk — we do not store your password.
            </p>

            <h3 className="font-semibold text-[#0A1628] mb-2 mt-5">1.2 Contract Data</h3>
            <p>
              When you create a contract, we store: contract title, the signer's name and email address,
              any uploaded contract file (PDF or DOCX), custom fields you define, and the expiry date of the signing link.
            </p>

            <h3 className="font-semibold text-[#0A1628] mb-2 mt-5">1.3 Signer Data (Collected at Signing Time)</h3>
            <p>
              When a recipient signs a document, we collect and permanently store the following data
              as part of the legally binding audit trail:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-slate-600">
              <li>Full name, email address, company name (optional), and mailing address</li>
              <li>
                <strong>Handwritten digital signature</strong> — captured as a PNG image from the signature canvas
              </li>
              <li>
                <strong>Selfie photograph</strong> — captured via the device camera at the moment of signing
                (used for identity verification and embedded in the signed PDF)
              </li>
              <li>
                <strong>IP address</strong> — automatically recorded from the device used to sign
              </li>
              <li>
                <strong>GPS coordinates and location string</strong> — latitude, longitude, and city/region
                (requires browser geolocation permission; the signer may deny this)
              </li>
              <li>
                <strong>Device / browser information</strong> — user-agent string identifying the browser,
                operating system, and device type
              </li>
              <li>
                <strong>Timestamp</strong> — exact date and time of signing in UTC
              </li>
            </ul>
            <p className="mt-3 text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
              ⚠️ <strong>Important:</strong> All of the above signer data — including the selfie image —
              is embedded permanently into the signed PDF and is visible to the contract creator who requested the signature.
              Do not use this service if you are uncomfortable having your photograph, IP address,
              or location recorded.
            </p>

            <h3 className="font-semibold text-[#0A1628] mb-2 mt-5">1.4 Usage Data</h3>
            <p>
              We collect server logs including API request paths (without sensitive parameters), HTTP status
              codes, and response times. These logs are retained for up to 30 days for debugging purposes.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>To provide the electronic signature service and generate legally valid signed PDFs</li>
              <li>To send signing invitation emails to signers on behalf of contract creators</li>
              <li>To send signed PDF copies to both parties by email</li>
              <li>To maintain a full audit log for legal verification purposes</li>
              <li>To display your business information on contracts (if configured in Settings)</li>
              <li>To authenticate you via Clerk and maintain your session</li>
              <li>To respond to support requests</li>
            </ul>
            <p className="mt-4">
              We do <strong>not</strong> sell your personal data to third parties.
              We do <strong>not</strong> use your data for advertising or marketing profiling.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">3. Legal Basis for Processing (GDPR)</h2>
            <p>
              For users in the European Economic Area (EEA), our legal bases for processing personal data are:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-600">
              <li>
                <strong>Contract performance</strong> (Art. 6(1)(b)) — processing necessary to provide the
                signing service you have requested
              </li>
              <li>
                <strong>Legitimate interests</strong> (Art. 6(1)(f)) — maintaining audit logs for legal
                validity of executed contracts
              </li>
              <li>
                <strong>Consent</strong> (Art. 6(1)(a)) — for geolocation data, where the signer explicitly
                grants browser location permission
              </li>
              <li>
                <strong>Legal obligation</strong> (Art. 6(1)(c)) — if required by applicable law or court order
              </li>
            </ul>
            <p className="mt-4">
              Processing of biometric-adjacent data (selfie photographs) is done solely for identity verification
              as part of the signing ceremony and is disclosed to the signer before capture.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">4. Data Sharing & Third-Party Services</h2>
            <p>We share data only with the following third-party providers that are necessary to operate the Service:</p>
            <div className="mt-4 space-y-3">
              {[
                { name: "Clerk", purpose: "User authentication and session management", link: "https://clerk.com/privacy", country: "USA" },
                { name: "Supabase", purpose: "PostgreSQL database hosting (all contract data)", link: "https://supabase.com/privacy", country: "USA (AWS)" },
                { name: "Cloudinary", purpose: "Storage of uploaded contract files and signed PDFs", link: "https://cloudinary.com/privacy", country: "USA" },
                { name: "Resend", purpose: "Transactional email delivery (signing links, confirmations)", link: "https://resend.com/privacy", country: "USA" },
              ].map(({ name, purpose, link, country }) => (
                <div key={name} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-[#106EBE] shrink-0" />
                  <div>
                    <strong className="text-[#0A1628]">{name}</strong>
                    <span className="text-slate-500"> ({country}) — </span>
                    <span className="text-slate-600">{purpose}. </span>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-[#106EBE] hover:underline text-sm">
                      Privacy Policy ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">5. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li><strong>Contracts and all associated data</strong> — retained indefinitely for legal compliance</li>
              <li><strong>Uploaded original files (PDF/DOCX)</strong> — retained as long as the contract exists</li>
              <li><strong>Signed PDFs</strong> — retained indefinitely as legal records</li>
              <li><strong>Audit logs</strong> — retained indefinitely</li>
              <li><strong>Server access logs</strong> — retained for 30 days</li>
              <li><strong>Account data</strong> — retained until account deletion</li>
            </ul>
            <p className="mt-3 text-slate-600">
              To request deletion of your data, please contact us at{" "}
              <a href="mailto:privacy@saathisign.app" className="text-[#106EBE] hover:underline">
                privacy@saathisign.app
              </a>.
              Note: Signed contract records may need to be retained for legal compliance purposes
              even after an account deletion request.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">6. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-600">
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Rectification</strong> — request correction of inaccurate data</li>
              <li><strong>Erasure</strong> — request deletion of your personal data ("right to be forgotten")</li>
              <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
              <li><strong>Objection</strong> — object to processing based on legitimate interests</li>
              <li><strong>Restriction</strong> — request that we restrict processing of your data</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a href="mailto:privacy@saathisign.app" className="text-[#106EBE] hover:underline">
                privacy@saathisign.app
              </a>{" "}
              with the subject line "Privacy Request".
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">7. Cookies & Local Storage</h2>
            <p>
              Saathi Sign uses browser cookies and local storage only for authentication session management
              (via Clerk). We do not use tracking cookies, advertising cookies, or analytics cookies.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">8. Security</h2>
            <p>
              We implement industry-standard security practices including HTTPS/TLS encryption in transit,
              hashed authentication tokens, and access-controlled database connections. Contract signing links
              use cryptographically secure UUID tokens. However, no system is 100% secure — you use the
              Service at your own risk.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">9. Children's Privacy</h2>
            <p>
              The Service is not directed to individuals under the age of 18. We do not knowingly collect
              personal data from children. If you believe a child has provided us with personal data,
              please contact us immediately.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users by email
              and update the "Last updated" date at the top of this page. Continued use of the Service
              after changes constitutes acceptance of the new policy.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">11. Contact Us</h2>
            <p className="text-slate-600">
              For any privacy-related questions, data requests, or concerns:
            </p>
            <div className="mt-3 p-4 bg-[#106EBE]/5 rounded-xl border border-[#106EBE]/10 text-sm">
              <p><strong>Saathi Sign Privacy Team</strong></p>
              <p className="mt-1">📧 <a href="mailto:privacy@saathisign.app" className="text-[#106EBE] hover:underline">privacy@saathisign.app</a></p>
              <p className="mt-1">🌐 <a href="/support" className="text-[#106EBE] hover:underline">saathisign.app/support</a></p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
