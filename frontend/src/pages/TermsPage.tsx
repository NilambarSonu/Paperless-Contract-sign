import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as any },
  }),
};

export function TermsPage() {
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
              Terms of Service
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
            <p>
              These Terms of Service ("Terms") govern your access to and use of the Saathi Sign electronic
              signature platform ("Service") operated by Saathi Sign ("Company", "we", "us", "our").
            </p>
            <p className="mt-3">
              By creating an account or using the Service, you agree to be bound by these Terms.
              If you do not agree, do not use the Service.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">1. Description of Service</h2>
            <p>
              Saathi Sign is a cloud-based electronic document signing platform that enables contract creators
              ("Users") to:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-slate-600">
              <li>Upload contract documents (PDF, DOCX) for electronic signing</li>
              <li>Send secure, expiring signing links to third-party signers ("Signers")</li>
              <li>Collect electronic signatures, selfie photographs, IP addresses, and geolocation data</li>
              <li>Generate signed PDF documents with embedded audit trails</li>
              <li>Receive and distribute signed documents via email</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">2. Eligibility & Account Registration</h2>
            <p>
              You must be at least 18 years of age and capable of forming a legally binding contract to
              use this Service. By registering, you represent that you meet these requirements.
            </p>
            <p className="mt-3">
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activities that occur under your account. You must notify us immediately of any
              unauthorized access to your account.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">3. Electronic Signatures — Legal Validity</h2>
            <p>
              Electronic signatures created through Saathi Sign are intended to be legally binding in
              jurisdictions that recognize electronic signatures, including those covered by:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-slate-600">
              <li>The Information Technology Act, 2000 (India) — Section 5</li>
              <li>The Electronic Signatures in Global and National Commerce Act (ESIGN) — USA</li>
              <li>The eIDAS Regulation (EU) — as a "simple electronic signature"</li>
              <li>The Electronic Transactions Act — various common-law jurisdictions</li>
            </ul>
            <p className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
              ⚠️ <strong>Important disclaimer:</strong> Saathi Sign does not provide legal advice.
              The legal validity of any electronic signature depends on applicable law in your jurisdiction
              and the specific requirements of your contract type. You are solely responsible for ensuring
              that electronic signatures are legally sufficient for your use case. Consult a qualified legal
              professional for advice specific to your situation.
            </p>
            <p className="mt-3">
              Saathi Sign's signatures are NOT qualified electronic signatures (QES) under eIDAS and do
              not involve a Certificate Authority (CA) or qualified trust service provider.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">4. Your Responsibilities as a User</h2>
            <p>You agree that you will:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-slate-600">
              <li>
                Only send signing requests to individuals who have <strong>consented</strong> to receive them
                and are legally capable of entering the relevant agreement
              </li>
              <li>
                Accurately represent the content and nature of documents you upload for signing
              </li>
              <li>
                Inform signers that their selfie photograph, IP address, and geolocation data will be
                recorded as part of the signing process <strong>before</strong> sending the signing link
              </li>
              <li>
                Not use the Service to send fraudulent, illegal, deceptive, or coercive contracts
              </li>
              <li>
                Not upload content that violates any law or infringes third-party intellectual property rights
              </li>
              <li>
                Comply with all applicable data protection laws (GDPR, PDPA, CCPA, etc.) when using
                the Service to collect personal data from signers
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">5. Signer Consent & Data Collection</h2>
            <p>
              By proceeding through the signing flow, Signers expressly consent to:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-slate-600">
              <li>The capture and storage of their electronic signature (drawn signature image)</li>
              <li>The capture of a selfie photograph using their device camera</li>
              <li>The recording of their IP address at the time of signing</li>
              <li>The recording of their approximate geolocation (if browser permission is granted)</li>
              <li>The recording of their device and browser information</li>
              <li>All of the above being permanently embedded in the signed PDF document</li>
            </ul>
            <p className="mt-3">
              The contract creator (User) is responsible for ensuring that the Signer is aware of and
              consents to this data collection before the signing link is sent.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">6. Prohibited Uses</h2>
            <p>You may not use the Service to:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-slate-600">
              <li>Forge or misrepresent the identity of any party</li>
              <li>Send signing requests without the genuine intent to create a legally binding agreement</li>
              <li>Upload malicious files (malware, scripts, etc.)</li>
              <li>Circumvent or attack the platform's security measures</li>
              <li>Harvest or scrape user data from the platform</li>
              <li>Violate any applicable local, national, or international law or regulation</li>
              <li>Send spam or unsolicited commercial communications through the email system</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">7. Intellectual Property</h2>
            <p>
              You retain all intellectual property rights in the documents and content you upload to the Service.
              By uploading content, you grant Saathi Sign a limited, non-exclusive license to process and store
              that content solely for the purpose of providing the Service to you.
            </p>
            <p className="mt-3">
              All rights in the Saathi Sign platform, software, design, and brand are owned exclusively
              by the Company. You may not copy, modify, or distribute any part of the platform without
              written permission.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">8. Disclaimers & Limitation of Liability</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND,
              EXPRESS OR IMPLIED.
            </p>
            <p className="mt-3">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SAATHI SIGN SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS,
              DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p className="mt-3">
              IN PARTICULAR, SAATHI SIGN IS NOT RESPONSIBLE FOR:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1.5 text-slate-600">
              <li>The legal enforceability of any electronically signed agreement</li>
              <li>Disputes between contract creators and signers</li>
              <li>Any decision made by any court or tribunal regarding an electronically signed document</li>
              <li>Loss of data due to server failure or third-party service outage</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">9. Service Availability & Changes</h2>
            <p>
              We strive to maintain Service availability but do not guarantee uninterrupted access.
              We reserve the right to modify, suspend, or discontinue the Service at any time with
              reasonable notice where possible.
            </p>
            <p className="mt-3">
              We may update these Terms from time to time. Continued use of the Service after changes
              are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time if you violate these Terms
              or if we reasonably believe your use of the Service poses a legal or security risk.
              You may delete your account at any time by contacting support.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">11. Governing Law & Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India.
              Any disputes arising out of or related to these Terms shall be subject to the exclusive
              jurisdiction of the courts of India, without regard to conflict of law principles.
            </p>
          </section>

          {/* 12 */}
          <section className="border-t border-slate-100 pt-8">
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">12. Contact Us</h2>
            <p className="text-slate-600">For questions about these Terms:</p>
            <div className="mt-3 p-4 bg-[#106EBE]/5 rounded-xl border border-[#106EBE]/10 text-sm">
              <p><strong>Saathi Sign Legal</strong></p>
              <p className="mt-1">📧 <a href="mailto:legal@saathisign.app" className="text-[#106EBE] hover:underline">legal@saathisign.app</a></p>
              <p className="mt-1">🌐 <a href="/support" className="text-[#106EBE] hover:underline">saathisign.app/support</a></p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
