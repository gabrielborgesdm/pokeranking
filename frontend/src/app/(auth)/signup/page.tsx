"use client";

import { useState, useEffect } from "react";
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
import { PokemonAvatar } from "@/components/pokemon-avatar";
import { useSignUp } from "@/features/auth";
import { SelectPokemonDialog } from "@/features/pokemon-picker";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const { t } = useTranslation();
  const { form, error, isLoading, onSubmit } = useSignUp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonResponseDto | null>(null);

  // Sync selected Pokemon with form
  useEffect(() => {
    if (selectedPokemon) {
      form.setValue("profilePic", selectedPokemon.image, { shouldValidate: true });
    }
  }, [selectedPokemon, form]);

  const handleAvatarClick = () => {
    setIsDialogOpen(true);
  };

  const handlePokemonSelect = (pokemon: PokemonResponseDto) => {
    setSelectedPokemon(pokemon);
  };

  const hasProfilePicError = !!form.formState.errors.profilePic && form.formState.isSubmitted;

  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{t("auth.signUp")}</CardTitle>
          <CardDescription>{t("auth.signUpDescription")}</CardDescription>
        </CardHeader>

        {/* Pokemon Avatar Selection Section */}
        <div className="border-b border-border px-6 py-6">
          <div className="flex flex-col items-center gap-3">
            <PokemonAvatar
              pokemon={selectedPokemon}
              size="lg"
              onClick={handleAvatarClick}
              hoverText={t("auth.clickToChange")}
              hasError={hasProfilePicError}
            />

            <div className="text-center">
              <p className={cn(
                "text-sm font-medium",
                hasProfilePicError ? "text-destructive" : "text-foreground"
              )}>
                {selectedPokemon ? selectedPokemon.name : t("auth.chooseAvatar")}
              </p>
              {hasProfilePicError && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.profilePic?.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Hidden field for profilePic validation */}
              <FormField
                control={form.control}
                name="profilePic"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                      <PasswordInput
                        placeholder={t("auth.passwordPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={t("auth.confirmPasswordPlaceholder")}
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
          <Link href="/" className="link text-sm">
            {t("auth.backToHomepage")}
          </Link>
        </CardFooter>
      </Card>

      {/* Pokemon Selection Dialog */}
      <SelectPokemonDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedPokemon={selectedPokemon}
        onSelect={handlePokemonSelect}
      />
    </>
  );
}
