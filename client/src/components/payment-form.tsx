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
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
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
      const cardLast4 = formData.cardNumber.slice(-4);
      
      const response = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vipTier: tier.id,
          cardLast4,
          cardBrand: formData.cardBrand,
          billingName: formData.billingName,
          billingEmail: formData.billingEmail,
          billingAddress: formData.billingAddress,
          billingCity: formData.billingCity,
          billingState: formData.billingState,
          billingZip: formData.billingZip,
          billingCountry: formData.billingCountry,
        }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to process payment");

      toast({
        title: "Payment Processed",
        description: data.message || "Your card has been charged and VIP tier activated!",
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
        <label className="text-sm font-medium">Card Number</label>
        <Input
          placeholder="4242 4242 4242 4242"
          value={formData.cardNumber}
          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, "") })}
          maxLength="16"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Expires (MM/YY)</label>
          <Input
            placeholder="12/25"
            value={formData.cardExpiry}
            onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
            maxLength="5"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">CVC</label>
          <Input
            placeholder="123"
            value={formData.cardCvc}
            onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value.replace(/\D/g, "") })}
            maxLength="4"
            required
          />
        </div>
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
          Your card will be charged immediately. Your VIP tier will be activated upon successful payment.
        </p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Processing..." : `Pay $${(tier.price).toFixed(2)}`}
      </Button>
    </form>
  );
}
