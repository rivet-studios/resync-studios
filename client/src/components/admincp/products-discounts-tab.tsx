import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gift, Tag, Trash2, Plus, Package } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductGrant {
  id: string;
  userId: string;
  username: string;
  productId: string;
  productName: string;
  adminNotes: string | null;
  createdAt: string;
}

interface Discount {
  id: string;
  code: string;
  description: string | null;
  discountType: "percent" | "fixed";
  amount: number;
  appliesTo: "all" | "vip" | "product";
  productId: string | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

function ProductGrantsSection() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [productId, setProductId] = useState("");
  const [note, setNote] = useState("");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", "approved"],
    queryFn: async () => {
      const res = await fetch("/api/products?status=approved", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: grants = [], isLoading } = useQuery<ProductGrant[]>({
    queryKey: ["/api/admin/products/grants"],
  });

  const grantMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/products/grant", {
        targetUsername: username,
        productId,
        note,
      });
    },
    onSuccess: () => {
      toast({ title: "Product granted", description: `Given to ${username}` });
      setUsername("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products/grants"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to grant product", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <Card data-testid="card-grant-product">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="w-4 h-4" /> Give a Product to a User
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="input-grant-product-username"
            />
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger data-testid="select-grant-product">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              data-testid="input-grant-product-note"
            />
            <Button
              onClick={() => grantMutation.mutate()}
              disabled={!username || !productId || grantMutation.isPending}
              data-testid="button-grant-product"
            >
              {grantMutation.isPending ? "Granting..." : "Grant Product"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grant History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : grants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No products have been manually granted yet
            </p>
          ) : (
            <div className="space-y-2">
              {grants.map((g) => (
                <div
                  key={g.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md border border-border"
                  data-testid={`row-product-grant-${g.id}`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{g.productName}</p>
                      <p className="text-xs text-muted-foreground">to {g.username}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DiscountsSection() {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [amount, setAmount] = useState("10");
  const [appliesTo, setAppliesTo] = useState<"all" | "vip" | "product">("all");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [assignedToUsername, setAssignedToUsername] = useState("");

  const { data: discountList = [], isLoading } = useQuery<Discount[]>({
    queryKey: ["/api/admin/discounts"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/discounts", {
        code: code.toUpperCase(),
        description: description || undefined,
        discountType,
        amount: discountType === "percent" ? Number(amount) : Math.round(Number(amount) * 100),
        appliesTo,
        maxRedemptions: assignedToUsername ? 1 : (maxRedemptions ? Number(maxRedemptions) : undefined),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        assignedToUsername: assignedToUsername || undefined,
      });
    },
    onSuccess: () => {
      const msg = assignedToUsername
        ? `${code.toUpperCase()} assigned to ${assignedToUsername}`
        : `${code.toUpperCase()} is now live`;
      toast({ title: "Discount created", description: msg });
      setCode("");
      setDescription("");
      setAmount("10");
      setMaxRedemptions("");
      setExpiresAt("");
      setAssignedToUsername("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discounts"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create discount", description: err.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/discounts/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discounts"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update discount", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/discounts/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Discount deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discounts"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to delete discount", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <Card data-testid="card-create-discount">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4" /> Create a Discount Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="Code (e.g. SUMMER25)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              data-testid="input-discount-code"
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-discount-description"
            />
            <Select value={appliesTo} onValueChange={(v: any) => setAppliesTo(v)}>
              <SelectTrigger data-testid="select-discount-applies-to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All purchases</SelectItem>
                <SelectItem value="vip">VIP subscriptions only</SelectItem>
                <SelectItem value="product">Store products only</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Assign to username (optional)"
              value={assignedToUsername}
              onChange={(e) => setAssignedToUsername(e.target.value)}
              data-testid="input-discount-assigned-user"
            />
          </div>
          {assignedToUsername && (
            <p className="text-xs text-primary">
              This code will be a personal one-time-use code redeemable only by <strong>{assignedToUsername}</strong>. Max redemptions will be set to 1 automatically.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
              <SelectTrigger data-testid="select-discount-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent off</SelectItem>
                <SelectItem value="fixed">Fixed amount off ($)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              placeholder={discountType === "percent" ? "% off" : "$ off"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-discount-amount"
            />
            <Input
              type="number"
              min={1}
              placeholder="Max redemptions (optional)"
              value={maxRedemptions}
              disabled={!!assignedToUsername}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              data-testid="input-discount-max-redemptions"
            />
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              data-testid="input-discount-expires"
            />
          </div>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!code || !amount || createMutation.isPending}
            data-testid="button-create-discount"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createMutation.isPending ? "Creating..." : "Create Discount"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Codes are created directly in Stripe and can be redeemed at checkout.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active & Past Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : discountList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No discount codes created yet
            </p>
          ) : (
            <div className="space-y-2">
              {discountList.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-md border border-border"
                  data-testid={`row-discount-${d.id}`}
                >
                  <div>
                    <p className="font-mono font-semibold text-sm text-foreground" data-testid={`text-discount-code-${d.id}`}>
                      {d.code}
                    </p>
                    <p className="text-xs text-muted-foreground">{d.description}</p>
                  </div>
                  <Badge variant="secondary">
                    {d.discountType === "percent" ? `${d.amount}% off` : `$${(d.amount / 100).toFixed(2)} off`}
                  </Badge>
                  <Badge variant="outline">{d.appliesTo}</Badge>
                  <p className="text-xs text-muted-foreground">
                    Used {d.timesRedeemed}
                    {d.maxRedemptions ? ` / ${d.maxRedemptions}` : ""}
                  </p>
                  {d.expiresAt && (
                    <p className="text-xs text-muted-foreground">
                      Expires {new Date(d.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={d.isActive}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: d.id, isActive: checked })}
                        data-testid={`switch-discount-active-${d.id}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {d.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(d.id)}
                      data-testid={`button-delete-discount-${d.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ProductsDiscountsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" data-testid="text-products-discounts-title">
          Products & Discounts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Grant store products to users and manage discount codes
        </p>
      </div>
      <ProductGrantsSection />
      <DiscountsSection />
    </div>
  );
}
