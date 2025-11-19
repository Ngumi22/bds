"use client";

import { startTransition, useState } from "react";
import { toast } from "sonner";
import {
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  archiveHeroBanner,
  unarchiveHeroBanner,
} from "@/lib/data/hero-banner";
import {
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import HeroBannerForm from "@/components/dashboard/hero-banner/banner-form";
import HeroBannerViewSheet from "@/components/dashboard/hero-banner/hero-banner-view-sheet";
import type { HeroBannerFormValues } from "@/lib/schemas/hero-banner";
import type { HeroBanner } from "@/lib/types/hero-banner";
import { useRouter } from "next/navigation";

interface Props {
  initialBanners: HeroBanner[];
  collections: Array<{ id: string; name: string }>;
}

export default function HeroBannersClientPage({
  initialBanners,
  collections,
}: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<HeroBanner | null>(null);

  const router = useRouter();

  const handleCreate = async (data: HeroBannerFormValues) => {
    let result;
    await new Promise<void>((resolve) =>
      startTransition(async () => {
        result = await createHeroBanner(data);
        toast.success(result.message);
        setIsCreateOpen(false);
        resolve();
      })
    );

    router.refresh();
    return result!;
  };

  const handleEdit = async (data: HeroBannerFormValues) => {
    if (!selectedBanner) {
      return { success: false, message: "No banner selected" };
    }

    let result;
    await new Promise<void>((resolve) =>
      startTransition(async () => {
        result = await updateHeroBanner(selectedBanner.id, data);
        toast.success(result.message);
        setIsEditOpen(false);
        resolve();
      })
    );
    router.refresh();
    return result!;
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteHeroBanner(id);

      toast.success(res.message);
    });
  };

  const handleArchive = (id: string, active: boolean) => {
    startTransition(async () => {
      const res = active
        ? await archiveHeroBanner(id)
        : await unarchiveHeroBanner(id);

      router.refresh();
      toast.success(res.message);
    });
  };

  const handleView = (banner: HeroBanner) => {
    setSelectedBanner(banner);
    setIsViewOpen(true);
  };

  const openEditSheet = (banner: HeroBanner) => {
    setSelectedBanner(banner);
    setIsEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto p-2 max-w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold mb-2">Hero Banners</h1>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialBanners.map((banner) => (
            <Card
              key={banner.id}
              className="group hover:border-primary/50 transition-colors overflow-hidden pb-2">
              <div className="relative w-full aspect-auto bg-muted">
                <Image
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.title}
                  height={200}
                  width={200}
                  className="object-cover h-full w-auto"
                />
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">
                  {banner.tag}
                </Badge>
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(banner)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditSheet(banner)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleArchive(banner.id, banner.isActive)
                        }>
                        {banner.isActive ? (
                          <>
                            <Archive className="mr-2 h-4 w-4" /> Archive
                          </>
                        ) : (
                          <>
                            <ArchiveRestore className="mr-2 h-4 w-4" />{" "}
                            Unarchive
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(banner.id)}
                        className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-4 py-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold line-clamp-2 flex-1">
                    {banner.title}
                  </h3>
                  <Badge
                    variant={banner.isActive ? "default" : "secondary"}
                    className="shrink-0">
                    {banner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {banner.description}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Order: {banner.order}</span>
                  {banner.collection && (
                    <Badge variant="outline" className="text-xs">
                      {banner.collection.name}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {initialBanners.length === 0 && (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No banners yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first hero banner to showcase on your homepage
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Banner</SheetTitle>
          </SheetHeader>
          <div className="mt-2">
            <HeroBannerForm
              onSubmit={handleCreate}
              collections={collections || undefined}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Banner</SheetTitle>
          </SheetHeader>
          <div className="mt-2">
            <HeroBannerForm
              banner={selectedBanner || undefined}
              collections={collections || undefined}
              onSubmit={handleEdit}
            />
          </div>
        </SheetContent>
      </Sheet>

      <HeroBannerViewSheet
        banner={selectedBanner}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />
    </div>
  );
}
