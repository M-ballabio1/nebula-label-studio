import { useState } from "react";
import { Header } from "@/components/Header";
import { AnnotationModeSelector } from "@/components/AnnotationModeSelector";
import { AnnotationToolbar } from "@/components/AnnotationToolbar";
import { ThumbnailGallery } from "@/components/ThumbnailGallery";
import { ImageFilterBar } from "@/components/ImageFilterBar";
import { SidebarContent } from "@/components/SidebarContent";
import { AnnotationContent } from "@/components/AnnotationContent";
import { ExportModal } from "@/components/ExportModal";
import { SaveAnimation } from "@/components/SaveAnimation";
import { useAnnotationState } from "@/hooks/useAnnotationState";
import { useImageFilters } from "@/hooks/useImageFilters";
import { useImageNavigation } from "@/hooks/useImageNavigation";
import { useAnnotationHandlers } from "@/hooks/useAnnotationHandlers";
import { useGridAnnotationHandlers } from "@/hooks/useGridAnnotationHandlers";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "sonner";

const Index = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [annotationsVisible, setAnnotationsVisible] = useState(true);
  const [annotationsLocked, setAnnotationsLocked] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

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

  useKeyboardShortcuts({
    labels,
    onSelectLabel: setSelectedLabelId,
    onPreviousImage: handlePreviousImage,
    onNextImage: handleNextImage,
    onSave: () => setShowSaveAnimation(true),
    canGoPrevious,
    canGoNext,
  });

  const handleSave = () => {
    setShowSaveAnimation(true);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    toast.success("Filters reset");
  };

  const handleRotate = () => toast.info("Rotate 90° clockwise");
  const handleFlipH = () => toast.info("Flip horizontal");
  const handleFlipV = () => toast.info("Flip vertical");

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
          <AnnotationModeSelector mode={mode} onModeChange={setMode} />
          <AnnotationToolbar
            onSave={handleSave}
            onExport={handleExport}
            currentImageName={selectedImage?.name}
            currentImagePath={selectedImage?.url}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPrevious={handlePreviousImage}
            onNext={handleNextImage}
            annotationsVisible={annotationsVisible}
            annotationsLocked={annotationsLocked}
            onToggleVisibility={() => setAnnotationsVisible(!annotationsVisible)}
            onToggleLock={() => setAnnotationsLocked(!annotationsLocked)}
            brightness={brightness}
            contrast={contrast}
            saturation={saturation}
            onBrightnessChange={setBrightness}
            onContrastChange={setContrast}
            onSaturationChange={setSaturation}
            onRotate={handleRotate}
            onFlipH={handleFlipH}
            onFlipV={handleFlipV}
            onResetFilters={handleResetFilters}
          />

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

      <ExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        mode={mode}
        images={images}
        labels={labels}
      />

      <SaveAnimation
        show={showSaveAnimation}
        onComplete={() => {
          setShowSaveAnimation(false);
          toast.success("Annotations saved successfully!");
        }}
      />
    </div>
  );
};

export default Index;
