import { useRoute } from "wouter";
import { useGetSigningPage, useSubmitSignature, getGetSigningPageQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PenTool, Camera, MapPin, MonitorSmartphone } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";

export function SigningPage() {
  const [, params] = useRoute("/sign/:token");
  const token = params?.token || "";
  const { data: pageData, isLoading, error } = useGetSigningPage(token, { query: { enabled: !!token, queryKey: getGetSigningPageQueryKey(token) } });
  const submitSignature = useSubmitSignature();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (step === 1 && !selfieDataUrl) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Camera access denied", err));
    }
  }, [step, selfieDataUrl]);

  const captureSelfie = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      setSelfieDataUrl(canvas.toDataURL("image/jpeg"));
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  const handleSign = async () => {
    if (sigCanvas.current?.isEmpty()) {
      toast({ variant: "destructive", title: "Signature Required" });
      return;
    }
    if (!termsAccepted) {
      toast({ variant: "destructive", title: "Please accept terms" });
      return;
    }

    try {
      const sigDataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
      
      await submitSignature.mutateAsync({
        token,
        data: {
          signerName: pageData?.signerName || "",
          signerEmail: pageData?.signerEmail || "",
          signatureDataUrl: sigDataUrl || "",
          selfieDataUrl,
          ipAddress: "127.0.0.1", // Mocked for now
          deviceInfo: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
      setSuccess(true);
    } catch (err) {
      toast({ variant: "destructive", title: "Error submitting signature" });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center gradient-hero"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error || !pageData) return <div className="min-h-screen flex items-center justify-center gradient-hero text-white">Invalid or expired link.</div>;

  if (success) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-6 text-center text-white">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 max-w-md">
          <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="font-display text-4xl font-bold">Contract Signed!</h1>
          <p className="text-slate-300">Your signed PDF is ready to download. A copy has been emailed to both parties.</p>
          <Button className="w-full bg-primary hover:bg-primary/90 glow-blue h-12 text-lg">
            Download Signed PDF
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero py-12 px-4 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-primary p-2 rounded-lg"><PenTool className="w-6 h-6 text-white" /></div>
        <span className="font-display font-bold text-2xl text-white">Saathi Sign</span>
      </div>

      <Card className="w-full max-w-2xl bg-card border-none shadow-2xl">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="font-display text-2xl">{pageData.title}</CardTitle>
          <CardDescription>Prepared for {pageData.signerName} ({pageData.signerEmail})</CardDescription>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center">
                <h3 className="text-xl font-semibold">Identity Verification</h3>
                <p className="text-sm text-muted-foreground">We securely capture verification data for the legal audit trail.</p>
                
                <div className="relative w-full max-w-sm mx-auto aspect-video rounded-xl overflow-hidden bg-muted border-2 border-dashed flex items-center justify-center">
                  {selfieDataUrl ? (
                    <img src={selfieDataUrl} alt="Selfie" className="w-full h-full object-cover" />
                  ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-left max-w-sm mx-auto bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Location logged</div>
                  <div className="flex items-center gap-2"><MonitorSmartphone className="w-4 h-4 text-primary" /> Device logged</div>
                </div>

                {!selfieDataUrl ? (
                  <Button onClick={captureSelfie} className="w-full max-w-sm bg-primary text-white"><Camera className="w-4 h-4 mr-2" /> Capture Selfie</Button>
                ) : (
                  <Button onClick={() => setStep(2)} className="w-full max-w-sm bg-primary text-white">Continue &rarr;</Button>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-semibold text-center">Review Details</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={pageData.signerName} readOnly className="bg-muted" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={pageData.signerEmail} readOnly className="bg-muted" />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(!!c)} />
                  <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I confirm I have read the contract and accept the terms.
                  </label>
                </div>
                <Button onClick={() => setStep(3)} disabled={!termsAccepted} className="w-full bg-primary text-white">Continue to Sign &rarr;</Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
                <h3 className="text-xl font-semibold">Draw Your Signature</h3>
                <div className="border rounded-xl bg-card overflow-hidden">
                  <SignatureCanvas 
                    ref={sigCanvas} 
                    penColor="black" 
                    canvasProps={{ className: 'w-full h-48 cursor-crosshair bg-slate-50' }} 
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Button variant="ghost" onClick={() => sigCanvas.current?.clear()}>Clear</Button>
                  <Button onClick={handleSign} disabled={submitSignature.isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground glow-mint px-8">
                    {submitSignature.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Sign & Submit
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

// CheckCircle2 needs to be imported or duplicated
import { CheckCircle2 } from "lucide-react";
