"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  collectionFormSchema,
  type CollectionFormData,
} from "@/lib/schemas/collection";

import { generateSlug } from "@/lib/utils/form-helpers";

interface CollectionFormProps {
  collection?: CollectionFormData & { id?: string };
  products?: Array<{ id: string; name: string }>;
  onSubmit: (data: CollectionFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export default function CollectionForm({
  collection,
  products = [],
  onSubmit,
  onOpenChange,
}: CollectionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    collection?.productIds ?? []
  );

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: collection?.name ?? "",
      slug: collection?.slug ?? "",
      description: collection?.description ?? "",
      collectionType: collection?.collectionType ?? "STATIC",
      productIds: collection?.productIds ?? [],
      startsAt: collection?.startsAt ?? "",
      endsAt: collection?.endsAt ?? "",
    },
  });

  const { watch, setValue } = form;
  const nameValue = watch("name");
  const collectionType = watch("collectionType");

  useEffect(() => {
    if (!slugManuallyEdited && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, slugManuallyEdited, setValue]);

  useEffect(() => {
    setValue("productIds", selectedProducts);
  }, [selectedProducts, setValue]);

  const handleSubmit = (data: CollectionFormData) => {
    startTransition(async () => {
      try {
        await onSubmit(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save collection"
        );
      }
    });
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || productId;
  };

  const handleAddProduct = (productId: string) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((id) => id !== productId));
  };

  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-3 p-4">
        <div>
          <div>
            <h2>Collection Information</h2>
          </div>
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Sale 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="summer-sale-2024"
                      {...field}
                      onChange={(e) => {
                        setSlugManuallyEdited(true);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Auto-generated from name. Edit to customize.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the collection..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collectionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STATIC">Static</SelectItem>
                      <SelectItem value="DYNAMIC">Dynamic</SelectItem>
                      <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                      <SelectItem value="SEASONAL">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Flash Sale Time Fields */}
            {collectionType === "FLASH_SALE" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time *</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={formatDateTimeForInput(field.value || "")}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time *</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={formatDateTimeForInput(field.value || "")}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="productIds"
              render={() => (
                <FormItem>
                  <FormLabel>Products</FormLabel>
                  <FormDescription>
                    Select products to include in this collection
                  </FormDescription>

                  <Select onValueChange={handleAddProduct}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a product..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products
                        .filter((p) => !selectedProducts.includes(p.id))
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {selectedProducts.length > 0 && (
                    <div className="mt-3 p-3 bg-muted rounded-lg space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Selected Products ({selectedProducts.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProducts.map((productId) => (
                          <Badge
                            key={productId}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1">
                            {getProductName(productId)}
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(productId)}
                              className="ml-1 hover:text-destructive transition-colors">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          variant="outline"
          type="submit"
          disabled={isPending}
          className="w-full">
          {isPending
            ? "Saving..."
            : collection?.id
            ? "Update Collection"
            : "Create Collection"}
        </Button>
      </form>
    </Form>
  );
}
