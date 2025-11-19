"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import type { CategoryWithRelations } from "@/lib/types/categories";

const specificationDefinitionSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1, "Specification key is required"),
  name: z.string().min(1, "Specification name is required"),
  categoryId: z.string().min(1),
});

const specificationsFormSchema = z.object({
  specifications: z.array(specificationDefinitionSchema),
});

export type SpecificationsFormValues = z.infer<typeof specificationsFormSchema>;

export interface CategorySpecificationsFormProps {
  category: CategoryWithRelations;
  initialData?: SpecificationsFormValues;
  onSubmit: (data: SpecificationsFormValues) => Promise<{
    success: boolean;
    message?: string;
  }>;
}

export default function CategorySpecificationsForm({
  category,
  initialData,
  onSubmit,
}: CategorySpecificationsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SpecificationsFormValues>({
    resolver: zodResolver(
      specificationsFormSchema
    ) as unknown as Resolver<SpecificationsFormValues>,
    defaultValues: {
      specifications:
        initialData?.specifications ??
        category.specifications?.map((spec) => ({
          id: spec.id,
          categoryId: category.id,
          key: spec.key,
          name: spec.name,
        })) ??
        [],
    },
  });

  const { control, register, handleSubmit, formState } = form;
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications",
  });

  const handleAddSpecification = () =>
    append({ categoryId: category.id, key: "", name: "" });

  const onFormSubmit: SubmitHandler<SpecificationsFormValues> = async (
    data
  ) => {
    startTransition(async () => {
      const result = await onSubmit(data);

      if (!result.success) {
        toast("Error saving specifications", {
          description: result.message ?? "Please try again.",
        });
      } else {
        toast("Specifications saved", {
          description: result.message ?? "Saved successfully.",
        });
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-sm">
            <p className="text-muted-foreground mb-4">
              No specifications yet for this category.
            </p>
            <Button variant="outline" onClick={handleAddSpecification}>
              <Plus className="h-4 w-4 mr-2" /> Add First Specification
            </Button>
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="border rounded-sm p-6 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Specification #{index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={isPending}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Key *</Label>
                  <Input
                    {...register(`specifications.${index}.key`)}
                    placeholder="e.g. ram_size"
                  />
                  {errors.specifications?.[index]?.key && (
                    <p className="text-xs text-destructive">
                      {errors.specifications[index]?.key?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    {...register(`specifications.${index}.name`)}
                    placeholder="e.g. RAM Size"
                  />
                  {errors.specifications?.[index]?.name && (
                    <p className="text-xs text-destructive">
                      {errors.specifications[index]?.name?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Specifications"}
        </Button>
      </div>
    </form>
  );
}
