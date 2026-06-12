import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Wallet, ExternalLink, AlertTriangle, Link } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GiftCards() {
  const [activeTab, setActiveTab] = useState("purchase");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-gift-cards-title">Gift Cards</h1>
        <p className="text-muted-foreground mt-1">
          Purchase gift cards for friends or check your existing balance
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-orange-400">
          This page is currently under active development and may not work as expected. As per Our <Link href="/policies/legal/terms" className="underline">Terms of Service</Link> and <Link href="/policies/legal/refunds" className="underline">Refund Policy</Link>, We are not responsible for any issues that may arise from using this feature and access to the Services is provided on an "as is" "as available" basis and We reserve the right to modify or discontinue this feature at any time without notice.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="purchase" className="gap-2" data-testid="tab-gift-purchase">
            <Gift className="w-4 h-4" />
            Purchase
          </TabsTrigger>
          <TabsTrigger value="balance" className="gap-2" data-testid="tab-gift-balance">
            <Wallet className="w-4 h-4" />
            Check Balance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Purchase a Gift Card
                </CardTitle>
                <CardDescription>
                  Give the gift of RIVET Studios to a friend or family member
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://app.cardivo.com/giftcards/rivetstudios"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-gift-purchase-external"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in new tab
                </a>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <iframe
                src="https://app.cardivo.com/giftcards/rivetstudios"
                className="w-full border-0 rounded-b-xl"
                style={{ minHeight: "700px" }}
                title="Purchase RIVET Studios Gift Card"
                allow="payment"
                data-testid="iframe-gift-purchase"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Check Gift Card Balance
                </CardTitle>
                <CardDescription>
                  Enter your gift card code to check your remaining balance
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://app.cardivo.com/balance/rivetstudios"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-gift-balance-external"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in new tab
                </a>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <iframe
                src="https://app.cardivo.com/balance/rivetstudios"
                className="w-full border-0 rounded-b-xl"
                style={{ minHeight: "500px" }}
                title="Check RIVET Studios Gift Card Balance"
                data-testid="iframe-gift-balance"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
