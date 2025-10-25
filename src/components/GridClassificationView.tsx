import { ClassificationPanel } from "./ClassificationPanel";
import { ImageItem, Label } from "@/types/annotation";
import { getGridImageHeight } from "@/utils/gridUtils";
import { GridMode } from "@/types/gridMode";

interface GridClassificationViewProps {
  images: ImageItem[];
  labels: Label[];
  selectedImageId: string | null;
  gridMode: GridMode;
  onToggleTag: (imageId: string, labelId: string) => void;
  onImageSelect: (imageId: string) => void;
}

export const GridClassificationView = ({
  images,
  labels,
  selectedImageId,
  gridMode,
  onToggleTag,
  onImageSelect,
}: GridClassificationViewProps) => {
  return (
    <>
      {images.map((img) => (
        <div
          key={img.id}
          className={`relative bg-card rounded-lg overflow-hidden border-2 transition-all ${
            selectedImageId === img.id
              ? "border-primary shadow-lg"
              : "border-border hover:border-primary/50"
          }`}
          style={{ minHeight: getGridImageHeight(gridMode) }}
        >
          <div
            onClick={() => onImageSelect(img.id)}
            className="cursor-pointer relative h-full"
          >
            <ClassificationPanel
              imageUrl={img.url}
              tags={img.annotations.tags || []}
              labels={labels}
              onToggleTag={(labelId) => onToggleTag(img.id, labelId)}
            />
          </div>
          <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs pointer-events-none">
            <div className="font-medium truncate">{img.name}</div>
            <div className="text-muted-foreground">
              {img.annotations.tags?.length || 0} tags
            </div>
          </div>
          <div
            onClick={() => onImageSelect(img.id)}
            className="absolute inset-0 pointer-events-auto border-2 rounded-lg transition-all cursor-pointer"
            style={{
              borderColor:
                selectedImageId === img.id ? "hsl(var(--primary))" : "transparent",
              boxShadow:
                selectedImageId === img.id
                  ? "0 0 0 3px hsl(var(--primary) / 0.2)"
                  : "none",
            }}
          />
        </div>
      ))}
    </>
  );
};
