import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  businessName: z.string().min(1, "Business Name is required"),
  businessEmail: z.string().email("Invalid email"),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankSwift: z.string().optional(),
});

export function SettingsPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      bankName: "",
      bankAccount: "",
      bankIfsc: "",
      bankSwift: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        businessName: settings.businessName || "",
        businessEmail: settings.businessEmail || "",
        businessPhone: settings.businessPhone || "",
        businessAddress: settings.businessAddress || "",
        bankName: settings.bankName || "",
        bankAccount: settings.bankAccount || "",
        bankIfsc: settings.bankIfsc || "",
        bankSwift: settings.bankSwift || "",
      });
    }
  }, [settings, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateSettings.mutateAsync({ data: values });
      toast({
        title: "Settings updated",
        description: "Your business and payment details have been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings.",
      });
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your business profile and payment instructions.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Business Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Details that appear on your contracts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business/Freelancer Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Bank information for international transfers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number / IBAN</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bankSwift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SWIFT / BIC Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateSettings.isPending} className="bg-primary hover:bg-primary/90 text-white">
                {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
