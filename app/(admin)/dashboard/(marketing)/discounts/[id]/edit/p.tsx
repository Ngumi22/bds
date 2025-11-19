// "use client"

// import { useRouter } from "next/navigation"
// import { useTransition } from "react"
// import { use } from "react"
// import DiscountForm from "@/components/forms/discount-form"
// import { updateDiscount, getDiscount } from "@/lib/actions/discounts"
// import { toast } from "@/hooks/use-toast"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { ArrowLeft, Loader2 } from "lucide-react"
// import Link from "next/link"
// import useSWR from "swr"

// export default function EditDiscountPage({
//   params,
// }: {
//   params: Promise<{ id: string }>
// }) {
//   const { id } = use(params)
//   const router = useRouter()
//   const [isPending, startTransition] = useTransition()

//   const { data: discount, isLoading } = useSWR(`discount-${id}`, () => getDiscount(id))

//   const handleSubmit = async (data: any) => {
//     startTransition(async () => {
//       const result = await updateDiscount(id, data)

//       if (result.success) {
//         toast({
//           title: "Success",
//           description: "Discount updated successfully",
//         })
//         router.push("/discounts")
//       } else {
//         toast({
//           title: "Error",
//           description: result.error || "Failed to update discount",
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

//   if (!discount) {
//     return (
//       <div className="container mx-auto py-8 max-w-3xl">
//         <Card>
//           <CardContent className="pt-6">
//             <p className="text-center text-muted-foreground">Discount not found</p>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto py-8 max-w-3xl">
//       <div className="mb-6">
//         <Link href="/discounts">
//           <Button variant="ghost" size="sm" className="mb-4">
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Discounts
//           </Button>
//         </Link>
//         <h1 className="text-3xl font-bold">Edit Discount</h1>
//         <p className="text-muted-foreground mt-2">Update the discount information</p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Discount Details</CardTitle>
//           <CardDescription>Modify the information below to update the discount</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <DiscountForm discount={discount} onSubmit={handleSubmit} />
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
