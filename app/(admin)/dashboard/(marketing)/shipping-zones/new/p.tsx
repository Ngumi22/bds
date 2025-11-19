// "use client"

// import { useRouter } from "next/navigation"
// import { useTransition } from "react"
// import ShippingZoneForm from "@/components/forms/shipping-zone-form"
// import { createShippingZone } from "@/lib/actions/shipping-zones"
// import { toast } from "@/hooks/use-toast"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { ArrowLeft } from "lucide-react"
// import Link from "next/link"

// export default function NewShippingZonePage() {
//   const router = useRouter()
//   const [isPending, startTransition] = useTransition()

//   const handleSubmit = async (data: any) => {
//     startTransition(async () => {
//       const result = await createShippingZone(data)

//       if (result.success) {
//         toast({
//           title: "Success",
//           description: "Shipping zone created successfully",
//         })
//         router.push("/shipping-zones")
//       } else {
//         toast({
//           title: "Error",
//           description: result.error || "Failed to create shipping zone",
//           variant: "destructive",
//         })
//       }
//     })
//   }

//   return (
//     <div className="container mx-auto py-8 max-w-3xl">
//       <div className="mb-6">
//         <Link href="/shipping-zones">
//           <Button variant="ghost" size="sm" className="mb-4">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Shipping Zones
//           </Button>
//         </Link>
//         <h1 className="text-3xl font-bold">Create New Shipping Zone</h1>
//         <p className="text-muted-foreground mt-2">Define a new shipping zone with rates</p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Shipping Zone Details</CardTitle>
//           <CardDescription>Fill in the information below to create a new shipping zone</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ShippingZoneForm onSubmit={handleSubmit} />
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
