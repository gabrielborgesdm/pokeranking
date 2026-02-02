"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
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
import { useSignIn } from "@/features/auth";

export default function SignInPage() {
  const { t } = useTranslation();
  const { form, error, isLoading, onSubmit } = useSignIn();

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{t("auth.signIn")}</CardTitle>
        <CardDescription>{t("auth.signInDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
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
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.password")}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={t("auth.passwordPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-right">
              <Link href="/forgot-password" className="link text-sm">
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link href="/signup" className="link">
            {t("auth.signUp")}
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="link">
            {t("auth.goToHomepage")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
