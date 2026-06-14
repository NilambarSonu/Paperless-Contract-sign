import {
  CheckCircle2, PenTool, Camera, MapPin, MonitorSmartphone,
  Loader2, RefreshCw, Download, FileText, XCircle, AlertTriangle,
} from "lucide-react";
import { useRoute } from "wouter";
import { useGetSigningPage, useSubmitSignature, getGetSigningPageQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useRef, useEffect, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────
type Phase = "preview" | "signing" | "success" | "rejected_sent";

// ── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="bg-primary p-2 rounded-lg">
        <PenTool className="w-5 h-5 text-white" />
      </div>
      <span className="font-display font-bold text-xl text-white tracking-tight">Saathi Sign</span>
    </div>
  );
}

// ── Rejection Modal ──────────────────────────────────────────────────────────
function RejectionModal({
  token,
  contractTitle,
  signerName,
  onCancel,
  onRejected,
}: {
  token: string;
  contractTitle: string;
  signerName: string;
  onCancel: () => void;
  onRejected: () => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleReject() {
    if (!reason.trim()) {
      toast({ variant: "destructive", title: "Please describe the issue before rejecting" });
      return;
    }
    setSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/sign/${token}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim(), rejectorName: signerName }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Failed to submit rejection");
      }
      onRejected();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not submit rejection",
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,22,40,0.8)" }}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">What needs to be changed?</h2>
        </div>
        <p className="text-sm text-slate-500 mb-5 ml-13">
          Your feedback will be sent directly to the contract author — contract: <strong>{contractTitle}</strong>
        </p>

        <div className="space-y-2 mb-6">
          <Label htmlFor="reject-reason" className="text-sm font-semibold">
            Describe the issue <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The payment terms on page 2 are incorrect. The rate should be $X instead of $Y. Also the termination clause needs revision..."
            rows={5}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ focusRingColor: "#106EBE" } as React.CSSProperties}
            disabled={submitting}
          />
          <p className="text-xs text-slate-400">{reason.length}/2000 characters</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={submitting || !reason.trim()}
            className="flex-1 h-12 font-semibold text-white"
            style={{ background: submitting ? "#ccc" : "#DC2626" }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
            {submitting ? "Sending..." : "Reject & Send Feedback"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function SigningPage() {
  const [, params] = useRoute("/sign/:token");
  const token = params?.token || "";

  const { data: pageData, isLoading, error } = useGetSigningPage(token, {
    query: { enabled: !!token, queryKey: getGetSigningPageQueryKey(token) },
  });
  const submitSignature = useSubmitSignature();
  const { toast } = useToast();

  // ── Phase state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("preview");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Keep a copy of the contract title so success/rejected screens don't
  // depend on pageData (which React Query clears after a 400 refetch)
  const [contractTitle, setContractTitle] = useState("");

  // ── Contract preview ─────────────────────────────────────────────────────
  const [contractRead, setContractRead] = useState(false);

  // ── Signing wizard step ──────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Camera / selfie ──────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [selfieDataUrl, setSelfieDataUrl] = useState("");
  const streamRef = useRef<MediaStream | null>(null);

  // ── Metadata ─────────────────────────────────────────────────────────────
  const [ipAddress, setIpAddress] = useState("");
  const [locationString, setLocationString] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // ── Form state ───────────────────────────────────────────────────────────
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerCompany, setSignerCompany] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ── Signature ────────────────────────────────────────────────────────────
  const sigCanvas = useRef<SignatureCanvas>(null);

  // ── Result ───────────────────────────────────────────────────────────────
  const [signedPdfUrl, setSignedPdfUrl] = useState("");

  // Pre-fill form from pageData and cache title for terminal screens
  useEffect(() => {
    if (pageData) {
      setSignerName(pageData.signerName || "");
      setSignerEmail(pageData.signerEmail || "");
      setSignerCompany(pageData.signerCompany || "");
      setContractTitle(pageData.title || "");
    }
  }, [pageData]);

  // Fetch IP on mount
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d: { ip: string }) => setIpAddress(d.ip))
      .catch(() => setIpAddress("unknown"));
  }, []);

  // ── Camera ───────────────────────────────────────────────────────────────
  const startCamera = useCallback(() => {
    setCameraError(false);
    setCameraReady(false);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      })
      .catch(() => setCameraError(true));
  }, []);

  useEffect(() => {
    if (phase === "signing" && step === 1 && !selfieDataUrl) startCamera();
    return () => {
      if (phase !== "signing" || step !== 1) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      }
    };
  }, [phase, step, selfieDataUrl, startCamera]);

  function captureSelfie() {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setSelfieDataUrl(canvas.toDataURL("image/png"));
    streamRef.current?.getTracks().forEach((t) => t.stop());

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocationString(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => setLocationString("Location not available"),
      );
    }
  }

  function retakeSelfie() {
    setSelfieDataUrl("");
    startCamera();
  }

  // ── Submit signature ─────────────────────────────────────────────────────
  async function handleSign() {
    if (!signerName.trim()) {
      toast({ variant: "destructive", title: "Full name is required" });
      return;
    }
    if (!signerEmail.trim()) {
      toast({ variant: "destructive", title: "Email is required" });
      return;
    }
    if (sigCanvas.current?.isEmpty()) {
      toast({ variant: "destructive", title: "Please draw your signature" });
      return;
    }
    if (!termsAccepted) {
      toast({ variant: "destructive", title: "Please accept the terms to continue" });
      return;
    }

    // Fix: use getCanvas().toDataURL() — avoids the getTrimmedCanvas import bug
    const canvas = sigCanvas.current!.getCanvas();
    const sigDataUrl = canvas.toDataURL("image/png");

    try {
      const result = await submitSignature.mutateAsync({
        token,
        data: {
          signerName: signerName.trim(),
          signerEmail: signerEmail.trim(),
          signerCompany: signerCompany.trim() || undefined,
          signerAddress: signerAddress.trim() || undefined,
          signatureDataUrl: sigDataUrl,
          selfieDataUrl: selfieDataUrl || undefined,
          ipAddress: ipAddress || "unknown",
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          locationString: locationString || undefined,
          deviceInfo: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      });

      if (result.signedPdfUrl) setSignedPdfUrl(result.signedPdfUrl);
      setPhase("success");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? ((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Submission failed")
          : "Something went wrong. Please try again.";
      toast({ variant: "destructive", title: "Submission failed", description: msg });
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  // Success and rejection screens must be checked BEFORE the error guard —
  // React Query refetches after signing and gets 400 "already signed",
  // which would otherwise clobber the success screen.
  // ── Rejection sent ────────────────────────────────────────────────────────
  if (phase === "rejected_sent") {
    return (
      <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6">
        <Logo />
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 text-center space-y-5"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Feedback Sent</h1>
            <p className="text-slate-500 text-base leading-relaxed">
              Your feedback has been sent to the contract author. They will review your comments and send a revised contract.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
            Contract: <strong>{contractTitle}</strong>
          </div>
          <p className="text-slate-400 text-sm">You can close this window.</p>
        </motion.div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (phase === "success") {
    return (
      <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6">
        <Logo />
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 text-center space-y-5"
        >
          <div
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#106EBE22,#0FFCBF22)", border: "2px solid #0FFCBF66" }}
          >
            <CheckCircle2 className="w-12 h-12 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Contract Signed!</h1>
            <p className="text-slate-500 text-base leading-relaxed">
              Your signature has been recorded. A signed copy with your photo, IP address, location, and signature has been emailed to both you and the contract author.
            </p>
          </div>
          {signedPdfUrl && (
            <a href={signedPdfUrl} target="_blank" rel="noopener noreferrer">
              <Button
                className="w-full h-14 text-lg font-bold gap-2"
                style={{ background: "#0FFCBF", color: "#0A1628" }}
              >
                <Download className="w-5 h-5" />
                Download Signed PDF
              </Button>
            </a>
          )}
          <p className="text-slate-400 text-sm">You can close this window.</p>
        </motion.div>
      </div>
    );
  }

  // Error guard — after terminal phases so refetch-400 can't clobber success screen
  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero text-white text-center p-6">
        <div>
          <p className="text-2xl font-bold mb-2">Invalid or expired link</p>
          <p className="text-slate-400">This signing link is no longer valid.</p>
        </div>
      </div>
    );
  }

  // ── CONTRACT PREVIEW ──────────────────────────────────────────────────────
  if (phase === "preview") {
    const isPdf = pageData.originalFileUrl?.toLowerCase().includes(".pdf");

    return (
      <>
        {/* Rejection modal */}
        <AnimatePresence>
          {showRejectModal && (
            <RejectionModal
              token={token}
              contractTitle={pageData.title}
              signerName={pageData.signerName}
              onCancel={() => setShowRejectModal(false)}
              onRejected={() => {
                setShowRejectModal(false);
                setPhase("rejected_sent");
              }}
            />
          )}
        </AnimatePresence>

        <div className="min-h-screen gradient-hero py-10 px-4 flex flex-col items-center">
          <Logo />

          <div className="w-full max-w-4xl space-y-5">
            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />
              <div className="px-8 py-6 border-b">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contract for Review</p>
                <h1 className="text-2xl font-bold text-slate-900">{pageData.title}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Prepared for <strong>{pageData.signerName}</strong> · {pageData.signerEmail}
                </p>
              </div>

              {/* PDF or placeholder */}
              {pageData.originalFileUrl ? (
                isPdf ? (
                  <div className="w-full" style={{ height: "72vh" }}>
                    <iframe
                      src={pageData.originalFileUrl}
                      className="w-full h-full border-0"
                      title="Contract PDF"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 bg-slate-50">
                    <FileText className="w-14 h-14 text-primary/40" />
                    <p className="text-slate-500 text-sm">Preview not available for this file type.</p>
                    <a
                      href={pageData.originalFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary underline underline-offset-2"
                    >
                      Download & Open the Contract File
                    </a>
                    <p className="text-xs text-slate-400">Please read the full contract before proceeding.</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-4 bg-slate-50">
                  <FileText className="w-14 h-14 text-primary/40" />
                  <p className="text-slate-600 font-semibold">{pageData.title}</p>
                  <p className="text-slate-400 text-sm">No file attached — please read any contract details you have received before proceeding.</p>
                </div>
              )}
            </div>

            {/* Bottom action card */}
            <div className="bg-white rounded-2xl shadow-xl px-8 py-7 space-y-5">
              {/* Undertaking checkbox */}
              <div className="flex items-start gap-3 bg-slate-50 rounded-xl px-5 py-4 border border-slate-100">
                <Checkbox
                  id="read-confirm"
                  checked={contractRead}
                  onCheckedChange={(c) => setContractRead(!!c)}
                  className="mt-0.5 flex-shrink-0"
                />
                <label htmlFor="read-confirm" className="text-sm leading-relaxed cursor-pointer text-slate-700">
                  I confirm that I have fully read and understood the entire contract above before choosing to proceed or reject.
                </label>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 h-13 font-semibold gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  style={{ height: "52px" }}
                >
                  <XCircle className="w-4 h-4" />
                  Reject Contract
                </Button>
                <Button
                  onClick={() => setPhase("signing")}
                  disabled={!contractRead}
                  className="flex-1 font-bold gap-2 text-white transition-all"
                  style={{
                    height: "52px",
                    background: contractRead ? "linear-gradient(135deg,#106EBE,#0d5fa3)" : "#D0D5DD",
                    cursor: contractRead ? "pointer" : "not-allowed",
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Proceed to Sign
                </Button>
              </div>
              {!contractRead && (
                <p className="text-center text-xs text-slate-400">
                  Tick the checkbox above to confirm you have read the contract before signing.
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── 3-STEP SIGNING WIZARD ─────────────────────────────────────────────────
  const stepLabels = ["Identity", "Details", "Sign"];

  return (
    <div className="min-h-screen gradient-hero py-10 px-4 flex flex-col items-center">
      <Logo />

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />

        {/* Header */}
        <div className="text-center border-b pb-6 pt-6 px-8">
          <h2 className="font-display text-xl font-bold text-slate-900">{pageData.title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            Signing as <strong>{pageData.signerName}</strong> · {pageData.signerEmail}
          </p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {stepLabels.map((label, i) => {
              const s = i + 1;
              const active = step === s;
              const done = step > s;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                      style={{
                        background: done ? "#0FFCBF" : active ? "#106EBE" : "#F0F4F8",
                        color: done ? "#0A1628" : active ? "#fff" : "#94A3B8",
                      }}
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : s}
                    </div>
                    <span className={`text-xs font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </div>
                  {s < 3 && (
                    <div
                      className="w-16 h-0.5 mb-4 transition-all"
                      style={{ background: step > s ? "#0FFCBF" : "#E8EEF4" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="p-8">
          <AnimatePresence mode="wait">

            {/* STEP 1: Selfie */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold">Identity Verification</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    A photo is taken to verify your identity. It will be embedded in the signed PDF.
                  </p>
                </div>

                <div
                  className="relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-primary/30 bg-muted flex items-center justify-center"
                  style={{ height: "360px" }}
                >
                  {selfieDataUrl ? (
                    <img src={selfieDataUrl} alt="Your selfie" className="w-full h-full object-cover" />
                  ) : cameraError ? (
                    <div className="text-center space-y-3 p-6">
                      <Camera className="w-10 h-10 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Camera access denied or unavailable.</p>
                      <Button variant="outline" size="sm" onClick={startCamera} className="gap-2">
                        <RefreshCw className="w-4 h-4" /> Try Again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      {!cameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      )}
                    </>
                  )}

                  {!selfieDataUrl && cameraReady && !cameraError && (
                    <>
                      <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-accent rounded-tl-sm" />
                      <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-accent rounded-tr-sm" />
                      <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-accent rounded-bl-sm" />
                      <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-accent rounded-br-sm" />
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Location will be recorded
                  </span>
                  <span className="flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground">
                    <MonitorSmartphone className="w-3.5 h-3.5 text-primary" /> Device info captured
                  </span>
                </div>

                {!selfieDataUrl ? (
                  <Button
                    onClick={captureSelfie}
                    disabled={!cameraReady || cameraError}
                    className="w-full h-12 text-base font-semibold gap-2 bg-primary text-white hover:bg-primary/90"
                  >
                    <Camera className="w-5 h-5" /> Capture Photo
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={retakeSelfie} className="flex-1 h-12 gap-2">
                      <RefreshCw className="w-4 h-4" /> Retake
                    </Button>
                    <Button
                      onClick={() => setStep(2)}
                      className="flex-1 h-12 text-base font-semibold bg-primary text-white"
                    >
                      Continue &rarr;
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold">Review Your Details</h3>
                  <p className="text-sm text-muted-foreground mt-1">Confirm or update your information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signer-name">Full Name <span className="text-destructive">*</span></Label>
                    <Input id="signer-name" value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Your full legal name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signer-email">Email <span className="text-destructive">*</span></Label>
                    <Input id="signer-email" type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signer-company">Company <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input id="signer-company" value={signerCompany} onChange={(e) => setSignerCompany(e.target.value)} placeholder="Company name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signer-address">Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input id="signer-address" value={signerAddress} onChange={(e) => setSignerAddress(e.target.value)} placeholder="City, Country" />
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-4">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(c) => setTermsAccepted(!!c)}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I confirm I am signing this contract electronically and understand this is legally binding.
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">&larr; Back</Button>
                  <Button
                    onClick={() => {
                      if (!signerName.trim() || !signerEmail.trim()) {
                        toast({ variant: "destructive", title: "Name and email are required" });
                        return;
                      }
                      if (!termsAccepted) {
                        toast({ variant: "destructive", title: "Please accept the terms" });
                        return;
                      }
                      setStep(3);
                    }}
                    className="flex-1 h-12 text-base font-semibold bg-primary text-white"
                  >
                    Continue to Sign &rarr;
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Signature */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold">Draw Your Signature</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sign in the box below using your mouse, trackpad, or finger.
                  </p>
                </div>

                <div className="rounded-xl overflow-hidden border-2 border-primary/20 bg-white">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="#0A1628"
                    canvasProps={{
                      className: "w-full cursor-crosshair",
                      style: { height: "220px", display: "block" },
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <button
                    type="button"
                    onClick={() => sigCanvas.current?.clear()}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                  >
                    Clear signature
                  </button>
                  <span className="text-muted-foreground text-xs">Draw your full signature</span>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12">&larr; Back</Button>
                  <Button
                    onClick={handleSign}
                    disabled={submitSignature.isPending}
                    className="flex-1 h-12 text-base font-bold gap-2 text-white"
                    style={{ background: "linear-gradient(135deg,#0FFCBF,#0de0aa)", color: "#0A1628" }}
                  >
                    {submitSignature.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      : <><PenTool className="w-4 h-4" /> Sign &amp; Submit</>
                    }
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
