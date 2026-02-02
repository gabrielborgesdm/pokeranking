"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function LayoutShowcase() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-semibold">Layout Components</h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Progress</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">HP: 75/100</p>
              <Progress value={75} className="h-3" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">EXP: 45/100</p>
              <Progress
                value={45}
                className="h-2 bg-muted [&>div]:bg-pokemon-blue"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sheet (Side Panel)</h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Pokemon Details</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Pokemon Details</SheetTitle>
                <SheetDescription>
                  View detailed information about your selected Pokemon.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <p className="text-muted-foreground">
                  Pokemon details would appear here with stats, moves,
                  abilities, and more.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Accordion</h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Base Stats</AccordionTrigger>
              <AccordionContent>
                HP: 35 | Attack: 55 | Defense: 40 | Sp. Atk: 50 | Sp. Def: 50 |
                Speed: 90
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Moves</AccordionTrigger>
              <AccordionContent>
                Thunder Shock, Quick Attack, Thunderbolt, Iron Tail
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Evolution</AccordionTrigger>
              <AccordionContent>
                Pichu → Pikachu (Friendship) → Raichu (Thunder Stone)
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Collapsible</h3>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Pokemon Abilities
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-4 border rounded-lg">
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>Static:</strong> May cause paralysis on contact.
                </li>
                <li>
                  <strong>Lightning Rod (Hidden):</strong> Draws in Electric
                  moves.
                </li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </section>
  );
}
