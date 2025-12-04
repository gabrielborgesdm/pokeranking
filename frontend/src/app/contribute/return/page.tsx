import { redirect } from "next/navigation";
import { Heart, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DonationCompleteTracker } from "@/components/donation-complete-tracker";
import { stripe } from "@/lib/stripe";
import { routes } from "@/lib/routes";

interface ReturnPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ReturnPage({ searchParams }: ReturnPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return redirect(routes.contribute);
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.status === "open") {
    return redirect(routes.contribute);
  }

  if (session.status === "complete") {
    const customerEmail = session.customer_details?.email;

    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <DonationCompleteTracker />
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Thank you!</CardTitle>
            <CardDescription>
              Your contribution means a lot to us
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              We appreciate your support! A confirmation email will be sent to{" "}
              <span className="font-medium text-foreground">
                {customerEmail}
              </span>
              .
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <Button asChild variant="outline">
                <a href={routes.contribute}>
                  <Heart className="mr-2 h-4 w-4" />
                  Back to Contribute
                </a>
              </Button>
              <Button asChild>
                <a href={routes.home}>Go to Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return redirect(routes.contribute);
}
