"use client";

import { PokemonAvatar } from "@/components/pokemon-avatar";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectPokemonDialog } from "@/features/pokemon-picker";
import { useAccountForm } from "@/features/users";
import { cn } from "@/lib/utils";
import type { PokemonResponseDto } from "@pokeranking/api-client";
import { ArrowLeft, Check, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AccountPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { form, error, success, isLoading, isLoadingUser, userData, onSubmit } =
    useAccountForm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] =
    useState<PokemonResponseDto | null>(null);

  // Sync selected Pokemon with form value
  useEffect(() => {
    if (selectedPokemon) {
      form.setValue("profilePic", selectedPokemon.image, {
        shouldValidate: true,
      });
    }
  }, [selectedPokemon, form]);

  // Initialize selectedPokemon from user data
  useEffect(() => {
    if (userData?.profilePic) {
      // Create a minimal Pokemon object for the avatar display
      setSelectedPokemon({
        _id: "",
        name: "",
        image: userData.profilePic,
        types: [],
        createdAt: "",
        updatedAt: "",
      });
    }
  }, [userData]);

  const handleAvatarClick = () => {
    setIsDialogOpen(true);
  };

  const handlePokemonSelect = (pokemon: PokemonResponseDto) => {
    setSelectedPokemon(pokemon);
  };

  const hasProfilePicError =
    !!form.formState.errors.profilePic && form.formState.isSubmitted;

  if (isLoadingUser) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Skeleton className="h-32 w-32 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Back button */}
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t("account.title")}</CardTitle>
              <CardDescription>{t("account.description")}</CardDescription>
            </CardHeader>

            {/* Pokemon Avatar Selection Section */}
            <div className="border-b border-border px-6 py-6">
              <div className="flex flex-col items-center gap-3">
                <PokemonAvatar
                  src={selectedPokemon?.image}
                  alt={selectedPokemon?.name}
                  size="lg"
                  onClick={handleAvatarClick}
                  hoverText={t("auth.clickToChange")}
                  hasError={hasProfilePicError}
                />

                <div className="text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      hasProfilePicError
                        ? "text-destructive"
                        : "text-foreground"
                    )}
                  >
                    {selectedPokemon?.name || t("account.changeAvatar")}
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

                  {success && (
                    <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      {t("account.updateSuccess")}
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

                  {/* Username */}
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

                  {/* Change Password Section */}
                  <div className="pt-4 border-border">
                    <h3 className="text-sm font-medium mb-4">
                      {t("account.changePassword")}
                    </h3>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("account.newPassword")}</FormLabel>
                            <FormControl>
                              <PasswordInput
                                placeholder={t("account.newPasswordPlaceholder")}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("account.leaveBlankToKeep")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("auth.confirmPassword")}
                            </FormLabel>
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
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? t("common.saving") : t("account.saveChanges")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

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
