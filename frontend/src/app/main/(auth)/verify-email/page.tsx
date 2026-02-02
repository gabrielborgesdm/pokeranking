"use client";

import Link from "next/link";
import { Suspense } from "react";
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
import { useVerifyEmail } from "@/features/auth";

function VerifyEmailForm() {
  const { t } = useTranslation();
  const {
    form,
    email,
    error,
    resendSuccess,
    isLoading,
    isResending,
    onSubmit,
    onResend,
  } = useVerifyEmail();

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{t("auth.verifyEmail")}</CardTitle>
        <CardDescription>
          {t("auth.verifyEmailDescription", { email })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {resendSuccess && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                {t("auth.codeSent")}
              </div>
            )}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.verificationCode")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("auth.codePlaceholder")}
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("auth.verifying") : t("auth.verify")}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={onResend}
            disabled={isResending}
            className="text-sm"
          >
            {isResending ? t("auth.sendingCode") : t("auth.resendCode")}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/signin" className="link text-sm">
          {t("auth.backToSignIn")}
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
