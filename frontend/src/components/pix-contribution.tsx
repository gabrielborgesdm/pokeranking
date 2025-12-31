"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as QRCode from "qrcode";
import { Check, Copy, QrCode, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface PixContributionProps {
  pixCode: string;
}

export function PixContribution({ pixCode }: PixContributionProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(pixCode, {
      width: 180,
      margin: 0,
      errorCorrectionLevel: "M",
    }).then(setQrDataUrl);
  }, [pixCode]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-green-500" />
                <CardTitle>{t("contribute.pix.title")}</CardTitle>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </div>
            <CardDescription>{t("contribute.pix.description")}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {/* QR Code */}
              <div className="rounded-xl bg-white p-4 my-8">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Pix QR Code"
                    width={180}
                    height={180}
                  />
                )}
              </div>

              {/* Pix Key */}
              <div className="w-full max-w-md space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t("contribute.pix.pixKey")}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 overflow-hidden rounded-md border bg-muted/50 p-2">
                    <code className="block truncate text-xs text-muted-foreground">
                      {pixCode}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className={cn(
                      "shrink-0 transition-colors",
                      copied && "bg-green-500/10 border-green-500 text-green-500"
                    )}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
