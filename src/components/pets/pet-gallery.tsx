"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ZoomIn, X } from "lucide-react";

import type { PetImage } from "@/types/app";

export function PetGallery({ images, name, isAdopted = false }: { images: PetImage[]; name: string; isAdopted?: boolean }) {
  const safeImages = images.length
    ? images
    : [{ publicUrl: "/reference/hero-adoptame-panama.png", altText: `${name} en adopción`, sortOrder: 0 }];

  const [activeImage, setActiveImage] = useState(safeImages[0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div 
          className="group/gallery relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-lg md:aspect-auto md:h-[380px] lg:h-[500px] cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            alt={activeImage?.altText ?? `${name} en adopción`}
            className="object-cover transition-all duration-700 hover:scale-105"
            fill
            priority
            sizes="(min-width: 1280px) 1000px, (min-width: 768px) 70vw, 100vw"
            src={activeImage?.publicUrl ?? "/reference/hero-adoptame-panama.png"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          
          <div className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-primary shadow-xl backdrop-blur-md transition-transform group-hover/gallery:scale-110">
            <ZoomIn className="size-6" />
          </div>

          {isAdopted && (
            <div className="absolute bottom-0 right-0 z-30 h-24 w-24 overflow-hidden rounded-br-2xl">
              <div className="absolute bottom-[18px] right-[-24px] w-[110px] -rotate-45 bg-secondary px-1 py-1.5 text-center text-xs font-black uppercase tracking-widest text-secondary-foreground shadow-lg">
                Adoptado
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-row gap-3 overflow-x-auto pb-2 md:flex-col md:overflow-x-visible md:pb-0">
          {safeImages.map((image, index) => (
            <button
              key={`${image.publicUrl}-${index}`}
              onClick={() => setActiveImage(image)}
              className={cn(
                "relative size-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 md:size-24",
                activeImage?.publicUrl === image.publicUrl 
                  ? "border-primary scale-105 shadow-md" 
                  : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
              )}
            >
              <Image 
                alt={image.altText} 
                className="object-cover" 
                fill 
                sizes="100px" 
                src={image.publicUrl} 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Simple Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button with high z-index and large hit area */}
          <button 
            className="absolute right-4 top-4 md:right-8 md:top-8 z-[120] rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-all active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            aria-label="Cerrar galería"
          >
            <X className="size-8" />
          </button>
          
          <div className="relative h-[85vh] w-[90vw] flex items-center justify-center">
            <Image
              alt={activeImage?.altText ?? name}
              className="object-contain select-none pointer-events-none"
              fill
              src={activeImage?.publicUrl ?? "/reference/hero-adoptame-panama.png"}
              sizes="90vw"
              priority
            />
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 px-4 text-white text-center pointer-events-none">
            <p className="text-lg md:text-xl font-bold drop-shadow-md">{name}</p>
            {activeImage?.altText && (
              <p className="text-sm opacity-70 drop-shadow-sm">{activeImage.altText}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
