import { useState } from "react";
import { AnnotationModeSelector } from "@/components/AnnotationModeSelector";
import { AnnotationToolbar } from "@/components/AnnotationToolbar";
import { ThumbnailGallery } from "@/components/ThumbnailGallery";
import { ImageFilterBar } from "@/components/ImageFilterBar";
import { SidebarContent } from "@/components/SidebarContent";
import { AnnotationContent } from "@/components/AnnotationContent";
import { ExportModal } from "@/components/ExportModal";
import { SaveAnimation } from "@/components/SaveAnimation";
import { Header } from "@/components/Header";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAnnotationState } from "@/hooks/useAnnotationState";
import { useImageFilters } from "@/hooks/useImageFilters";
import { useImageNavigation } from "@/hooks/useImageNavigation";
import { useAnnotationHandlers } from "@/hooks/useAnnotationHandlers";
import { useGridAnnotationHandlers } from "@/hooks/useGridAnnotationHandlers";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useVideos } from "@/hooks/useVideos";
import { isMultiGrid } from "@/types/gridMode";
import { toast } from "sonner";

const Index = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [zoom, setZoom] = useState(1);

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
    canvasTool,
    setCanvasTool,
    imageTransform,
    setImageTransform,
    imageFilters,
    setImageFilters,
    showAnnotations,
    setShowAnnotations,
    lockAnnotations,
    setLockAnnotations,
    videos,
    setVideos,
    selectedVideoId,
    setSelectedVideoId,
    selectedFrameId,
    setSelectedFrameId,
    selectedVideo,
  } = useAnnotationState();

  const filteredImages = useImageFilters(images, filters);

  const { currentImageIndex, handlePreviousImage, handleNextImage, canGoPrevious, canGoNext } =
    useImageNavigation(filteredImages, selectedImageId, setSelectedImageId);
  
  const { 
    uploadVideo, 
    addFrameToVideo,
  } = useVideos(videos, setVideos);
  
  // Sync video upload handler
  const handleVideoUploadInternal = async (file: File) => {
    await uploadVideo(file);
  };

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

  const handleFirstImage = () => {
    if (filteredImages.length > 0) {
      setSelectedImageId(filteredImages[0].id);
    }
  };

  const handleLastImage = () => {
    if (filteredImages.length > 0) {
      setSelectedImageId(filteredImages[filteredImages.length - 1].id);
    }
  };

  const handleSave = () => {
    setShowSaveAnimation(true);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(3, z * 1.2));
    toast.info(`Zoom: ${Math.round(Math.min(3, zoom * 1.2) * 100)}%`);
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.5, z / 1.2));
    toast.info(`Zoom: ${Math.round(Math.max(0.5, zoom / 1.2) * 100)}%`);
  };

  const handleZoomReset = () => {
    setZoom(1);
    toast.info("Zoom reset to 100%");
  };

  useKeyboardShortcuts(labels, setSelectedLabelId, {
    onNextImage: handleNextImage,
    onPreviousImage: handlePreviousImage,
    onFirstImage: handleFirstImage,
    onLastImage: handleLastImage,
    onSave: handleSave,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onZoomReset: handleZoomReset,
  });

  const handleFrameExtracted = (videoId: string) => (frame: any) => {
    addFrameToVideo(videoId, frame);
  };

  // Get current display item (image or video frame)
  const currentDisplayImage = selectedFrameId && selectedVideo 
    ? selectedVideo.frames.find(f => f.id === selectedFrameId)
      ? {
          id: selectedFrameId,
          url: selectedVideo.frames.find(f => f.id === selectedFrameId)!.imageUrl,
          thumbnailUrl: selectedVideo.frames.find(f => f.id === selectedFrameId)!.thumbnailUrl,
          name: `${selectedVideo.name} - Frame ${selectedVideo.frames.find(f => f.id === selectedFrameId)!.frameNumber}`,
          annotations: { boxes: [], polygons: [], tags: [] },
        }
      : undefined
    : selectedImage;

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header 
        mode={mode} 
        images={images} 
        labels={labels} 
        onVideoUpload={handleVideoUploadInternal}
      />
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
          <AnnotationModeSelector mode={mode} onModeChange={setMode} images={images} labels={labels} />
          <AnnotationToolbar
            activeTool={canvasTool}
            onToolChange={setCanvasTool}
            imageTransform={imageTransform}
            onTransformChange={setImageTransform}
            imageFilters={imageFilters}
            onFiltersChange={setImageFilters}
            showAnnotations={showAnnotations}
            onShowAnnotationsChange={setShowAnnotations}
            lockAnnotations={lockAnnotations}
            onLockAnnotationsChange={setLockAnnotations}
            onSave={handleSave}
            onExport={handleExport}
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
            {selectedVideoId && selectedVideo && !selectedFrameId ? (
              <div className="h-full p-4">
                <VideoPlayer
                  video={selectedVideo}
                  onFrameExtracted={handleFrameExtracted(selectedVideoId)}
                  onFrameSelect={setSelectedFrameId}
                  selectedFrameId={selectedFrameId}
                />
              </div>
            ) : (
              <AnnotationContent
                mode={mode}
                gridMode={gridMode}
                selectedImage={currentDisplayImage}
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
                currentImageName={currentDisplayImage?.name}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                onPrevious={handlePreviousImage}
                onNext={handleNextImage}
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
                activeTool={canvasTool}
                imageTransform={imageTransform}
                imageFilters={imageFilters}
                showAnnotations={showAnnotations}
                lockAnnotations={lockAnnotations}
              />
            )}
          </div>

          {!isMultiGrid(gridMode) && (
            <ThumbnailGallery
              images={filteredImages}
              videos={videos}
              selectedImageId={selectedImageId}
              selectedVideoId={selectedVideoId}
              selectedFrameId={selectedFrameId}
              onSelectImage={setSelectedImageId}
              onSelectVideo={setSelectedVideoId}
              onSelectFrame={(videoId, frameId) => {
                setSelectedVideoId(videoId);
                setSelectedFrameId(frameId);
              }}
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
