import { EnhancedSegmentationCanvas } from "./EnhancedSegmentationCanvas";
import { ImageItem, Label, SegmentationPolygon } from "@/types/annotation";
import { getGridImageHeight } from "@/utils/gridUtils";
import { GridMode } from "@/types/gridMode";

interface GridSegmentationViewProps {
  images: ImageItem[];
  labels: Label[];
  selectedLabelId: string | null;
  selectedImageId: string | null;
  gridMode: GridMode;
  onAddPolygon: (imageId: string, polygon: Omit<SegmentationPolygon, "id">) => void;
  onDeletePolygon: (imageId: string, id: string) => void;
  onImageSelect: (imageId: string) => void;
  onImageDimensions: (
    imageId: string,
    dims: {
      original: { width: number; height: number };
      normalized: { width: number; height: number };
    }
  ) => void;
}

export const GridSegmentationView = ({
  images,
  labels,
  selectedLabelId,
  selectedImageId,
  gridMode,
  onAddPolygon,
  onDeletePolygon,
  onImageSelect,
  onImageDimensions,
}: GridSegmentationViewProps) => {
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
            <EnhancedSegmentationCanvas
              imageUrl={img.url}
              labels={labels}
              selectedLabelId={selectedLabelId}
              polygons={img.annotations.polygons || []}
              onAddPolygon={(polygon) => onAddPolygon(img.id, polygon)}
              onDeletePolygon={(id) => onDeletePolygon(img.id, id)}
              onImageDimensions={(dims) => onImageDimensions(img.id, dims)}
            />
          </div>
          <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs pointer-events-none">
            <div className="font-medium truncate">{img.name}</div>
            <div className="text-muted-foreground">
              {img.annotations.polygons?.length || 0} polygons
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
