import { ImageItem } from "@/types/annotation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";

interface ThumbnailGalleryProps {
  images: ImageItem[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
}

export const ThumbnailGallery = ({
  images,
  selectedImageId,
  onSelectImage,
}: ThumbnailGalleryProps) => {
  return (
    <div className="h-32 border-t bg-card">
      <ScrollArea className="h-full">
        <div className="flex gap-2 p-2">
          {images.map((image) => {
            const isSelected = selectedImageId === image.id;
            const hasAnnotations = 
              (image.annotations.boxes && image.annotations.boxes.length > 0) ||
              (image.annotations.polygons && image.annotations.polygons.length > 0) ||
              (image.annotations.tags && image.annotations.tags.length > 0);

            return (
              <div
                key={image.id}
                className={`relative flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-primary scale-105 glow-primary"
                    : "hover:ring-2 hover:ring-primary/50"
                }`}
                onClick={() => onSelectImage(image.id)}
              >
                <img
                  src={image.thumbnailUrl}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                {hasAnnotations && (
                  <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                    <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">{image.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
