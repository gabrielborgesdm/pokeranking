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
import { useSignUp } from "@/features/auth";

export default function SignUpPage() {
  const { t } = useTranslation();
  const { form, error, isLoading, onSubmit } = useSignUp();

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{t("auth.signUp")}</CardTitle>
        <CardDescription>{t("auth.signUpDescription")}</CardDescription>
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.username")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("auth.usernamePlaceholder")}
                      {...field}
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
                    <Input
                      type="password"
                      placeholder={t("auth.passwordPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("auth.signingUp") : t("auth.signUp")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
          <Link href="/signin" className="link">
            {t("auth.signIn")}
          </Link>
        </p>
        <Link href="/signin" className="link text-sm">
          {t("auth.backToSignIn")}
        </Link>
      </CardFooter>
    </Card>
  );
}
