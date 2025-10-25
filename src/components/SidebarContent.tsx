import { AnnotationMode, Label, ImageItem, BoundingBox } from "@/types/annotation";
import { LabelSidebar } from "./LabelSidebar";
import { LabelSidebarUnified } from "./LabelSidebarUnified";
import { AudioSidebar } from "./AudioSidebar";
import { BoxRecapPanel } from "./BoxRecapPanel";
import { PolygonRecapPanel } from "./PolygonRecapPanel";
import { TagRecapPanel } from "./TagRecapPanel";
import { TextAnnotationsList } from "./TextAnnotationsList";

interface SidebarContentProps {
  mode: AnnotationMode;
  labels: Label[];
  selectedLabelId: string | null;
  selectedImage: ImageItem | undefined;
  imageDimensions: { width: number; height: number };
  normalizedDimensions: { width: number; height: number };
  segmentationImageDimensions: any;
  selectedBox: BoundingBox | null;
  hoveredBox: BoundingBox | null;
  audioSegments: any[];
  textAnnotations: any[];
  onSelectLabel: (id: string | null) => void;
  onAddLabel: (label: Omit<Label, "id">) => void;
  onDeleteLabel: (id: string) => void;
  onToggleTag: (labelId: string) => void;
  onDeleteBox: (id: string) => void;
  onDeletePolygon: (id: string) => void;
  onDeleteSegment: (id: string) => void;
  onDeleteTextAnnotation: (id: string) => void;
  onSelectBox: (box: BoundingBox | null) => void;
}

export const SidebarContent = ({
  mode,
  labels,
  selectedLabelId,
  selectedImage,
  imageDimensions,
  normalizedDimensions,
  segmentationImageDimensions,
  selectedBox,
  hoveredBox,
  audioSegments,
  textAnnotations,
  onSelectLabel,
  onAddLabel,
  onDeleteLabel,
  onToggleTag,
  onDeleteBox,
  onDeletePolygon,
  onDeleteSegment,
  onDeleteTextAnnotation,
  onSelectBox,
}: SidebarContentProps) => {
  return (
    <div className="w-80 border-r bg-card flex flex-col overflow-hidden">
      {mode === "classification" ? (
        <LabelSidebarUnified
          labels={labels}
          selectedLabelId={selectedLabelId}
          onSelectLabel={onSelectLabel}
          onAddLabel={onAddLabel}
          onDeleteLabel={onDeleteLabel}
          isClassificationMode={true}
          tags={selectedImage?.annotations.tags || []}
          onToggleTag={onToggleTag}
        >
          <div className="border-t p-4">
            <h4 className="text-sm font-semibold mb-2">Image Info</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                Original: {imageDimensions.width}x{imageDimensions.height}px
              </div>
            </div>
          </div>
          {selectedImage && (
            <TagRecapPanel tags={selectedImage.annotations.tags || []} labels={labels} onRemoveTag={onToggleTag} />
          )}
        </LabelSidebarUnified>
      ) : mode === "text" ? (
        <>
          <LabelSidebar
            labels={labels}
            selectedLabelId={selectedLabelId}
            onSelectLabel={onSelectLabel}
            onAddLabel={onAddLabel}
            onDeleteLabel={onDeleteLabel}
          />
          <TextAnnotationsList
            annotations={textAnnotations}
            labels={labels}
            onDeleteAnnotation={onDeleteTextAnnotation}
          />
        </>
      ) : (
        <>
          <LabelSidebar
            labels={labels}
            selectedLabelId={selectedLabelId}
            onSelectLabel={onSelectLabel}
            onAddLabel={onAddLabel}
            onDeleteLabel={onDeleteLabel}
            imageDimensions={
              mode === "detection"
                ? imageDimensions
                : mode === "segmentation"
                  ? segmentationImageDimensions?.original
                  : undefined
            }
            normalizedDimensions={
              mode === "detection"
                ? normalizedDimensions
                : mode === "segmentation"
                  ? segmentationImageDimensions?.normalized
                  : undefined
            }
            boxes={mode === "detection" && selectedImage ? selectedImage.annotations.boxes : undefined}
            selectedBox={mode === "detection" ? selectedBox : undefined}
            hoveredBox={mode === "detection" ? hoveredBox : undefined}
          />
          {mode === "detection" && selectedImage && (
            <BoxRecapPanel
              boxes={selectedImage.annotations.boxes || []}
              labels={labels}
              selectedBoxId={selectedBox?.id || null}
              onSelectBox={(id) => {
                const box = selectedImage.annotations.boxes?.find((b) => b.id === id);
                if (box) onSelectBox(box);
              }}
              onDeleteBox={onDeleteBox}
            />
          )}
          {mode === "segmentation" && selectedImage && (
            <PolygonRecapPanel
              polygons={selectedImage.annotations.polygons || []}
              labels={labels}
              imageDimensions={segmentationImageDimensions || undefined}
              onDeletePolygon={onDeletePolygon}
            />
          )}
        </>
      )}
    </div>
  );
};
