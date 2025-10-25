import { EnhancedDetectionCanvas } from "./EnhancedDetectionCanvas";
import { ImageItem, Label, BoundingBox } from "@/types/annotation";
import { GridMode } from "@/types/gridMode";

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
  const getGridClass = (): string => {
    switch (gridMode) {
      case "grid4":
        return "grid grid-cols-2 gap-4";
      case "grid6":
        return "grid grid-cols-3 gap-4";
      case "grid8":
        return "grid grid-cols-4 gap-4";
      case "grid12":
        return "grid grid-cols-4 gap-3";
      default:
        return "";
    }
  };

  const getImageHeight = (): string => {
    switch (gridMode) {
      case "grid4":
        return "450px";
      case "grid6":
        return "380px";
      case "grid8":
        return "320px";
      case "grid12":
        return "280px";
      default:
        return "400px";
    }
  };

  return (
    <div className={getGridClass()}>
      {images.map((img) => (
        <div
          key={img.id}
          className={`relative bg-card rounded-lg overflow-hidden border-2 transition-all ${
            selectedImageId === img.id
              ? "border-primary shadow-lg"
              : "border-border hover:border-primary/50"
          }`}
          style={{ height: getImageHeight() }}
        >
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
          />
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
          <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex justify-between items-center pointer-events-none">
            <span className="truncate">{img.name}</span>
            <span className="ml-2 font-semibold">{(img.annotations.boxes || []).length} boxes</span>
          </div>
        </div>
      ))}
    </div>
  );
};
