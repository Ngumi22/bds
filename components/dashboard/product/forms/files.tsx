"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { clsx } from "clsx";
import { Card } from "@/components/ui/card";
import { Trash2, Upload, GripVertical } from "lucide-react";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/svg+xml"];
const MAX_SIZE_MB = 4;

export type UploadedFileData = {
  name?: string;
  size?: number;
  key?: string;
  url?: string;
  ufsUrl?: string;
};

export interface UseUploaderProps {
  initialValue?: string[];
  maxFiles?: number;
}

export function useUploader({
  initialValue = [],
  maxFiles = 4,
}: UseUploaderProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialValue);
  const [isUploading, setIsUploading] = useState(false);

  const canUploadMore = useMemo(
    () => imageUrls.length < maxFiles,
    [imageUrls.length, maxFiles]
  );

  const onUploadComplete = useCallback(
    (res: UploadedFileData[]) => {
      const newUrls = res
        .map((file) => file?.ufsUrl || file?.url)
        .filter((url): url is string => typeof url === "string");

      setIsUploading(false);

      if (!newUrls.length) return;

      setImageUrls((prev) => [...prev, ...newUrls].slice(0, maxFiles));

      toast("Upload successful", {
        description: `${newUrls.length} image(s) uploaded.`,
      });
    },
    [maxFiles]
  );

  const onRemove = useCallback((url: string) => {
    setImageUrls((prev) => prev.filter((img) => img !== url));
    toast("Image removed", { description: "Removed from list." });
  }, []);

  const onUploadBegin = useCallback(
    (files: File[]) => {
      if (imageUrls.length + files.length > maxFiles) {
        toast("Max files exceeded", {
          description: `You can only upload a maximum of ${maxFiles} images. You have ${imageUrls.length} and tried to add ${files.length} more.`,
        });
        return false;
      }

      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast("Invalid type", {
            description: `"${file.name}" is not a supported format. Only JPG, PNG, SVG are allowed.`,
          });
          return false;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast("Too large", {
            description: `"${file.name}" exceeds ${MAX_SIZE_MB}MB.`,
          });
          return false;
        }
      }

      setIsUploading(true);
      return true;
    },
    [imageUrls.length, maxFiles]
  );

  const reorder = useCallback((oldIndex: number, newIndex: number) => {
    setImageUrls((items) => arrayMove(items, oldIndex, newIndex));
  }, []);

  const replaceImage = useCallback((oldUrl: string, newUrl: string) => {
    setImageUrls((prev) => prev.map((url) => (url === oldUrl ? newUrl : url)));
    toast("Image updated", { description: "Image has been replaced." });
  }, []);

  return {
    imageUrls,
    isUploading,
    canUploadMore,
    onUploadComplete,
    onUploadBegin,
    onRemove,
    reorder,
    replaceImage,
  };
}

interface UploaderProps {
  imageUrls: string[];
  isUploading: boolean;
  canUploadMore: boolean;
  onUploadComplete: (res: UploadedFileData[]) => void;
  onUploadBegin: (files: File[]) => boolean | void;
  onRemove: (url: string) => void;
  reorder: (oldIndex: number, newIndex: number) => void;
  replaceImage?: (oldUrl: string, newUrl: string) => void;
  className?: string;
  endpoint: "imageUploader";
  disabled?: boolean;
  startUpload: (files: File[]) => Promise<UploadedFileData[] | undefined>;
  isMultiple?: boolean;
  mode?: "add" | "replace";
}

function SortableImage({
  url,
  index,
  onRemove,
  onReplace,
  uniqueKey,
  isMultiple,
}: {
  url: string;
  index: number;
  onRemove: (url: string) => void;
  onReplace?: (oldUrl: string, newUrl: string) => void;
  uniqueKey: string;
  isMultiple?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: uniqueKey });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transition,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileReplace = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !onReplace) return;

    event.target.value = "";

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast("Invalid type", {
        description: `Only JPG, PNG, SVG are allowed.`,
      });
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast("Too large", {
        description: `File exceeds ${MAX_SIZE_MB}MB.`,
      });
      return;
    }

    toast("Replace functionality", {
      description: "File replacement handler needs to be implemented.",
    });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="relative overflow-hidden p-1 bg-muted/30 rounded-lg group">
      <div className="relative aspect-square w-full rounded-md overflow-hidden">
        <img
          src={url || "/placeholder.svg?height=200&width=200"}
          alt={`Image ${index + 1}`}
          style={{ objectFit: "cover" }}
          className="absolute inset-0 w-full h-full"
        />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => onRemove(url)}
              className="p-2 h-10 w-10 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors z-10 shadow-lg"
              aria-label="Remove image">
              <Trash2 className="h-4 w-4" />
            </Button>

            {!isMultiple && onReplace && (
              <Button
                type="button"
                onClick={handleReplaceClick}
                className="p-2 h-10 w-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors z-10 shadow-lg"
                aria-label="Replace image">
                <Upload className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!isMultiple && onReplace && (
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              style={{ display: "none" }}
              onChange={handleFileReplace}
            />
          )}
        </div>

        {isMultiple && (
          <span
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1 rounded-full bg-black/50 text-white cursor-grab h-8 w-8 flex items-center justify-center shadow-lg">
            <GripVertical className="h-4 w-4" />
          </span>
        )}
      </div>
    </Card>
  );
}

export default function FileUploader({
  imageUrls,
  isUploading,
  canUploadMore,
  onUploadComplete,
  onUploadBegin,
  onRemove,
  reorder,
  replaceImage,
  className = "",
  startUpload,
  isMultiple = false,
  mode = "add",
}: UploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIndex = imageUrls.findIndex(
          (url, idx) => `${url}-${idx}` === active.id
        );
        const newIndex = imageUrls.findIndex(
          (url, idx) => `${url}-${idx}` === over?.id
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          reorder(oldIndex, newIndex);
        }
      }
    },
    [imageUrls, reorder]
  );

  const handleFileSelect = async (files: File[]) => {
    if (!files.length) return;

    const shouldProceed = onUploadBegin(files);
    if (!shouldProceed) {
      return;
    }

    try {
      let successfulUploads: UploadedFileData[] = [];

      const result = await startUpload(files);
      successfulUploads = result || [];

      onUploadComplete(successfulUploads);
    } catch (error) {
      console.error("Upload failed:", error);
      toast("Upload failed", {
        description: "There was an error uploading your files.",
      });
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (!files.length) return;

    if (!isMultiple && imageUrls.length > 0 && mode === "replace") {
      const oldUrl = imageUrls[0];
      const file = files[0];

      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast("Invalid type", {
          description: `Only JPG, PNG, SVG are allowed.`,
        });
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast("Too large", {
          description: `File exceeds ${MAX_SIZE_MB}MB.`,
        });
        return;
      }

      const shouldProceed = onUploadBegin([file]);
      if (!shouldProceed) return;

      try {
        const result = await startUpload([file]);
        const newUrls = result
          ?.map((file) => file?.ufsUrl || file?.url)
          .filter(Boolean) as string[];

        if (newUrls.length > 0 && replaceImage) {
          replaceImage(oldUrl, newUrls[0]);
        } else if (newUrls.length > 0) {
          onRemove(oldUrl);
          onUploadComplete(result || []);
        }
      } catch (error) {
        console.error("Replace upload failed:", error);
        toast("Replace failed", {
          description: "There was an error replacing the image.",
        });
      }
    } else {
      await handleFileSelect(files);
    }
  };

  return (
    <div className={clsx("space-y-4 font-sans", className)}>
      {imageUrls.length > 0 && (
        <>
          {isMultiple ? (
            <DndContext onDragEnd={handleDragEnd}>
              <SortableContext
                items={imageUrls.map((url, idx) => `${url}-${idx}`)}
                strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, idx) => (
                    <SortableImage
                      key={`${url}-${idx}`}
                      uniqueKey={`${url}-${idx}`}
                      url={url}
                      index={idx}
                      onRemove={onRemove}
                      isMultiple={isMultiple}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="grid grid-cols-1 max-w-xs">
              {imageUrls.map((url, idx) => (
                <SortableImage
                  key={`${url}-${idx}`}
                  uniqueKey={`${url}-${idx}`}
                  url={url}
                  index={idx}
                  onRemove={onRemove}
                  onReplace={replaceImage}
                  isMultiple={isMultiple}
                />
              ))}
            </div>
          )}
        </>
      )}

      {(canUploadMore || (!isMultiple && mode === "replace")) && (
        <Card className="border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl hover:border-gray-400 transition-colors cursor-pointer">
          {isUploading ? (
            <div className="animate-pulse space-y-2 py-4">
              <div className="bg-gray-200 h-6 w-40 mx-auto rounded-md" />
              <div className="text-sm font-semibold text-gray-600">
                Uploading...
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-indigo-500 mb-2" />
              <p className="text-sm font-medium mb-1 text-gray-800">
                {!isMultiple && imageUrls.length > 0
                  ? "Click to replace image"
                  : "Drag or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground ">
                {ACCEPTED_TYPES.map((t) => t.split("/")[1].toUpperCase()).join(
                  ", "
                )}{" "}
                (max. {MAX_SIZE_MB}MB each)
              </p>
            </>
          )}

          <div
            className={clsx(
              isUploading && "opacity-0 pointer-events-none",
              "mt-4 w-full"
            )}>
            <div className="w-full">
              <Button
                type="button"
                className="w-full bg-black hover:bg-gray-800 text-white rounded-md shadow-md transition-colors"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}>
                {isUploading
                  ? "Uploading..."
                  : !isMultiple && imageUrls.length > 0
                  ? "Replace Image"
                  : `Select ${isMultiple ? "Images" : "Image"}`}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                multiple={isMultiple && mode === "add"}
                accept={ACCEPTED_TYPES.join(",")}
                style={{ display: "none" }}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
