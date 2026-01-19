import { useState } from "react";
import { Link } from "wouter";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const steps = [
  { id: 1, label: "Account", sub: "Create your account" },
  { id: 2, label: "Email", sub: "Verify your email" },
  { id: 3, label: "Integrations", sub: "Link your accounts" },
  { id: 4, label: "Profile", sub: "Complete your profile" },
  { id: 5, label: "Subscriptions", sub: "Start a subscription" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Dark Brand Area */}
      <div className="hidden lg:flex w-[35%] bg-[#0A0A0A] p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded">
            <span className="text-black font-black text-xl italic">RS</span>
          </div>
          <span className="font-bold text-xl tracking-tight">REACT Studios™</span>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">© 2026 REACT Studios™</p>
        </div>
      </div>

      {/* Right side - Onboarding Content */}
      <div className="flex-1 p-8 lg:p-24 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-12">
          {/* Welcome Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-[#0A0A0A]">Welcome</h1>
            <p className="text-muted-foreground">Let's get your account set up in just a few steps.</p>
          </div>

          {/* Stepper */}
          <div className="flex justify-between items-start relative px-4">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center gap-2 relative z-10">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    step >= s.id ? 'bg-white border-black text-black' : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold ${step >= s.id ? 'text-black' : 'text-gray-400'}`}>{s.label}</p>
                  <p className="text-[10px] text-gray-400 hidden sm:block">{s.sub}</p>
                </div>
              </div>
            ))}
            {/* Connector Lines */}
            <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 -z-0 px-12" />
          </div>

          {/* Form Content */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#0A0A0A]">Create your account</h2>
              <p className="text-muted-foreground">Enter your details to get started.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="John Doe" className="h-12 bg-gray-50/50 border-gray-200" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="h-12 bg-gray-50/50 border-gray-200" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" className="h-12 bg-gray-50/50 border-gray-200" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" className="h-12 bg-gray-50/50 border-gray-200" />
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-sm text-gray-500 font-medium">By creating an account, you agree to the following policies:</p>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    I agree to the Terms & Conditions
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="privacy" />
                  <label htmlFor="privacy" className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    I agree to the Privacy Policy
                  </label>
                </div>
              </div>

              <Button 
                className="w-full h-14 bg-[#0A0A0A] hover:bg-black text-white text-lg font-bold rounded-xl"
                onClick={() => setStep(step + 1)}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
