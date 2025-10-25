import { Header } from "@/components/Header";
import { AnnotationToolbar } from "@/components/AnnotationToolbar";
import { ThumbnailGallery } from "@/components/ThumbnailGallery";
import { ImageNavigationBar } from "@/components/ImageNavigationBar";
import { ImageFilterBar } from "@/components/ImageFilterBar";
import { SidebarContent } from "@/components/SidebarContent";
import { AnnotationContent } from "@/components/AnnotationContent";
import { useAnnotationState } from "@/hooks/useAnnotationState";
import { useImageFilters } from "@/hooks/useImageFilters";
import { useImageNavigation } from "@/hooks/useImageNavigation";
import { useAnnotationHandlers } from "@/hooks/useAnnotationHandlers";
import { useGridAnnotationHandlers } from "@/hooks/useGridAnnotationHandlers";
import { useHotkeys } from "@/hooks/useHotkeys";

const Index = () => {
  const {
    mode,
    setMode,
    labels,
    setLabels,
    selectedLabelId,
    setSelectedLabelId,
    images,
    setImages,
    selectedImageId,
    setSelectedImageId,
    imageDimensions,
    setImageDimensions,
    normalizedDimensions,
    setNormalizedDimensions,
    selectedBox,
    setSelectedBox,
    hoveredBox,
    setHoveredBox,
    segmentationImageDimensions,
    setSegmentationImageDimensions,
    filters,
    setFilters,
    gridMode,
    setGridMode,
    selectedImage,
  } = useAnnotationState();

  const filteredImages = useImageFilters(images, filters);

  const { currentImageIndex, handlePreviousImage, handleNextImage, canGoPrevious, canGoNext } =
    useImageNavigation(filteredImages, selectedImageId, setSelectedImageId);

  const {
    handleAddLabel,
    handleDeleteLabel,
    handleAddBox,
    handleUpdateBox,
    handleDeleteBox,
    handleAddPolygon,
    handleDeletePolygon,
    handleToggleTag,
    handleAddAudioSegment,
    handleDeleteAudioSegment,
    handleAddTextAnnotation,
    handleDeleteTextAnnotation,
    audioSegments,
    textAnnotations,
  } = useAnnotationHandlers(
    images,
    setImages,
    selectedImageId,
    labels,
    setLabels,
    selectedLabelId,
    setSelectedLabelId
  );

  const {
    handleGridAddBox,
    handleGridDeleteBox,
    handleGridUpdateBox,
    handleGridAddPolygon,
    handleGridDeletePolygon,
    handleGridToggleTag,
  } = useGridAnnotationHandlers(images, setImages, setSelectedImageId);

  useHotkeys(labels, setSelectedLabelId);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header mode={mode} images={images} labels={labels} />
      <div className="flex-1 flex overflow-hidden">
        <SidebarContent
          mode={mode}
          labels={labels}
          selectedLabelId={selectedLabelId}
          selectedImage={selectedImage}
          imageDimensions={imageDimensions}
          normalizedDimensions={normalizedDimensions}
          segmentationImageDimensions={segmentationImageDimensions}
          selectedBox={selectedBox}
          hoveredBox={hoveredBox}
          audioSegments={audioSegments}
          textAnnotations={textAnnotations}
          onSelectLabel={setSelectedLabelId}
          onAddLabel={handleAddLabel}
          onDeleteLabel={handleDeleteLabel}
          onToggleTag={handleToggleTag}
          onDeleteBox={handleDeleteBox}
          onDeletePolygon={handleDeletePolygon}
          onDeleteSegment={handleDeleteAudioSegment}
          onDeleteTextAnnotation={handleDeleteTextAnnotation}
          onSelectBox={setSelectedBox}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AnnotationToolbar mode={mode} onModeChange={setMode} />

          {(mode === "detection" ||
            mode === "segmentation" ||
            mode === "classification" ||
            mode === "audio" ||
            mode === "text") && (
            <ImageFilterBar
              labels={labels}
              selectedFilters={filters}
              onFilterChange={setFilters}
              gridMode={gridMode}
              onGridModeChange={setGridMode}
              mode={mode}
            />
          )}

          {mode === "detection" && (
            <ImageNavigationBar
              currentImageName={selectedImage?.name || ""}
              currentImagePath={selectedImage?.url || ""}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              onPrevious={handlePreviousImage}
              onNext={handleNextImage}
            />
          )}

          <div className="flex-1 overflow-auto bg-muted/20">
            <AnnotationContent
              mode={mode}
              gridMode={gridMode}
              selectedImage={selectedImage}
              filteredImages={filteredImages}
              labels={labels}
              selectedLabelId={selectedLabelId}
              selectedImageId={selectedImageId}
              audioSegments={audioSegments}
              textAnnotations={textAnnotations}
              imageDimensions={imageDimensions}
              segmentationImageDimensions={segmentationImageDimensions}
              onAddBox={handleAddBox}
              onDeleteBox={handleDeleteBox}
              onUpdateBox={handleUpdateBox}
              onAddPolygon={handleAddPolygon}
              onDeletePolygon={handleDeletePolygon}
              onToggleTag={handleToggleTag}
              onAddAudioSegment={handleAddAudioSegment}
              onDeleteAudioSegment={handleDeleteAudioSegment}
              onAddTextAnnotation={handleAddTextAnnotation}
              onImageDimensions={setImageDimensions}
              onNormalizedDimensions={setNormalizedDimensions}
              onSegmentationImageDimensions={setSegmentationImageDimensions}
              onBoxSelect={setSelectedBox}
              onBoxHover={setHoveredBox}
              onGridAddBox={handleGridAddBox}
              onGridDeleteBox={handleGridDeleteBox}
              onGridUpdateBox={handleGridUpdateBox}
              onGridAddPolygon={handleGridAddPolygon}
              onGridDeletePolygon={handleGridDeletePolygon}
              onGridToggleTag={handleGridToggleTag}
              onImageSelect={setSelectedImageId}
            />
          </div>

          {gridMode === "single" && (
            <ThumbnailGallery
              images={filteredImages}
              selectedImageId={selectedImageId}
              onSelectImage={setSelectedImageId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
