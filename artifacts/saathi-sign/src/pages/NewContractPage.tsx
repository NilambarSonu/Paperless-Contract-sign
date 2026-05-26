import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateContract, useGenerateSigningLink } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  signerName: z.string().min(1, "Signer name is required"),
  signerEmail: z.string().email("Invalid email"),
  signerCompany: z.string().optional(),
  expiresInDays: z.coerce.number().min(1).default(7),
});

export function NewContractPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createContract = useCreateContract();
  const generateLink = useGenerateSigningLink();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      signerName: "",
      signerEmail: "",
      signerCompany: "",
      expiresInDays: 7,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const contract = await createContract.mutateAsync({ data: values });
      const linkResult = await generateLink.mutateAsync({ id: contract.id, data: { expiresInDays: values.expiresInDays } });
      
      toast({
        title: "Contract created!",
        description: "Signing link generated successfully.",
      });
      // In a real app, we might show a dialog with the link, but let's go back to dashboard for now
      setLocation("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create contract.",
      });
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">New Contract</CardTitle>
            <CardDescription>Prepare a new contract for signing.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Master Services Agreement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="signerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signer Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="signerCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signer Company (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
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
                        <FormLabel>Expires In (Days)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setLocation("/dashboard")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createContract.isPending} className="bg-primary hover:bg-primary/90 text-white">
                    {createContract.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create & Generate Link
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
