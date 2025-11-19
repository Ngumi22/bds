import { Shield, Lock, Award, Truck } from "lucide-react"

export function TrustBadges() {
  const badges = [
    { icon: Shield, text: "Secure Checkout" },
    { icon: Lock, text: "SSL Encrypted" },
    { icon: Award, text: "Authorized Dealer" },
    { icon: Truck, text: "Fast Shipping" },
  ]

  return (
    <div className="mb-6 flex flex-wrap justify-center gap-4 border-y border-border bg-muted/30 py-4">
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center gap-2">
          <badge.icon className="h-4 w-4 text-foreground" />
          <span className="text-xs font-medium text-foreground">{badge.text}</span>
        </div>
      ))}
    </div>
  )
}
