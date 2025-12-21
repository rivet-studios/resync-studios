import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Search,
  Star,
  Heart,
  TrendingUp,
  Lock,
} from "lucide-react";
import { Link } from "wouter";

interface StoreItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  image?: string;
  badge?: string;
  featured?: boolean;
  discount?: number;
  inStock: boolean;
}

const storeItems: StoreItem[] = [
  {
    id: "1",
    name: "Premium VIP Membership",
    category: "Subscriptions",
    price: 9.99,
    originalPrice: 14.99,
    description: "Unlock exclusive perks and premium features",
    badge: "SALE",
    featured: true,
    discount: 33,
    inStock: true,
  },
  {
    id: "2",
    name: "Diamond VIP Pack",
    category: "Subscriptions",
    price: 24.99,
    description: "Premium subscription with all features unlocked",
    badge: "POPULAR",
    featured: true,
    inStock: true,
  },
  {
    id: "3",
    name: "Custom Avatar",
    category: "Cosmetics",
    price: 4.99,
    description: "Personalize your profile with a custom avatar",
    badge: "COMING SOON",
    inStock: false,
  },
  {
    id: "4",
    name: "Profile Banner",
    category: "Cosmetics",
    price: 2.99,
    description: "Display a custom banner on your profile",
    badge: "COMING SOON",
    inStock: false,
  },
  {
    id: "5",
    name: "Clan Starter Pack",
    category: "Clans",
    price: 19.99,
    description: "Everything you need to start your clan",
    badge: "COMING SOON",
    inStock: false,
  },
  {
    id: "6",
    name: "Roleplay Bundle",
    category: "Gameplay",
    price: 12.99,
    description: "Essential items for enhanced roleplay experience",
    badge: "COMING SOON",
    inStock: false,
  },
  {
    id: "7",
    name: "Name Change",
    category: "Account",
    price: 3.99,
    description: "Change your username one time",
    badge: "COMING SOON",
    inStock: false,
  },
  {
    id: "8",
    name: "Supporter Pack",
    category: "Subscriptions",
    price: 7.99,
    description: "Support the community and get exclusive rewards",
    inStock: true,
  },
  {
    id: "9",
    name: "Founders Edition Lifetime",
    category: "Subscriptions",
    price: 49.99,
    description: "Lifetime access to all founder benefits",
    badge: "EXCLUSIVE",
    inStock: false,
  },
];

export default function Store() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<string[]>([]);

  const categories = [
    "all",
    ...new Set(storeItems.map((item) => item.category)),
  ];

  const filteredItems = storeItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCart = (itemId: string) => {
    setCart((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const totalPrice = filteredItems
    .filter((item) => cart.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Store</h1>
        <p className="text-lg text-muted-foreground">
          Browse our collection of exclusive items and subscriptions
        </p>
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-store"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger
                className="w-full sm:w-48"
                data-testid="select-category"
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
                </span>
              </div>
              <span className="text-sm font-bold">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`flex flex-col relative ${
                item.featured ? "border-primary/50" : ""
              } ${!item.inStock ? "opacity-60" : ""}`}
            >
              {/* Badge */}
              {item.badge && (
                <div className="absolute top-3 right-3">
                  <Badge
                    className={`${
                      item.badge === "SALE"
                        ? "bg-red-500 text-red-50"
                        : item.badge === "POPULAR"
                          ? "bg-blue-500 text-blue-50"
                          : item.badge === "NEW"
                            ? "bg-green-500 text-green-50"
                            : "bg-purple-500 text-purple-50"
                    }`}
                  >
                    {item.badge}
                  </Badge>
                </div>
              )}

              {/* Stock Status */}
              {!item.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                  <div className="text-center">
                    <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm font-semibold">Sold Out</span>
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {item.category}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleCart(item.id)}
                    disabled={!item.inStock}
                    className="h-8 w-8 shrink-0"
                    data-testid={`button-wishlist-${item.id}`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        cart.includes(item.id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-3">
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold">
                    ${item.price.toFixed(2)}
                  </span>
                  {item.originalPrice && (
                    <>
                      <span className="text-sm line-through text-muted-foreground">
                        ${item.originalPrice.toFixed(2)}
                      </span>
                      {item.discount && (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          -{item.discount}%
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {/* Purchase Button */}
                <Button
                  className="w-full"
                  disabled={!item.inStock}
                  onClick={() => toggleCart(item.id)}
                  data-testid={`button-add-cart-${item.id}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {cart.includes(item.id) ? "Remove from Cart" : "Add to Cart"}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Checkout CTA */}
      {cart.length > 0 && (
        <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1">Ready to checkout?</h3>
                <p className="text-sm text-muted-foreground">
                  {cart.length} item{cart.length !== 1 ? "s" : ""} selected •
                  Total: ${totalPrice.toFixed(2)}
                </p>
              </div>
              <Button size="lg" className="sm:min-w-fit">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
