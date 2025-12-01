import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

interface PaymentFormProps {
  tier: { id: string; price: number; name: string };
  onSuccess?: () => void;
}

export function PaymentForm({ tier, onSuccess }: PaymentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardLast4: "",
    cardBrand: "visa",
    billingName: "",
    billingEmail: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "United States",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vipTier: tier.id,
          ...formData,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to submit payment");

      toast({
        title: "Payment Submitted",
        description: "Your payment has been submitted for review. Our team will verify and process it shortly.",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Full Name</label>
        <Input
          placeholder="John Doe"
          value={formData.billingName}
          onChange={(e) => setFormData({ ...formData, billingName: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          placeholder="john@example.com"
          value={formData.billingEmail}
          onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Street Address</label>
        <Input
          placeholder="123 Main St"
          value={formData.billingAddress}
          onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">City</label>
          <Input
            placeholder="City"
            value={formData.billingCity}
            onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">State</label>
          <Input
            placeholder="CA"
            value={formData.billingState}
            onChange={(e) => setFormData({ ...formData, billingState: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">ZIP Code</label>
          <Input
            placeholder="12345"
            value={formData.billingZip}
            onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Country</label>
          <Input
            placeholder="United States"
            value={formData.billingCountry}
            onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Card Last 4 Digits</label>
        <Input
          placeholder="4242"
          maxLength="4"
          value={formData.cardLast4}
          onChange={(e) => setFormData({ ...formData, cardLast4: e.target.value.replace(/\D/g, "") })}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Card Type</label>
        <select
          className="w-full px-3 py-2 border border-input rounded-md text-sm"
          value={formData.cardBrand}
          onChange={(e) => setFormData({ ...formData, cardBrand: e.target.value })}
        >
          <option value="visa">Visa</option>
          <option value="mastercard">Mastercard</option>
          <option value="amex">American Express</option>
          <option value="discover">Discover</option>
        </select>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-2">
        <Lock className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-600">
          Payment will be reviewed by our team. Your VIP tier will be activated once approved.
        </p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Processing..." : `Pay $${(tier.price).toFixed(2)}`}
      </Button>
    </form>
  );
}
