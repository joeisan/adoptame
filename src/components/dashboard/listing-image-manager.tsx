"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { GripVertical, ImagePlus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/language-context";

type ExistingImage = {
  id: string;
  publicUrl: string;
  altText: string;
  sortOrder: number;
};

type ExistingImageState = ExistingImage & {
  deleted: boolean;
};

type NewImageState = {
  id: string;
  file: File;
  previewUrl: string;
  altText: string;
};

function reorder<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function ListingImageManager({
  maxImages,
  existingImages = []
}: {
  maxImages: number;
  existingImages?: ExistingImage[];
}) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<{ section: "existing" | "new"; index: number } | null>(null);
  const latestNewImagesRef = useRef<NewImageState[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [existing, setExisting] = useState<ExistingImageState[]>(
    existingImages
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({ ...image, deleted: false }))
  );
  const [newImages, setNewImages] = useState<NewImageState[]>([]);

  const activeExistingCount = useMemo(() => existing.filter((image) => !image.deleted).length, [existing]);
  const totalImages = activeExistingCount + newImages.length;
  const remainingSlots = Math.max(maxImages - totalImages, 0);

  useEffect(() => {
    if (!fileInputRef.current) return;
    const transfer = new DataTransfer();
    newImages.forEach((image) => transfer.items.add(image.file));
    fileInputRef.current.files = transfer.files;
  }, [newImages]);

  useEffect(() => {
    latestNewImagesRef.current = newImages;
  }, [newImages]);

  useEffect(() => {
    return () => {
      latestNewImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const syncNewFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!fileArray.length) return;

    if (remainingSlots <= 0) {
      toast.error(t("listing.maxImagesReached").replace("{maxImages}", String(maxImages)));
      return;
    }

    const accepted = fileArray.slice(0, remainingSlots);
    const skipped = fileArray.length - accepted.length;
    if (skipped > 0) {
      toast.error(t("listing.canOnlyAddMore").replace("{remainingSlots}", String(remainingSlots)));
    }

    setNewImages((current) => [
      ...current,
      ...accepted.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        altText: ""
      }))
    ]);
  };

  const handleDropUpload = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    if (event.dataTransfer.files?.length) {
      syncNewFiles(event.dataTransfer.files);
    }
  };

  const onSortStart = (section: "existing" | "new", index: number) => {
    dragRef.current = { section, index };
  };

  const onSortDrop = (section: "existing" | "new", index: number) => {
    if (!dragRef.current || dragRef.current.section !== section || dragRef.current.index === index) {
      dragRef.current = null;
      return;
    }

    if (section === "existing") {
      setExisting((current) => reorder(current, dragRef.current!.index, index));
    } else {
      setNewImages((current) => reorder(current, dragRef.current!.index, index));
    }

    dragRef.current = null;
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>{t("listing.images")}</Label>
          <span className="text-xs text-muted-foreground">
            {totalImages} {t("listing.of")} {maxImages} {t("listing.loaded")}
          </span>
        </div>

        <div
          className={`rounded-lg border border-dashed px-4 py-6 text-center transition ${isDraggingFiles ? "border-primary bg-primary/5" : "border-border bg-muted/20"}`}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDraggingFiles(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDraggingFiles(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropUpload}
          role="button"
          tabIndex={0}
        >
          <div className="mx-auto flex max-w-md flex-col items-center gap-2">
            <div className="rounded-full border bg-background p-3">
              <Upload className="size-5 text-primary" />
            </div>
            <p className="text-sm font-medium">{t("listing.dragDropImages")}</p>
            <p className="text-xs text-muted-foreground">{t("listing.allowedFormats").replace("{maxImages}", String(maxImages))}</p>
          </div>
          <input
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            id="images"
            multiple
            name="images"
            type="file"
            onChange={(event) => {
              if (event.target.files?.length) {
                syncNewFiles(event.target.files);
                event.target.value = "";
              }
            }}
          />
        </div>
      </div>

      <input
        name="existingImagesState"
        type="hidden"
        value={JSON.stringify(
          existing.map((image, index) => ({
            id: image.id,
            altText: image.altText,
            deleted: image.deleted,
            sortOrder: index
          }))
        )}
      />
      <input
        name="newImageAltTexts"
        type="hidden"
        value={JSON.stringify(newImages.map((image) => image.altText))}
      />

      {existing.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">{t("listing.currentImages")}</h3>
            <span className="text-xs text-muted-foreground">{t("listing.currentImagesDesc")}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {existing.map((image, index) => (
              <div
                key={image.id}
                className={`space-y-3 rounded-lg border p-3 ${image.deleted ? "border-destructive/40 bg-destructive/5 opacity-70" : "bg-background"}`}
                draggable={!image.deleted}
                onDragStart={() => onSortStart("existing", index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onSortDrop("existing", index)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GripVertical className="size-4" />
                    {t("listing.imageX").replace("{index}", String(index + 1))}
                  </div>
                  <Button
                    type="button"
                    variant={image.deleted ? "secondary" : "ghost"}
                    size="icon"
                    className="size-8"
                    onClick={() =>
                      setExisting((current) =>
                        current.map((item) => (item.id === image.id ? { ...item, deleted: !item.deleted } : item))
                      )
                    }
                  >
                    {image.deleted ? <X className="size-4" /> : <Trash2 className="size-4 text-destructive" />}
                  </Button>
                </div>
                <div className="overflow-hidden rounded-md border bg-muted/20">
                  <img alt={image.altText || t("listing.imageX").replace("{index}", String(index + 1))} className="aspect-[4/3] w-full object-cover" src={image.publicUrl} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`existing-alt-${image.id}`} className="text-xs">
                    {t("listing.altText")}
                  </Label>
                  <Input
                    id={`existing-alt-${image.id}`}
                    disabled={image.deleted}
                    value={image.altText}
                    onChange={(event) =>
                      setExisting((current) =>
                        current.map((item) => (item.id === image.id ? { ...item, altText: event.target.value } : item))
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {newImages.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">{t("listing.newImages")}</h3>
            <span className="text-xs text-muted-foreground">{t("listing.newImagesDesc")}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {newImages.map((image, index) => (
              <div
                key={image.id}
                className="space-y-3 rounded-lg border bg-background p-3"
                draggable
                onDragStart={() => onSortStart("new", index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onSortDrop("new", index)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GripVertical className="size-4" />
                    {t("listing.newX").replace("{index}", String(index + 1))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() =>
                      setNewImages((current) => {
                        const removed = current.find((item) => item.id === image.id);
                        if (removed) URL.revokeObjectURL(removed.previewUrl);
                        return current.filter((item) => item.id !== image.id);
                      })
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
                <div className="overflow-hidden rounded-md border bg-muted/20">
                  <img alt={image.altText || image.file.name} className="aspect-[4/3] w-full object-cover" src={image.previewUrl} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`new-alt-${image.id}`} className="text-xs">
                    {t("listing.altText")}
                  </Label>
                  <Input
                    id={`new-alt-${image.id}`}
                    value={image.altText}
                    onChange={(event) =>
                      setNewImages((current) =>
                        current.map((item) => (item.id === image.id ? { ...item, altText: event.target.value } : item))
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ImagePlus className="size-4" />
            {t("listing.noNewImages")}
          </div>
        </div>
      )}
    </div>
  );
}
