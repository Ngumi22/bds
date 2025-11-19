// "use client"

// import { useRouter } from "next/navigation"
// import { useTransition } from "react"
// import DiscountForm from "@/components/forms/discount-form"
// import { createDiscount } from "@/lib/actions/discounts"
// import { toast } from "@/hooks/use-toast"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { ArrowLeft } from "lucide-react"
// import Link from "next/link"

// export default function NewDiscountPage() {
//   const router = useRouter()
//   const [isPending, startTransition] = useTransition()

//   const handleSubmit = async (data: any) => {
//     startTransition(async () => {
//       const result = await createDiscount(data)

//       if (result.success) {
//         toast({
//           title: "Success",
//           description: "Discount created successfully",
//         })
//         router.push("/discounts")
//       } else {
//         toast({
//           title: "Error",
//           description: result.error || "Failed to create discount",
//           variant: "destructive",
//         })
//       }
//     })
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
//         <h1 className="text-3xl font-bold">Create New Discount</h1>
//         <p className="text-muted-foreground mt-2">Set up a new discount or promotion</p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Discount Details</CardTitle>
//           <CardDescription>Fill in the information below to create a new discount</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <DiscountForm onSubmit={handleSubmit} />
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
