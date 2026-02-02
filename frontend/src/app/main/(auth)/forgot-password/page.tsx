"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForgotPassword } from "@/features/auth";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { form, error, success, isLoading, onSubmit } = useForgotPassword();

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{t("auth.forgotPassword")}</CardTitle>
        <CardDescription>{t("auth.forgotPasswordDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            {t("auth.resetEmailSent")}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("auth.emailPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("auth.sending") : t("auth.sendResetLink")}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/signin" className="link text-sm">
          {t("auth.backToSignIn")}
        </Link>
      </CardFooter>
    </Card>
  );
}
