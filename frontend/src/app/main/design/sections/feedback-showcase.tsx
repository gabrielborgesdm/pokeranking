"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AlertCircle, Info } from "lucide-react";

export function FeedbackShowcase() {
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">Feedback Components</h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Alerts</h3>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Pokemon Tip</AlertTitle>
              <AlertDescription>
                Fire types are weak against Water moves!
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wild Pokemon Appeared!</AlertTitle>
              <AlertDescription>
                A wild Gengar blocks your path!
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Dialogs</h3>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>View Pokemon</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pikachu #025</DialogTitle>
                  <DialogDescription>
                    Electric type Pokemon. Known for its electric cheeks and
                    lightning bolt shaped tail.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Release Pokemon</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Release Pokemon?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to release this Pokemon? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Release</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Toast Notifications</h3>
          <div className="flex gap-4">
            <Button
              onClick={() => toast.success("Pokemon caught successfully!")}
            >
              Success Toast
            </Button>
            <Button
              variant="destructive"
              onClick={() => toast.error("Pokemon fled!")}
            >
              Error Toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast("Your Pokemon leveled up!", {
                  description: "Pikachu is now level 25!",
                })
              }
            >
              Info Toast
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
