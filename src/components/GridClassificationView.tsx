import { ClassificationPanel } from "./ClassificationPanel";
import { ImageItem, Label } from "@/types/annotation";
import { getGridImageHeight } from "@/utils/gridUtils";
import { GridMode, isMultiGrid } from "@/types/gridMode";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface GridClassificationViewProps {
  images: ImageItem[];
  labels: Label[];
  selectedImageId: string | null;
  selectedImageIds: string[];
  gridMode: GridMode;
  onToggleTag: (imageId: string, labelId: string) => void;
  onImageSelect: (imageId: string) => void;
  onToggleMultiSelect: (imageId: string) => void;
}

export const GridClassificationView = ({
  images,
  labels,
  selectedImageId,
  selectedImageIds,
  gridMode,
  onToggleTag,
  onImageSelect,
  onToggleMultiSelect,
}: GridClassificationViewProps) => {
  const isMulti = isMultiGrid(gridMode);
  return (
    <>
      {images.map((img) => {
        const isSelected = selectedImageIds.includes(img.id);
        const imageTags = img.annotations.tags || [];
        
        return (
          <div
            key={img.id}
            className={`relative bg-card rounded-lg overflow-hidden border-2 transition-all ${
              isSelected
                ? "border-primary shadow-lg ring-2 ring-primary/50"
                : selectedImageId === img.id
                ? "border-primary shadow-lg"
                : "border-border hover:border-primary/50"
            }`}
            style={{ minHeight: getGridImageHeight(gridMode) }}
          >
            {isMulti && (
              <div className="absolute top-2 left-2 z-10 pointer-events-auto">
                <div className="bg-card/90 backdrop-blur-sm p-1.5 rounded border border-border">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleMultiSelect(img.id)}
                    className="w-5 h-5"
                  />
                </div>
              </div>
            )}
            
            <div
              onClick={() => !isMulti && onImageSelect(img.id)}
              className={`${!isMulti ? "cursor-pointer" : ""} relative h-full`}
            >
              <ClassificationPanel
                imageUrl={img.url}
                tags={imageTags}
                labels={labels}
                onToggleTag={(labelId) => onToggleTag(img.id, labelId)}
              />
            </div>
            
            <div className="absolute bottom-2 left-2 right-2 bg-card/95 backdrop-blur-sm px-2 py-1.5 rounded pointer-events-none">
              <div className="font-medium truncate text-xs mb-1">{img.name}</div>
              {imageTags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {imageTags.map((tag) => {
                    const label = labels.find((l) => l.id === tag.labelId);
                    return label ? (
                      <Badge
                        key={tag.labelId}
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5"
                        style={{
                          backgroundColor: `${label.color}20`,
                          borderColor: label.color,
                          color: label.color,
                        }}
                      >
                        {label.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground text-xs">Nessuna label</div>
              )}
            </div>
            
            {!isMulti && (
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
            )}
          </div>
        );
      })}
    </>
  );
};
