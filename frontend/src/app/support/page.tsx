"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useSupportForm } from "@/features/support";
import { useAnalytics } from "@/hooks/use-analytics";
import { routes } from "@/lib/routes";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function SupportPage() {
  const { t } = useTranslation();
  const { form, error, isLoading, onSubmit } = useSupportForm();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("support", "Support");
  }, [trackPageView]);

  const messageValue = form.watch("message");
  const characterCount = messageValue?.length || 0;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <PageHeader
            title={t("support.title")}
            description={t("support.description")}
            backHref={routes.home}
          />

        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("support.messageLabel")}</CardTitle>
            <CardDescription>
              {t("support.characterCount", { count: characterCount })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={t("support.messagePlaceholder")}
                          className="min-h-[150px] resize-none"
                          maxLength={2000}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? t("support.submitting") : t("support.submit")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
