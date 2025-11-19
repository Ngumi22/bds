"use client";

import { useState } from "react";
import { Plus, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import BlogCategoryForm from "./blog-category-form";
import type { BlogCategory } from "@prisma/client";
import type { BlogCategoryFormValues } from "@/lib/schemas/blog";
import { formatDate } from "@/lib/utils/form-helpers";
import BlogCategoryViewSheet from "./blog-category-view-sheet";
import {
  createBlogCategory,
  deleteBlogCategory,
  updateBlogCategory,
} from "@/lib/actions/blog";

interface BlogCategoriesSectionProps {
  categories: BlogCategory[];
  onCategoriesChange: (categories: BlogCategory[]) => void;
}

export default function BlogCategoriesSection({
  categories,
  onCategoriesChange,
}: BlogCategoriesSectionProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    BlogCategory | undefined
  >();
  const [viewingCategory, setViewingCategory] = useState<
    BlogCategory | undefined
  >();
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);

  const handleCreateCategory = async (data: BlogCategoryFormValues) => {
    try {
      const res = await createBlogCategory(data);
      if (res.success && res.data) {
        onCategoriesChange([res.data, ...categories]);
        toast.success("Category created successfully");
        setIsSheetOpen(false);
      } else {
        toast.error(res.message || "Failed to create category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create category");
    }
  };

  const handleEditCategory = async (data: BlogCategoryFormValues) => {
    if (!editingCategory) return;

    try {
      const res = await updateBlogCategory(editingCategory.id, data);
      if (res.success && res.data) {
        onCategoriesChange(
          categories.map((c) => (c.id === res.data.id ? res.data : c))
        );
        toast.success("Category updated successfully");
        setEditingCategory(undefined);
        setIsSheetOpen(false);
      } else {
        toast.error(res.message || "Failed to update category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update category");
    }
  };

  // ✅ DELETE CATEGORY
  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await deleteBlogCategory(id);
      if (res.success) {
        onCategoriesChange(categories.filter((c) => c.id !== id));
        toast.success("Category deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  const handleViewCategory = (category: BlogCategory) => {
    setViewingCategory(category);
    setIsViewSheetOpen(true);
  };

  const openCreateSheet = () => {
    setEditingCategory(undefined);
    setIsSheetOpen(true);
  };

  const openEditSheet = (category: BlogCategory) => {
    setEditingCategory(category);
    setIsSheetOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <Button onClick={openCreateSheet} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="group hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-2 mb-2">
                <CardTitle className="text-xl">{category.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleViewCategory(category)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditSheet(category)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="text-sm">
                /{category.slug}
              </CardDescription>
            </CardHeader>
            <CardContent className="border-t bg-muted/50 py-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Created {formatDate(category.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first blog category to get started
            </p>
            <Button onClick={openCreateSheet}>
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </CardContent>
        </Card>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[90%] sm:max-w-2xl overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-2">
            <BlogCategoryForm
              category={editingCategory}
              onSubmit={
                editingCategory ? handleEditCategory : handleCreateCategory
              }
            />
          </div>
        </SheetContent>
      </Sheet>

      <BlogCategoryViewSheet
        category={viewingCategory}
        open={isViewSheetOpen}
        onOpenChange={setIsViewSheetOpen}
      />
    </div>
  );
}
