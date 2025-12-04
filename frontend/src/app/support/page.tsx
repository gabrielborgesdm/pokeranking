"use client";

import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSupportForm } from "@/hooks/use-support-form";

export default function SupportPage() {
  const { t } = useTranslation();
  const { form, error, isLoading, onSubmit } = useSupportForm();

  const messageValue = form.watch("message");
  const characterCount = messageValue?.length || 0;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t("support.title")}</h1>
            <p className="text-muted-foreground">{t("support.description")}</p>
          </div>
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
