import { AnnotationMode, Label, ImageItem, BoundingBox } from "@/types/annotation";
import { GridMode } from "@/types/gridMode";
import { EnhancedDetectionCanvas } from "./EnhancedDetectionCanvas";
import { ClassificationPanel } from "./ClassificationPanel";
import { EnhancedSegmentationCanvas } from "./EnhancedSegmentationCanvas";
import { AudioAnnotationCanvas } from "./AudioAnnotationCanvas";
import { TextAnnotationCanvas } from "./TextAnnotationCanvas";
import { GridDetectionView } from "./GridDetectionView";
import { GridSegmentationView } from "./GridSegmentationView";
import { GridClassificationView } from "./GridClassificationView";
import { getGridClass, getDisplayImages } from "@/utils/gridUtils";
import { SAMPLE_AUDIO_URL, SAMPLE_TEXT } from "@/config/sampleData";

interface AnnotationContentProps {
  mode: AnnotationMode;
  gridMode: GridMode;
  selectedImage: ImageItem | undefined;
  filteredImages: ImageItem[];
  labels: Label[];
  selectedLabelId: string | null;
  selectedImageId: string | null;
  audioSegments: any[];
  textAnnotations: any[];
  imageDimensions: { width: number; height: number };
  segmentationImageDimensions: any;
  onAddBox: (box: Omit<BoundingBox, "id">) => void;
  onDeleteBox: (id: string) => void;
  onUpdateBox: (id: string, updates: Partial<BoundingBox>) => void;
  onAddPolygon: (polygon: any) => void;
  onDeletePolygon: (id: string) => void;
  onToggleTag: (labelId: string) => void;
  onAddAudioSegment: (segment: any) => void;
  onDeleteAudioSegment: (id: string) => void;
  onAddTextAnnotation: (annotation: any) => void;
  onImageDimensions: (dims: { width: number; height: number }) => void;
  onNormalizedDimensions: (dims: { width: number; height: number }) => void;
  onSegmentationImageDimensions: (dims: any) => void;
  onBoxSelect: (box: BoundingBox | null) => void;
  onBoxHover: (box: BoundingBox | null) => void;
  onGridAddBox: (imageId: string, box: Omit<BoundingBox, "id">) => void;
  onGridDeleteBox: (imageId: string, id: string) => void;
  onGridUpdateBox: (imageId: string, id: string, updates: Partial<BoundingBox>) => void;
  onGridAddPolygon: (imageId: string, polygon: any) => void;
  onGridDeletePolygon: (imageId: string, id: string) => void;
  onGridToggleTag: (imageId: string, labelId: string) => void;
  onImageSelect: (imageId: string) => void;
  activeTool?: "select" | "pan" | "draw" | "erase" | "measure";
  imageTransform?: { rotation: number; flipH: boolean; flipV: boolean };
  imageFilters?: { brightness: number; contrast: number; saturation: number };
  showAnnotations?: boolean;
  lockAnnotations?: boolean;
}

export const AnnotationContent = ({
  mode,
  gridMode,
  selectedImage,
  filteredImages,
  labels,
  selectedLabelId,
  selectedImageId,
  audioSegments,
  textAnnotations,
  imageDimensions,
  segmentationImageDimensions,
  onAddBox,
  onDeleteBox,
  onUpdateBox,
  onAddPolygon,
  onDeletePolygon,
  onToggleTag,
  onAddAudioSegment,
  onDeleteAudioSegment,
  onAddTextAnnotation,
  onImageDimensions,
  onNormalizedDimensions,
  onSegmentationImageDimensions,
  onBoxSelect,
  onBoxHover,
  onGridAddBox,
  onGridDeleteBox,
  onGridUpdateBox,
  onGridAddPolygon,
  onGridDeletePolygon,
  onGridToggleTag,
  onImageSelect,
  activeTool,
  imageTransform,
  imageFilters,
  showAnnotations,
  lockAnnotations,
}: AnnotationContentProps) => {
  const displayImages = getDisplayImages(gridMode, selectedImage, filteredImages);

  if (gridMode === "single") {
    return (
      <>
        {selectedImage && mode === "detection" && (
          <EnhancedDetectionCanvas
            imageUrl={selectedImage.url}
            boxes={selectedImage.annotations.boxes || []}
            labels={labels}
            selectedLabelId={selectedLabelId}
            onAddBox={onAddBox}
            onDeleteBox={onDeleteBox}
            onUpdateBox={onUpdateBox}
            onImageLoad={(dims) => {
              onImageDimensions(dims);
              const canvas = document.querySelector("canvas");
              if (canvas) {
                onNormalizedDimensions({
                  width: canvas.width,
                  height: canvas.height,
                });
              }
            }}
            onBoxSelect={onBoxSelect}
            onBoxHover={onBoxHover}
          />
        )}
        {selectedImage && mode === "classification" && (
          <ClassificationPanel
            imageUrl={selectedImage.url}
            tags={selectedImage.annotations.tags || []}
            labels={labels}
            onToggleTag={onToggleTag}
            onImageDimensions={(dims) => {
              onImageDimensions(dims.original);
              onNormalizedDimensions(dims.normalized);
            }}
          />
        )}
        {selectedImage && mode === "segmentation" && (
          <EnhancedSegmentationCanvas
            imageUrl={selectedImage.url}
            polygons={selectedImage.annotations.polygons || []}
            labels={labels}
            selectedLabelId={selectedLabelId}
            onAddPolygon={onAddPolygon}
            onDeletePolygon={onDeletePolygon}
            onImageDimensions={onSegmentationImageDimensions}
            activeTool={activeTool}
            imageTransform={imageTransform}
            imageFilters={imageFilters}
            showAnnotations={showAnnotations}
            lockAnnotations={lockAnnotations}
          />
        )}
        {mode === "audio" && (
          <AudioAnnotationCanvas
            audioUrl={SAMPLE_AUDIO_URL}
            segments={audioSegments}
            labels={labels}
            selectedLabelId={selectedLabelId}
            onAddSegment={onAddAudioSegment}
            onDeleteSegment={onDeleteAudioSegment}
          />
        )}
        {mode === "text" && (
          <TextAnnotationCanvas
            text={SAMPLE_TEXT}
            annotations={textAnnotations}
            labels={labels}
            selectedLabelId={selectedLabelId}
            onAddAnnotation={onAddTextAnnotation}
          />
        )}
      </>
    );
  }

  return (
    <div className={`p-4 ${getGridClass(gridMode)}`}>
      {mode === "detection" && (
        <GridDetectionView
          images={displayImages}
          labels={labels}
          selectedLabelId={selectedLabelId}
          selectedImageId={selectedImageId}
          gridMode={gridMode}
          onAddBox={onGridAddBox}
          onDeleteBox={onGridDeleteBox}
          onUpdateBox={onGridUpdateBox}
          onImageSelect={onImageSelect}
          onBoxSelect={(imageId, box) => {
            onImageSelect(imageId);
            onBoxSelect(box);
          }}
          onBoxHover={(imageId, box) => {
            if (selectedImageId === imageId) onBoxHover(box);
          }}
          onImageLoad={(imageId, dims) => {
            if (selectedImageId === imageId) {
              onImageDimensions(dims);
              onNormalizedDimensions(dims);
            }
          }}
        />
      )}
      {mode === "segmentation" && (
        <GridSegmentationView
          images={displayImages}
          labels={labels}
          selectedLabelId={selectedLabelId}
          selectedImageId={selectedImageId}
          gridMode={gridMode}
          onAddPolygon={onGridAddPolygon}
          onDeletePolygon={onGridDeletePolygon}
          onImageSelect={onImageSelect}
          onImageDimensions={(imageId, dims) => {
            if (selectedImageId === imageId) {
              onSegmentationImageDimensions(dims);
            }
          }}
        />
      )}
      {mode === "classification" && (
        <GridClassificationView
          images={displayImages}
          labels={labels}
          selectedImageId={selectedImageId}
          gridMode={gridMode}
          onToggleTag={onGridToggleTag}
          onImageSelect={onImageSelect}
        />
      )}
    </div>
  );
};
