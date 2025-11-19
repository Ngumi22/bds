// "use client"

// import { useRouter } from "next/navigation"
// import { useTransition } from "react"
// import { use } from "react"
// import ShippingZoneForm from "@/components/forms/shipping-zone-form"
// import { updateShippingZone, getShippingZone } from "@/lib/actions/shipping-zones"
// import { toast } from "@/hooks/use-toast"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { ArrowLeft, Loader2 } from "lucide-react"
// import Link from "next/link"
// import useSWR from "swr"

// export default function EditShippingZonePage({
//   params,
// }: {
//   params: Promise<{ id: string }>
// }) {
//   const { id } = use(params)
//   const router = useRouter()
//   const [isPending, startTransition] = useTransition()

//   const { data: shippingZone, isLoading } = useSWR(`shipping-zone-${id}`, () => getShippingZone(id))

//   const handleSubmit = async (data: any) => {
//     startTransition(async () => {
//       const result = await updateShippingZone(id, data)

//       if (result.success) {
//         toast({
//           title: "Success",
//           description: "Shipping zone updated successfully",
//         })
//         router.push("/shipping-zones")
//       } else {
//         toast({
//           title: "Error",
//           description: result.error || "Failed to update shipping zone",
//           variant: "destructive",
//         })
//       }
//     })
//   }

//   if (isLoading) {
//     return (
//       <div className="container mx-auto py-8 max-w-3xl">
//         <div className="flex items-center justify-center h-64">
//           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//         </div>
//       </div>
//     )
//   }

//   if (!shippingZone) {
//     return (
//       <div className="container mx-auto py-8 max-w-3xl">
//         <Card>
//           <CardContent className="pt-6">
//             <p className="text-center text-muted-foreground">Shipping zone not found</p>
//           </CardContent>
//         </Card>
//       </div>
//     )
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
//         <h1 className="text-3xl font-bold">Edit Shipping Zone</h1>
//         <p className="text-muted-foreground mt-2">Update the shipping zone information</p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Shipping Zone Details</CardTitle>
//           <CardDescription>Modify the information below to update the shipping zone</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ShippingZoneForm shippingZone={shippingZone} onSubmit={handleSubmit} />
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
