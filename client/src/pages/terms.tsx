import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Zap, Scale } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Scale className="w-3.5 h-3.5" />
          Legal Agreement
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Terms and Conditions
        </h1>
        <p className="text-lg text-muted-foreground">
          Please read these terms carefully before using our services
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Last Updated: January 8, 2026
        </p>
      </div>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive mt-1 shrink-0" />
            <div>
              <p className="font-semibold mb-2 text-destructive">
                Binding Legal Agreement
              </p>
              <p className="text-muted-foreground text-sm">
                By creating an account, accessing, or using Rivet Studios
                services in any manner, you affirm that you have read,
                understood, and unconditionally agree to be legally bound by all
                terms and conditions contained herein. If you do not agree, you
                are prohibited from using these services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Your Relationship */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">
            1. Your Relationship With Us
          </h2>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">The Services</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Welcome to Rivet Studios. The Services are intended for your
              personal, non-commercial entertainment. We may change, modify,
              update, suspend, or discontinue features at any time, without
              notice and without liability.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Equipment and Costs</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You are solely responsible for providing all equipment, software,
              and internet access necessary to use the Services. You are
              responsible for all fees charged by third parties (ISP, mobile
              carriers, etc.) in connection with your use.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Access to the Services is not guaranteed to be continuous or
              uninterrupted. Services may be unavailable for maintenance or
              reasons beyond our reasonable control. We will have no liability
              for any inability to access the Services.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: Your Account */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          2. Your Account With Us
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Account Creation and Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>By creating an account, you represent and warrant that:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All information you submit is truthful and accurate</li>
                <li>You are at least 13 years of age</li>
                <li>Your use does not violate any applicable law</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Security</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You are responsible for maintaining password confidentiality. You
              are prohibited from sharing, selling, or transferring your
              account. You are solely responsible for all activities under your
              account and must notify us immediately of any unauthorized use.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Account Suspension and Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>By Operator (For Cause):</strong> We may suspend or
                terminate your account without notice if we determine you have
                breached this Agreement or engaged in prohibited conduct.
              </p>
              <p>
                <strong>By Operator (For Convenience):</strong> We may terminate
                your account for any reason. You will receive a prorated refund
                for unused subscription fees.
              </p>
              <p>
                <strong>By You:</strong> You may terminate your account anytime.
                Termination will not entitle you to refunds.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: License & IP */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          3. End User License & Intellectual Property
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ownership</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All content, software, images, text, graphics, logos, trademarks,
              and intellectual property rights are owned or licensed by Resync
              Studios. Use of any content not expressly permitted by this
              Agreement is strictly prohibited.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Limited License</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              The Services are licensed, not sold. Subject to compliance with
              this Agreement, we grant you a limited, non-exclusive,
              non-transferable license to use the software for personal,
              non-commercial entertainment purposes only.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">License Restrictions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>You shall not:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                <li>Use the Services for commercial purposes</li>
                <li>
                  Reverse-engineer, decompile, or disassemble the software
                </li>
                <li>
                  Use unauthorized third-party software (cheats, bots, hacks,
                  mods)
                </li>
                <li>Scrape, collect, or mine data from the Services</li>
                <li>Remove or alter copyright or proprietary notices</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 4: Virtual Goods */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          4. Virtual Goods & Game Economy
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Nature of Virtual Goods
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Virtual Goods have no real-world monetary value, are not personal
              property, and cannot be redeemed for real money. Price and
              availability are subject to change without notice.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Limited License to Virtual Goods
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Your purchase grants only a limited, non-transferable, personal,
              revocable license to use Virtual Goods within the Services. You
              have no ownership or property interest. This license terminates
              upon account termination.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Prohibition on Unsanctioned Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Any attempt to sell, trade, gift, or transfer Virtual Goods
              outside official mechanisms is prohibited and may result in
              account termination.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Operator's Right to Manage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We reserve the right to manage, regulate, modify, re-price, or
              eliminate any Virtual Goods at any time without notice or
              liability.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 5: User Content */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          5. User-Generated Content & Feedback
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Responsibility for Your Content
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You are solely responsible for any content you create or upload.
              You represent and warrant that your content does not infringe
              third-party rights, is not illegal, and does not violate our Code
              of Conduct.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                License Grant to Rivet Studios
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              By submitting content, you grant us a perpetual, irrevocable,
              worldwide, royalty-free license to use, reproduce, modify, and
              commercially exploit your content in any media without
              compensation. This license survives account termination.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Feedback</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Any suggestions, ideas, or feedback you provide becomes our sole
              and exclusive property.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 6: Financial Terms */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          6. Financial Terms & Subscriptions
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Authorization</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You authorize us and our payment processors to charge your payment
              method for all fees you incur. You are responsible for all charges
              under your account.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Subscriptions and Auto-Renewal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              If you purchase a recurring subscription, you authorize us to
              charge your payment method automatically at the start of each
              billing period. YOUR SUBSCRIPTION WILL AUTOMATICALLY RENEW until
              you cancel. You may cancel anytime through your account settings.
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              ALL PAYMENTS ARE FINAL AND NON-REFUNDABLE, except as expressly
              provided in this Agreement or required by law. No refunds for
              dissatisfaction, accidental purchases, or account termination for
              cause.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Improper Chargebacks</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not initiate chargebacks except for legitimate fraud. Improper
              chargebacks are a material breach. You agree to pay liquidated
              damages of $250 AUD per improper chargeback.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Taxes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You are responsible for all applicable sales, use, or other
              governmental taxes associated with your purchases.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 7: Code of Conduct */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          7. Code of Conduct & Enforcement
        </h2>

        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p>
              Your use is conditioned on compliance with our Code of Conduct,
              which prohibits:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-3 ml-2">
              <li>Harassment, abuse, hate speech, and impersonation</li>
              <li>Cheating and exploitation of bugs</li>
              <li>Illegal activity and service disruption</li>
            </ul>
            <p className="mt-4">
              We reserve the right to investigate and take appropriate
              disciplinary action, including warnings, temporary suspensions, or
              permanent account termination, in our sole discretion.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 8: Liability & Disclaimers */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          8. Disclaimers & Liability
        </h2>

        <div className="grid gap-4">
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-destructive">
                Disclaimer of Warranties
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS.
              WE EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR
              STATUTORY, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR
              PURPOSE.
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-destructive">
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE,
              OR CONSEQUENTIAL DAMAGES. OUR TOTAL LIABILITY IS LIMITED TO THE
              GREATER OF: (A) TOTAL AMOUNT PAID BY YOU IN 6 MONTHS, OR (B) $100
              AUD.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You agree to defend, indemnify, and hold harmless Rivet Studios
              from any claims, liabilities, and expenses (including attorneys'
              fees) arising from your use or breach of this Agreement.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 9: Dispute Resolution */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">
          9. Dispute Resolution
        </h2>

        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p>
              Any dispute arising from or related to these Terms shall be
              resolved through binding arbitration on an individual basis,
              except for claims within small claims court jurisdiction. YOU
              WAIVE YOUR RIGHT TO A JURY TRIAL AND YOUR RIGHT TO PARTICIPATE IN
              CLASS ACTION LITIGATION.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Closing */}
      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold mb-2">Agreement</p>
          <p className="text-muted-foreground">
            By using Rivet Studios services, you acknowledge that you have
            read, understood, and agree to be bound by these Terms and
            Conditions and our Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
