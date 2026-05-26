import { CheckCircle2, PenTool, Camera, MapPin, MonitorSmartphone, Loader2, RefreshCw, Download } from "lucide-react";
import { useRoute } from "wouter";
import { useGetSigningPage, useSubmitSignature, getGetSigningPageQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useRef, useEffect, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export function SigningPage() {
  const [, params] = useRoute("/sign/:token");
  const token = params?.token || "";

  const { data: pageData, isLoading, error } = useGetSigningPage(token, {
    query: { enabled: !!token, queryKey: getGetSigningPageQueryKey(token) },
  });
  const submitSignature = useSubmitSignature();
  const { toast } = useToast();

  const [step, setStep] = useState(1);

  // Camera / selfie
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [selfieDataUrl, setSelfieDataUrl] = useState("");
  const streamRef = useRef<MediaStream | null>(null);

  // Metadata
  const [ipAddress, setIpAddress] = useState("");
  const [locationString, setLocationString] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Form state
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerCompany, setSignerCompany] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Signature
  const sigCanvas = useRef<SignatureCanvas>(null);

  // Result
  const [signedPdfUrl, setSignedPdfUrl] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Pre-fill form from pageData ──────────────────────────────────────────
  useEffect(() => {
    if (pageData) {
      setSignerName(pageData.signerName || "");
      setSignerEmail(pageData.signerEmail || "");
      setSignerCompany(pageData.signerCompany || "");
    }
  }, [pageData]);

  // ── Fetch IP on mount ────────────────────────────────────────────────────
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
    if (step === 1 && !selfieDataUrl) startCamera();
    return () => {
      if (step !== 1) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      }
    };
  }, [step, selfieDataUrl, startCamera]);

  function captureSelfie() {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setSelfieDataUrl(canvas.toDataURL("image/jpeg", 0.85));
    streamRef.current?.getTracks().forEach((t) => t.stop());

    // Grab geolocation right after selfie
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

  // ── Submit ───────────────────────────────────────────────────────────────
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

    const sigDataUrl = sigCanvas.current!.getTrimmedCanvas().toDataURL("image/png");

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
      setSuccess(true);
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

  // ── Success ───────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <div
            className="w-28 h-28 mx-auto rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#106EBE22,#0FFCBF22)", border: "2px solid #0FFCBF66" }}
          >
            <CheckCircle2 className="w-14 h-14 text-accent" />
          </div>
          <div className="text-white">
            <h1 className="font-display text-4xl font-bold mb-3">Contract Signed!</h1>
            <p className="text-slate-300 text-lg">
              Your signature has been recorded. A signed copy has been emailed to both parties.
            </p>
          </div>
          {signedPdfUrl && (
            <a href={signedPdfUrl} target="_blank" rel="noopener noreferrer">
              <Button
                data-testid="button-download-pdf"
                className="w-full h-14 text-lg font-bold gap-2"
                style={{ background: "#0FFCBF", color: "#0A1628" }}
              >
                <Download className="w-5 h-5" />
                Download Signed PDF
              </Button>
            </a>
          )}
          <p className="text-slate-500 text-sm">You can close this window.</p>
        </motion.div>
      </div>
    );
  }

  // ── Step labels ───────────────────────────────────────────────────────────
  const stepLabels = ["Identity", "Details", "Sign"];

  return (
    <div className="min-h-screen gradient-hero py-10 px-4 flex flex-col items-center">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-primary p-2 rounded-lg">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl text-white tracking-tight">Saathi Sign</span>
      </div>

      <Card className="w-full max-w-2xl shadow-2xl border-0 overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />

        <CardHeader className="text-center border-b pb-6 pt-6 px-8">
          <CardTitle className="font-display text-xl">{pageData.title}</CardTitle>
          <CardDescription className="mt-1">
            Prepared for <strong>{pageData.signerName}</strong> · {pageData.signerEmail}
          </CardDescription>

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
                        background: done ? "#0FFCBF" : active ? "#106EBE" : undefined,
                        color: done || active ? (done ? "#0A1628" : "#fff") : undefined,
                      }}
                      data-active={active}
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
        </CardHeader>

        <CardContent className="p-8">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Selfie ── */}
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

                {/* Camera / selfie — large box */}
                <div
                  className="relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-primary/30 bg-muted flex items-center justify-center"
                  style={{ height: "360px" }}
                >
                  {selfieDataUrl ? (
                    <img
                      src={selfieDataUrl}
                      alt="Your selfie"
                      className="w-full h-full object-cover"
                    />
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
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {!cameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      )}
                    </>
                  )}

                  {/* Overlay corner guides */}
                  {!selfieDataUrl && cameraReady && !cameraError && (
                    <>
                      <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-accent rounded-tl-sm" />
                      <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-accent rounded-tr-sm" />
                      <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-accent rounded-bl-sm" />
                      <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-accent rounded-br-sm" />
                    </>
                  )}
                </div>

                {/* Metadata pills */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Location will be recorded
                  </span>
                  <span className="flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground">
                    <MonitorSmartphone className="w-3.5 h-3.5 text-primary" /> Device info captured
                  </span>
                </div>

                {/* Buttons */}
                {!selfieDataUrl ? (
                  <Button
                    data-testid="button-capture-selfie"
                    onClick={captureSelfie}
                    disabled={!cameraReady || cameraError}
                    className="w-full h-12 text-base font-semibold gap-2 bg-primary text-white hover:bg-primary/90"
                  >
                    <Camera className="w-5 h-5" />
                    Capture Photo
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      data-testid="button-retake"
                      variant="outline"
                      onClick={retakeSelfie}
                      className="flex-1 h-12 gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Retake
                    </Button>
                    <Button
                      data-testid="button-step1-continue"
                      onClick={() => setStep(2)}
                      className="flex-1 h-12 text-base font-semibold bg-primary text-white"
                    >
                      Continue &rarr;
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 2: Details ── */}
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
                    <Input
                      id="signer-name"
                      data-testid="input-signer-name"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Your full legal name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signer-email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="signer-email"
                      data-testid="input-signer-email"
                      type="email"
                      value={signerEmail}
                      onChange={(e) => setSignerEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signer-company">Company <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="signer-company"
                      data-testid="input-signer-company"
                      value={signerCompany}
                      onChange={(e) => setSignerCompany(e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signer-address">Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="signer-address"
                      data-testid="input-signer-address"
                      value={signerAddress}
                      onChange={(e) => setSignerAddress(e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-start gap-3 bg-muted/40 rounded-xl p-4">
                  <Checkbox
                    id="terms"
                    data-testid="checkbox-terms"
                    checked={termsAccepted}
                    onCheckedChange={(c) => setTermsAccepted(!!c)}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I confirm I have read and fully understood the contract above, and I agree to sign it electronically.
                    I understand this is legally binding.
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    data-testid="button-step2-back"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12"
                  >
                    &larr; Back
                  </Button>
                  <Button
                    data-testid="button-step2-continue"
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

            {/* ── STEP 3: Signature ── */}
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

                {/* Signature pad */}
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
                    data-testid="button-clear-signature"
                    type="button"
                    onClick={() => sigCanvas.current?.clear()}
                    className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                  >
                    Clear signature
                  </button>
                  <span className="text-muted-foreground text-xs">Draw your full signature</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    data-testid="button-step3-back"
                    onClick={() => setStep(2)}
                    className="flex-1 h-12"
                    disabled={submitSignature.isPending}
                  >
                    &larr; Back
                  </Button>
                  <Button
                    data-testid="button-sign-submit"
                    onClick={handleSign}
                    disabled={submitSignature.isPending}
                    className="flex-1 h-12 text-base font-bold gap-2"
                    style={{ background: "#0FFCBF", color: "#0A1628" }}
                  >
                    {submitSignature.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating PDF…
                      </>
                    ) : (
                      "Sign & Submit"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </CardContent>
      </Card>

      <p className="text-slate-600 text-xs mt-8 text-center max-w-md">
        Your signature, photo, IP address, and location are recorded as part of the legal audit trail.
        This document is legally binding.
      </p>
    </div>
  );
}
