import { LabelSidebar } from "./LabelSidebar";
import { LabelSidebarUnified } from "./LabelSidebarUnified";
import { AudioSegmentsList } from "./AudioSegmentsList";
import { TextAnnotationsList } from "./TextAnnotationsList";
import { BoxRecapPanel } from "./BoxRecapPanel";
import { PolygonRecapPanel } from "./PolygonRecapPanel";
import { TagRecapPanel } from "./TagRecapPanel";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import {
  AnnotationMode,
  Label,
  ImageItem,
  BoundingBox,
  ClassificationTag,
  AudioSegment,
  TextAnnotation,
  SegmentationPolygon,
} from "@/types/annotation";

interface AppSidebarProps {
  mode: AnnotationMode;
  labels: Label[];
  selectedLabelId: string | null;
  onSelectLabel: (id: string) => void;
  onAddLabel: (label: Omit<Label, "id">) => void;
  onDeleteLabel: (id: string) => void;
  // Detection mode
  imageDimensions?: { width: number; height: number };
  normalizedDimensions?: { width: number; height: number };
  selectedBox?: BoundingBox | null;
  hoveredBox?: BoundingBox | null;
  selectedImage?: ImageItem;
  onDeleteBox?: (id: string) => void;
  // Classification mode
  tags?: ClassificationTag[];
  onToggleTag?: (labelId: string) => void;
  // Audio mode
  audioSegments?: AudioSegment[];
  onDeleteSegment?: (id: string) => void;
  // Text mode
  textAnnotations?: TextAnnotation[];
  onDeleteTextAnnotation?: (id: string) => void;
  // Segmentation mode
  segmentationImageDimensions?: {
    original: { width: number; height: number };
    normalized: { width: number; height: number };
  };
  onDeletePolygon?: (id: string) => void;
}

export const AppSidebar = ({
  mode,
  labels,
  selectedLabelId,
  onSelectLabel,
  onAddLabel,
  onDeleteLabel,
  imageDimensions,
  normalizedDimensions,
  selectedBox,
  hoveredBox,
  selectedImage,
  onDeleteBox,
  tags = [],
  onToggleTag,
  audioSegments = [],
  onDeleteSegment,
  textAnnotations = [],
  onDeleteTextAnnotation,
  segmentationImageDimensions,
  onDeletePolygon,
}: AppSidebarProps) => {
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="p-0">
        {mode === "audio" ? (
          <div className="flex h-full">
            <div className="w-64">
              <LabelSidebar
                labels={labels}
                selectedLabelId={selectedLabelId}
                onSelectLabel={onSelectLabel}
                onAddLabel={onAddLabel}
                onDeleteLabel={onDeleteLabel}
              />
            </div>
            <AudioSegmentsList
              segments={audioSegments}
              labels={labels}
              onDeleteSegment={onDeleteSegment!}
            />
          </div>
        ) : mode === "classification" ? (
          <LabelSidebarUnified
            labels={labels}
            selectedLabelId={selectedLabelId}
            onSelectLabel={onSelectLabel}
            onAddLabel={onAddLabel}
            onDeleteLabel={onDeleteLabel}
            isClassificationMode={true}
            tags={tags}
            onToggleTag={onToggleTag}
          >
            <div className="border-t p-4">
              <h4 className="text-sm font-semibold mb-2">Image Info</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  Original: {imageDimensions?.width || 0}x{imageDimensions?.height || 0}px
                </div>
              </div>
            </div>
            {selectedImage && (
              <TagRecapPanel
                tags={selectedImage.annotations.tags || []}
                labels={labels}
                onRemoveTag={onToggleTag!}
              />
            )}
          </LabelSidebarUnified>
        ) : mode === "text" ? (
          <div className="flex flex-col h-full">
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
              onDeleteAnnotation={onDeleteTextAnnotation!}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <LabelSidebar
              labels={labels}
              selectedLabelId={selectedLabelId}
              onSelectLabel={onSelectLabel}
              onAddLabel={onAddLabel}
              onDeleteLabel={onDeleteLabel}
              imageDimensions={mode === "detection" ? imageDimensions : mode === "segmentation" ? segmentationImageDimensions?.original : undefined}
              normalizedDimensions={mode === "detection" ? normalizedDimensions : mode === "segmentation" ? segmentationImageDimensions?.normalized : undefined}
              boxes={mode === "detection" && selectedImage ? selectedImage.annotations.boxes : undefined}
              selectedBox={mode === "detection" ? selectedBox : undefined}
              hoveredBox={mode === "detection" ? hoveredBox : undefined}
            />
            {mode === "detection" && selectedImage && onDeleteBox && (
              <BoxRecapPanel
                boxes={selectedImage.annotations.boxes || []}
                labels={labels}
                selectedBoxId={selectedBox?.id || null}
                onSelectBox={(id) => {
                  const box = selectedImage.annotations.boxes?.find((b) => b.id === id);
                  // We can't call setSelectedBox here, but parent handles this
                }}
                onDeleteBox={onDeleteBox}
              />
            )}
            {mode === "segmentation" && selectedImage && onDeletePolygon && (
              <PolygonRecapPanel
                polygons={selectedImage.annotations.polygons || []}
                labels={labels}
                imageDimensions={segmentationImageDimensions || undefined}
                onDeletePolygon={onDeletePolygon}
              />
            )}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
