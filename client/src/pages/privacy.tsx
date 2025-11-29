import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Shield, FileText, Users, Zap } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mx-auto gap-2">
          <Lock className="w-3.5 h-3.5" />
          Your Privacy Matters
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          How we collect, use, and protect your information
        </p>
        <p className="text-sm text-muted-foreground mt-4">Last Updated: November 11th, 2025</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary mt-1 shrink-0" />
            <div>
              <p className="font-semibold mb-2">Our Commitment</p>
              <p className="text-muted-foreground">
                Metro Interactive ("we" or "us") respects your privacy and is committed to protecting it through our 
                compliance with this policy. This Privacy Policy describes how we collect, use, maintain, protect, and 
                disclose information from users of our websites, games, forums, and related services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Information We Collect */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">1. Information We Collect</h2>
        </div>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Information You Provide</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Account Registration:</strong> Username, email address, and password</p>
              <p><strong>Purchase Information:</strong> Name, billing address, and payment details processed by third-party providers</p>
              <p><strong>Communications:</strong> Content of support requests and other communications</p>
              <p><strong>Community Content:</strong> Forum posts, in-game chat, and other public community content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Information Collected Automatically</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Device Information:</strong> IP address, device identifiers, operating system, browser type, and hardware specifications</p>
              <p><strong>Gameplay Data:</strong> Progress, achievements, session duration, in-game actions, and performance metrics</p>
              <p><strong>Usage Information:</strong> Pages viewed, interaction data, and standard web log information</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We use cookies and similar tracking technologies to operate our services, remember preferences, and analyze usage. 
              You can control cookie settings in your browser, though this may limit certain features.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: How We Use Your Information */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">2. How We Use Your Information</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Service Provision</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              To create and manage your account, process transactions, operate game servers, save progress, and deliver requested services.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Improvement & Optimization</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              To analyze gameplay and usage data to fix bugs, improve performance, balance game economy, and enhance user experience.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Safety & Security</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              To protect from abuse and malicious users, detect cheating, enforce Terms and Conditions, investigate fraud, and secure our services.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Communications</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              To send transactional emails (password resets, receipts) and important service announcements. Marketing communications are sent with your consent only.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Legal Compliance</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              To respond to legal requests from law enforcement, comply with legal obligations, and enforce our legal rights.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: Data Sharing */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">3. Data Sharing & Protection</h2>
        
        <div className="grid gap-4">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-green-600">We Do NOT Sell Your Data</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Metro Interactive does not sell your Personal Information to third parties for money or any consideration. 
              We do not share your data with third parties for their marketing purposes.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Service Providers</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We share information with trusted third-party service providers (cloud hosting, payment processors, analytics services, 
              customer support platforms) who are contractually obligated to keep your information confidential and secure.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Legal Disclosures</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We may disclose information if required by law or if we believe in good faith that disclosure is necessary to protect 
              our rights, property, safety, or that of our users and the public.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Corporate Transactions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              In the event of merger, acquisition, or asset sale, your Personal Information may be transferred. 
              We will notify you via email and prominent website notice of any ownership changes.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 4: Your Rights */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">4. Your Privacy Rights</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Access & Correction</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You may review and change your core account information in your account settings. You can also request 
              a copy of your Personal Information or request corrections to inaccuracies.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Deletion (Right to be Forgotten)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You may request deletion of your account and associated Personal Information. Please note this is permanent 
              and will result in loss of all game progress, virtual goods, and purchase history.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Marketing Preferences</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You may opt out of promotional emails by following the unsubscribe link. You will continue receiving 
              essential transactional emails even if you opt out of marketing.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How to Exercise Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Contact us at support@metrointeractive.com. We may verify your identity before processing requests 
              to protect your information from fraudulent requests.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 5: Data Security */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">5. Data Security & Retention</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Security Measures</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We implement reasonable administrative, technical, and physical security safeguards to protect your 
              Personal Information. However, no method of transmission over the Internet is 100% secure. 
              You acknowledge that you provide information at your own risk.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We retain your Personal Information for as long as your account is active or as needed to provide services. 
              Anonymized or aggregated data may be retained indefinitely for statistical and improvement purposes.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 6: Special Provisions */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">6. Special Provisions</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Our Services are not directed to children under 13. We do not knowingly collect Personal Information from 
              children under 13 without verifiable parental consent. If we learn of such collection, we will promptly delete that information.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Our Services are hosted on servers in Australia. If you use our Services from outside Australia, your information 
              will be transferred to, stored, and processed in Australia in accordance with this Privacy Policy.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">GDPR & Regional Rights</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Residents of the EEA, UK, Switzerland, and Australia have additional rights under GDPR, CCPA, and other 
              regional data protection laws. These include rights to access, rectify, erase, restrict processing, 
              data portability, and object to processing.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 7: Changes & Contact */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold">7. Changes & Contact</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Policy Changes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We reserve the right to modify this Privacy Policy at any time. Material changes will be notified via email 
              or prominent website notice before becoming effective. Your continued use of our Services constitutes acceptance.
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>If you have questions or concerns about this Privacy Policy, contact us at:</p>
              <p className="font-mono text-xs">support@metrointeractive.com</p>
              <p className="text-xs">Metro Interactive, PO Box 515381 PMB 238696, Los Angeles, California, 90051-6681</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Closing */}
      <Card className="bg-gradient-to-r from-primary/10 to-chart-3/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-lg">
            We are committed to being transparent about how we collect and use your information. 
            Your privacy is important to us.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
