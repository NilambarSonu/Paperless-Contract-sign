import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateContract, useGenerateSigningLink } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Loader2, Upload, FileText, Copy, Check, ExternalLink,
  Mail, ArrowLeft, Link2, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  signerName: z.string().min(1, "Signer name is required"),
  signerEmail: z.string().email("Invalid email"),
  signerCompany: z.string().optional(),
  expiresInDays: z.coerce.number().min(1).max(90).default(7),
});

type FormValues = z.infer<typeof formSchema>;

export function NewContractPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createContract = useCreateContract();
  const generateLink = useGenerateSigningLink();

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success state
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      signerName: "",
      signerEmail: "",
      signerCompany: "",
      expiresInDays: 7,
    },
  });

  // ── File picker ──────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0] ?? null;
    if (!chosen) return;

    const ext = chosen.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "doc"].includes(ext ?? "")) {
      toast({ variant: "destructive", title: "Unsupported file", description: "Only PDF and DOCX files are allowed." });
      return;
    }
    setFile(chosen);
    setUploadedFileUrl(null);
  }

  function removeFile() {
    setFile(null);
    setUploadedFileUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadFile(f: File): Promise<string | null> {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/contracts/upload-file`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json() as { fileUrl: string };
      setUploadedFileUrl(data.fileUrl);
      return data.fileUrl;
    } catch {
      toast({ variant: "destructive", title: "Upload failed", description: "Could not upload the file. Please try again." });
      return null;
    } finally {
      setUploading(false);
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function onSubmit(values: FormValues) {
    let fileUrl = uploadedFileUrl;

    // Upload file if chosen but not yet uploaded
    if (file && !fileUrl) {
      fileUrl = await uploadFile(file);
      if (!fileUrl) return; // upload failed, stop
    }

    try {
      const contract = await createContract.mutateAsync({
        data: {
          ...values,
          originalFileUrl: fileUrl ?? undefined,
        },
      });

      const linkResult = await generateLink.mutateAsync({
        id: contract.id,
        data: { expiresInDays: values.expiresInDays },
      });

      setSigningUrl(linkResult.signingUrl);
      setEmailSent(true); // email is attempted server-side
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to create contract. Please try again." });
    }
  }

  // ── Copy link ─────────────────────────────────────────────────────────────
  async function copyLink() {
    if (!signingUrl) return;
    await navigator.clipboard.writeText(signingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // ── Success Screen ────────────────────────────────────────────────────────
  if (signingUrl) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />

              <CardContent className="pt-10 pb-10 px-8 text-center space-y-6">
                {/* Check icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
                  className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #106EBE22, #0FFCBF22)", border: "2px solid #0FFCBF66" }}
                >
                  <Check className="w-10 h-10 text-accent" strokeWidth={2.5} />
                </motion.div>

                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">Contract Created!</h2>
                  <p className="text-muted-foreground text-sm">
                    Your shareable signing link is ready. Share it with your client to collect their signature.
                  </p>
                </div>

                {/* Email status */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>
                    {emailSent
                      ? `Signing invitation sent to ${form.getValues("signerEmail")}`
                      : "Configure SMTP in settings to auto-email the signer"}
                  </span>
                </div>

                {/* Link box */}
                <div className="rounded-xl border border-primary/20 bg-muted/40 p-4 text-left space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                    <Link2 className="w-3.5 h-3.5" />
                    Signing Link
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      data-testid="text-signing-url"
                      className="flex-1 text-xs text-foreground font-mono break-all bg-background rounded-lg px-3 py-2 border border-border select-all"
                    >
                      {signingUrl}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-testid="button-copy-link"
                      onClick={copyLink}
                      className="flex-1 gap-2 font-semibold"
                      style={{ background: copied ? "#0FFCBF" : "#106EBE", color: copied ? "#0A1628" : "#fff" }}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </Button>
                    <Button
                      data-testid="button-open-link"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => window.open(signingUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Link
                    </Button>
                  </div>
                </div>

                {/* Tip */}
                <p className="text-xs text-muted-foreground">
                  Send this link via WhatsApp, email, or any messaging app. No account required for your client to sign.
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      setSigningUrl(null);
                      setEmailSent(false);
                      setFile(null);
                      setUploadedFileUrl(null);
                      form.reset();
                    }}
                  >
                    Create Another
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-primary text-white"
                    onClick={() => setLocation("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  const isSubmitting = createContract.isPending || generateLink.isPending || uploading;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            data-testid="button-back"
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-2xl">New Contract</CardTitle>
            <CardDescription>Upload your contract file and enter the signer's details to generate a secure signing link.</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* ── File Upload ── */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Contract File (PDF or DOCX)</p>

                  {!file ? (
                    <label
                      data-testid="input-file-upload"
                      htmlFor="contract-file"
                      className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-muted/30 p-8 cursor-pointer hover:border-primary/60 hover:bg-muted/50 transition-all group"
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ background: "linear-gradient(135deg,#106EBE18,#0FFCBF10)" }}
                      >
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">Click to upload your contract</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX or DOC — up to 20 MB</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        id="contract-file"
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      {uploadedFileUrl && (
                        <span className="text-xs text-accent font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Uploaded
                        </span>
                      )}
                      <button
                        type="button"
                        data-testid="button-remove-file"
                        onClick={removeFile}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Title ── */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Title</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-title"
                          placeholder="e.g. Web Development Agreement — Phase 1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Signer Name + Email ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="signerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signer Full Name</FormLabel>
                        <FormControl>
                          <Input data-testid="input-signer-name" placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="signerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signer Email</FormLabel>
                        <FormControl>
                          <Input data-testid="input-signer-email" type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── Company + Expires ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="signerCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signer Company <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl>
                          <Input data-testid="input-signer-company" placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiresInDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Expires In (Days)</FormLabel>
                        <FormControl>
                          <Input data-testid="input-expires" type="number" min={1} max={90} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── Info notice ── */}
                <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-primary">What happens next: </span>
                  A secure signing link is generated. If SMTP is configured, an invitation email is automatically sent to the signer. The link captures their selfie, location, IP, and digital signature — all embedded in the final PDF.
                </div>

                {/* ── Buttons ── */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="button-cancel"
                    onClick={() => setLocation("/dashboard")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    data-testid="button-create-contract"
                    disabled={isSubmitting}
                    className="gap-2 bg-primary text-white hover:bg-primary/90 min-w-[180px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {uploading ? "Uploading file…" : "Creating contract…"}
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        Create &amp; Generate Link
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
