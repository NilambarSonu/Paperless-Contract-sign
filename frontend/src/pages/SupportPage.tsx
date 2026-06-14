import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Clock, FileText, Shield, Zap } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as any },
  }),
};

const faqs = [
  {
    q: "What file formats does Saathi Sign support?",
    a: "We support PDF and DOCX (Microsoft Word) files up to 20 MB. For the best signing experience with document embedding, we recommend uploading PDFs. DOCX files are accepted but the original document will not be merged into the signed PDF certificate.",
  },
  {
    q: "Is a Saathi Sign signature legally binding?",
    a: "Saathi Sign electronic signatures are designed to comply with the Information Technology Act, 2000 (India), the US ESIGN Act, and the EU eIDAS Regulation as a simple electronic signature. The platform captures IP address, geolocation, device info, timestamp, and a selfie to build a comprehensive audit trail. However, legal validity depends on your jurisdiction and contract type — consult a lawyer for your specific situation.",
  },
  {
    q: "What happens if the signer denies camera or location access?",
    a: "The selfie step requires camera access. If the signer denies camera permission, they will not be able to complete signing — this is by design to ensure identity verification. Geolocation is optional; if denied, the audit trail will record 'location not provided' but signing can still proceed.",
  },
  {
    q: "How long are signing links valid?",
    a: "By default, signing links expire after 7 days. You can configure this (up to 30 days) when generating a new signing link from your dashboard. Once expired, the link is permanently invalid.",
  },
  {
    q: "Can a signer reject a contract?",
    a: "Yes. The signer can reject a contract by providing a reason. You will receive an email notification with their reason, and the contract will be marked as Rejected in your dashboard.",
  },
  {
    q: "Where are signed PDFs stored?",
    a: "Signed PDFs are securely stored in Cloudinary's cloud storage and the download URL is saved in our Supabase database. You can download them at any time from your dashboard.",
  },
  {
    q: "Can I add custom fields to a contract?",
    a: "Yes. When creating a contract, you can add custom fields (like payment amount, project name, etc.) that appear on the signing page for the signer to confirm.",
  },
  {
    q: "How do I delete my account or data?",
    a: "Email us at privacy@saathisign.app with your account email and the subject line 'Account Deletion Request'. We will process your request within 30 days. Note: signed contract records may need to be retained for legal compliance.",
  },
];

export function SupportPage() {
  return (
    <div className="min-h-screen bg-[#f4f8fd]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-24 pt-28">

        {/* Hero */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-[#106EBE]/10 text-[#106EBE] mb-4">
            Support Center
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0A1628] tracking-tight mb-4">
            How can we help?
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Find answers to common questions or reach us directly.
            We typically respond within 24 hours.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16"
        >
          {[
            {
              icon: Mail,
              title: "Email Support",
              desc: "For general questions, billing, or account issues.",
              cta: "support@saathisign.app",
              href: "mailto:support@saathisign.app",
              color: "blue",
            },
            {
              icon: Shield,
              title: "Privacy & Data",
              desc: "GDPR requests, data deletion, or privacy concerns.",
              cta: "privacy@saathisign.app",
              href: "mailto:privacy@saathisign.app",
              color: "mint",
            },
            {
              icon: FileText,
              title: "Legal & Terms",
              desc: "Legal questions, contract enforceability, or ToS.",
              cta: "legal@saathisign.app",
              href: "mailto:legal@saathisign.app",
              color: "blue",
            },
          ].map(({ icon: Icon, title, desc, cta, href, color }) => (
            <a
              key={title}
              href={href}
              className="group block p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#106EBE]/20 transition-all duration-300"
            >
              <div className={`w-11 h-11 ${color === "mint" ? "bg-[#0FFCBF]/10" : "bg-[#106EBE]/10"} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-5 h-5 ${color === "mint" ? "text-[#0dcca0]" : "text-[#106EBE]"}`} />
              </div>
              <h3 className="font-semibold text-[#0A1628] mb-1">{title}</h3>
              <p className="text-sm text-slate-500 mb-3">{desc}</p>
              <span className="text-sm font-medium text-[#106EBE] group-hover:underline">{cta}</span>
            </a>
          ))}
        </motion.div>

        {/* Response Time + Hours */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16"
        >
          <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-[#106EBE]/10 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#106EBE]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0A1628] mb-1">Response Time</h3>
              <p className="text-sm text-slate-500">
                We aim to respond within <strong className="text-[#0A1628]">24 hours</strong> on weekdays.
                Complex requests may take up to 72 hours.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-[#0FFCBF]/10 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-[#0dcca0]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0A1628] mb-1">Quick Tips</h3>
              <p className="text-sm text-slate-500">
                For faster help, include your <strong className="text-[#0A1628]">account email</strong> and
                the <strong className="text-[#0A1628]">contract ID</strong> in your message.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="w-5 h-5 text-[#106EBE]" />
            <h2 className="font-display text-2xl font-bold text-[#0A1628]">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }, i) => (
              <motion.div
                key={i}
                initial="hidden" animate="visible" variants={fadeUp} custom={i + 4}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
              >
                <h3 className="font-semibold text-[#0A1628] mb-2">{q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Still stuck CTA */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={12}
          className="mt-12 text-center p-8 bg-gradient-to-br from-[#106EBE] to-[#0d5fa3] rounded-2xl text-white"
        >
          <h3 className="font-display text-2xl font-bold mb-2">Still need help?</h3>
          <p className="text-blue-100 mb-5">
            Our team is ready to assist with any question not covered above.
          </p>
          <a
            href="mailto:support@saathisign.app"
            className="inline-flex items-center gap-2 bg-white text-[#106EBE] font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Us Now
          </a>
        </motion.div>
      </div>
    </div>
  );
}
