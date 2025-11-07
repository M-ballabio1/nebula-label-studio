import { EnhancedDetectionCanvas } from "./EnhancedDetectionCanvas";
import { ImageItem, Label, BoundingBox } from "@/types/annotation";
import { getGridImageHeight } from "@/utils/gridUtils";
import { GridMode, isMultiGrid } from "@/types/gridMode";

interface GridDetectionViewProps {
  images: ImageItem[];
  labels: Label[];
  selectedLabelId: string | null;
  selectedImageId: string | null;
  gridMode: GridMode;
  onAddBox: (imageId: string, box: Omit<BoundingBox, "id">) => void;
  onDeleteBox: (imageId: string, id: string) => void;
  onUpdateBox: (imageId: string, id: string, updates: Partial<BoundingBox>) => void;
  onImageSelect: (imageId: string) => void;
  onBoxSelect: (imageId: string, box: BoundingBox | null) => void;
  onBoxHover: (imageId: string, box: BoundingBox | null) => void;
  onImageLoad: (imageId: string, dims: { width: number; height: number }) => void;
}

export const GridDetectionView = ({
  images,
  labels,
  selectedLabelId,
  selectedImageId,
  gridMode,
  onAddBox,
  onDeleteBox,
  onUpdateBox,
  onImageSelect,
  onBoxSelect,
  onBoxHover,
  onImageLoad,
}: GridDetectionViewProps) => {
  const hideControls = isMultiGrid(gridMode);
  
  return (
    <>
      {images.map((img) => (
        <div
          key={img.id}
          className={`relative bg-card rounded-lg overflow-hidden border-2 transition-all ${
            selectedImageId === img.id
              ? "border-primary shadow-lg"
              : "border-border hover:border-primary/50"
          } ${hideControls ? "p-0" : ""}`}
          style={{ minHeight: getGridImageHeight(gridMode) }}
        >
          <div className={hideControls ? "w-full h-full" : ""}>
            <EnhancedDetectionCanvas
              imageUrl={img.url}
              boxes={img.annotations.boxes || []}
              labels={labels}
              selectedLabelId={selectedLabelId}
              onAddBox={(box) => onAddBox(img.id, box)}
              onDeleteBox={(id) => onDeleteBox(img.id, id)}
              onUpdateBox={(id, updates) => onUpdateBox(img.id, id, updates)}
              onImageLoad={(dims) => onImageLoad(img.id, dims)}
              onBoxSelect={(box) => {
                onImageSelect(img.id);
                onBoxSelect(img.id, box);
              }}
              onBoxHover={(box) => {
                if (selectedImageId === img.id) onBoxHover(img.id, box);
              }}
              hideControls={hideControls}
            />
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
