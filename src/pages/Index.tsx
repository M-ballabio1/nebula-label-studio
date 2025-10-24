import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { LabelSidebar } from "@/components/LabelSidebar";
import { LabelSidebarUnified } from "@/components/LabelSidebarUnified";
import { AnnotationToolbar } from "@/components/AnnotationToolbar";
import { ThumbnailGallery } from "@/components/ThumbnailGallery";
import { EnhancedDetectionCanvas } from "@/components/EnhancedDetectionCanvas";
import { ClassificationPanel } from "@/components/ClassificationPanel";
import { EnhancedSegmentationCanvas } from "@/components/EnhancedSegmentationCanvas";
import { VideoAnnotationCanvas } from "@/components/VideoAnnotationCanvas";
import { AudioAnnotationCanvas } from "@/components/AudioAnnotationCanvas";
import { TextAnnotationCanvas } from "@/components/TextAnnotationCanvas";
import { ImageNavigationBar } from "@/components/ImageNavigationBar";
import { ImageFilterBar } from "@/components/ImageFilterBar";
import { BoxRecapPanel } from "@/components/BoxRecapPanel";
import { PolygonRecapPanel } from "@/components/PolygonRecapPanel";
import { TagRecapPanel } from "@/components/TagRecapPanel";
import {
  AnnotationMode,
  Label,
  ImageItem,
  BoundingBox,
  SegmentationPolygon,
  ClassificationTag,
  AudioSegment,
  TextAnnotation,
} from "@/types/annotation";
import { VideoFrame } from "@/types/video";
import { toast } from "sonner";

// Sample data
const INITIAL_LABELS: Label[] = [
  { id: "1", name: "Person", color: "#ef4444", hotkey: "1" },
  { id: "2", name: "Car", color: "#3b82f6", hotkey: "2" },
  { id: "3", name: "Building", color: "#22c55e", hotkey: "3" },
  { id: "4", name: "Tree", color: "#f59e0b", hotkey: "4" },
];

const SAMPLE_IMAGES: ImageItem[] = [
  {
    id: "img1",
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=120&h=120&fit=crop",
    name: "City Street",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img2",
    url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=120&h=120&fit=crop",
    name: "Mountain View",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img3",
    url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=120&h=120&fit=crop",
    name: "Urban Night",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img4",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&h=120&fit=crop",
    name: "Nature Scene",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
  {
    id: "img5",
    url: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=120&h=120&fit=crop",
    name: "Sunset Beach",
    annotations: { boxes: [], polygons: [], tags: [] },
  },
];

const SAMPLE_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const SAMPLE_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const SAMPLE_TEXT = "Natural Language Processing (NLP) is a subfield of artificial intelligence that focuses on the interaction between computers and humans through natural language. The ultimate objective of NLP is to read, decipher, understand, and make sense of human languages in a manner that is valuable. Most NLP techniques rely on machine learning to derive meaning from human languages. NLP is used to apply algorithms to identify and extract the natural language rules such that unstructured language data is converted into a form that computers can understand.";

type GridMode = "single" | "grid2" | "grid4" | "grid8";

const Index = () => {
  const [mode, setMode] = useState<AnnotationMode>("detection");
  const [labels, setLabels] = useState<Label[]>(INITIAL_LABELS);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(labels[0]?.id || null);
  const [images, setImages] = useState<ImageItem[]>(SAMPLE_IMAGES);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(images[0]?.id || null);
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [normalizedDimensions, setNormalizedDimensions] = useState({ width: 0, height: 0 });
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [hoveredBox, setHoveredBox] = useState<BoundingBox | null>(null);
  const [segmentationImageDimensions, setSegmentationImageDimensions] = useState<{
    original: { width: number; height: number };
    normalized: { width: number; height: number };
  } | null>(null);
  const [filters, setFilters] = useState<{ annotated: boolean | null; labelIds: string[] }>({
    annotated: null,
    labelIds: [],
  });
  const [gridMode, setGridMode] = useState<GridMode>("single");
  const [videoFrames, setVideoFrames] = useState<VideoFrame[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

  const selectedImage = images.find((img) => img.id === selectedImageId);

  // Hotkey shortcuts for label selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const label = labels.find((l) => l.hotkey === e.key);
      if (label) {
        setSelectedLabelId(label.id);
        toast.success(`Selected label: ${label.name}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [labels]);

  const filteredImages = images.filter((img) => {
    // Filter by annotation status
    if (filters.annotated !== null) {
      const hasAnnotations =
        (img.annotations.boxes && img.annotations.boxes.length > 0) ||
        (img.annotations.polygons && img.annotations.polygons.length > 0) ||
        (img.annotations.tags && img.annotations.tags.length > 0);
      if (filters.annotated !== hasAnnotations) return false;
    }

    // Filter by label
    if (filters.labelIds.length > 0) {
      const hasLabel = filters.labelIds.some((labelId) =>
        [
          ...(img.annotations.boxes || []),
          ...(img.annotations.polygons || []),
          ...(img.annotations.tags || []),
        ].some((ann: any) => ann.labelId === labelId)
      );
      if (!hasLabel) return false;
    }

    return true;
  });

  const currentImageIndex = filteredImages.findIndex((img) => img.id === selectedImageId);
  
  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setSelectedImageId(filteredImages[currentImageIndex - 1].id);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < filteredImages.length - 1) {
      setSelectedImageId(filteredImages[currentImageIndex + 1].id);
    }
  };

  const handleAddLabel = (label: Omit<Label, "id">) => {
    const newLabel: Label = {
      ...label,
      id: `label-${Date.now()}`,
    };
    setLabels([...labels, newLabel]);
    toast.success(`Label "${label.name}" added`);
  };

  const handleDeleteLabel = (id: string) => {
    setLabels(labels.filter((l) => l.id !== id));
    if (selectedLabelId === id) {
      setSelectedLabelId(labels[0]?.id || null);
    }
    toast.success("Label deleted");
  };

  const handleAddBox = (box: Omit<BoundingBox, "id">) => {
    if (!selectedImageId) return;
    const newBox: BoundingBox = {
      ...box,
      id: `box-${Date.now()}`,
    };
    setImages(
      images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              annotations: {
                ...img.annotations,
                boxes: [...(img.annotations.boxes || []), newBox],
              },
            }
          : img
      )
    );
    toast.success("Bounding box added");
  };

  const handleUpdateBox = (id: string, updates: Partial<BoundingBox>) => {
    if (!selectedImageId) return;
    setImages(
      images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              annotations: {
                ...img.annotations,
                boxes: (img.annotations.boxes || []).map((b) =>
                  b.id === id ? { ...b, ...updates } : b
                ),
              },
            }
          : img
      )
    );
  };

  const handleDeleteBox = (id: string) => {
    if (!selectedImageId) return;
    setImages(
      images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              annotations: {
                ...img.annotations,
                boxes: (img.annotations.boxes || []).filter((b) => b.id !== id),
              },
            }
          : img
      )
    );
    toast.success("Bounding box deleted");
  };

  const handleAddPolygon = (polygon: Omit<SegmentationPolygon, "id">) => {
    if (!selectedImageId) return;
    const newPolygon: SegmentationPolygon = {
      ...polygon,
      id: `polygon-${Date.now()}`,
    };
    setImages(
      images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              annotations: {
                ...img.annotations,
                polygons: [...(img.annotations.polygons || []), newPolygon],
              },
            }
          : img
      )
    );
    toast.success("Segmentation polygon added");
  };

  const handleDeletePolygon = (id: string) => {
    if (!selectedImageId) return;
    setImages(
      images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              annotations: {
                ...img.annotations,
                polygons: (img.annotations.polygons || []).filter((p) => p.id !== id),
              },
            }
          : img
      )
    );
    toast.success("Polygon deleted");
  };

  const handleToggleTag = (labelId: string) => {
    if (!selectedImageId) return;
    setImages(
      images.map((img) => {
        if (img.id !== selectedImageId) return img;
        const tags = img.annotations.tags || [];
        const hasTag = tags.some((t) => t.labelId === labelId);
        return {
          ...img,
          annotations: {
            ...img.annotations,
            tags: hasTag
              ? tags.filter((t) => t.labelId !== labelId)
              : [...tags, { labelId }],
          },
        };
      })
    );
  };

  const handleAddAudioSegment = (segment: Omit<AudioSegment, "id">) => {
    const newSegment: AudioSegment = {
      ...segment,
      id: `segment-${Date.now()}`,
    };
    setAudioSegments([...audioSegments, newSegment]);
    toast.success("Audio segment added");
  };

  const handleDeleteAudioSegment = (id: string) => {
    setAudioSegments(audioSegments.filter((s) => s.id !== id));
    toast.success("Audio segment deleted");
  };

  const handleAddTextAnnotation = (annotation: Omit<TextAnnotation, "id">) => {
    const newAnnotation: TextAnnotation = {
      ...annotation,
      id: `text-ann-${Date.now()}`,
    };
    setTextAnnotations([...textAnnotations, newAnnotation]);
    toast.success("Text annotation added");
  };

  const handleDeleteTextAnnotation = (id: string) => {
    setTextAnnotations(textAnnotations.filter((a) => a.id !== id));
    toast.success("Text annotation deleted");
  };

  const handleExtractVideoFrames = () => {
    // Simulated frame extraction - in a real app, this would use canvas to extract frames from video
    const mockFrames: VideoFrame[] = Array.from({ length: 24 }, (_, i) => ({
      id: `frame-${i}`,
      frameNumber: i + 1,
      timestamp: i * 0.5,
      imageUrl: images[i % images.length]?.url || images[0]?.url,
      thumbnailUrl: images[i % images.length]?.thumbnailUrl || images[0]?.thumbnailUrl,
    }));
    setVideoFrames(mockFrames);
    toast.success(`Extracted ${mockFrames.length} frames`);
  };

  const handleFrameSelect = (frameId: string) => {
    setSelectedFrameId(frameId);
    toast.success(`Frame selected`);
  };

  const getGridClass = () => {
    switch (gridMode) {
      case "grid2":
        return "grid grid-cols-2 gap-2";
      case "grid4":
        return "grid grid-cols-2 gap-2";
      case "grid8":
        return "grid grid-cols-4 gap-2";
      default:
        return "";
    }
  };

  const displayImages = gridMode === "single" ? [selectedImage].filter(Boolean) : 
    filteredImages.slice(0, gridMode === "grid2" ? 4 : gridMode === "grid4" ? 8 : 16);

  const handleImageSelect = (imageId: string) => {
    setSelectedImageId(imageId);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r bg-card flex flex-col overflow-hidden">
          {mode === "classification" ? (
            <LabelSidebarUnified
              labels={labels}
              selectedLabelId={selectedLabelId}
              onSelectLabel={setSelectedLabelId}
              onAddLabel={handleAddLabel}
              onDeleteLabel={handleDeleteLabel}
              isClassificationMode={true}
              tags={selectedImage?.annotations.tags || []}
              onToggleTag={handleToggleTag}
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
                <TagRecapPanel
                  tags={selectedImage.annotations.tags || []}
                  labels={labels}
                  onRemoveTag={handleToggleTag}
                />
              )}
            </LabelSidebarUnified>
          ) : (
            <>
              <LabelSidebar
                labels={labels}
                selectedLabelId={selectedLabelId}
                onSelectLabel={setSelectedLabelId}
                onAddLabel={handleAddLabel}
                onDeleteLabel={handleDeleteLabel}
                imageDimensions={mode === "detection" ? imageDimensions : mode === "segmentation" ? segmentationImageDimensions?.original : undefined}
                normalizedDimensions={mode === "detection" ? normalizedDimensions : mode === "segmentation" ? segmentationImageDimensions?.normalized : undefined}
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
                    if (box) setSelectedBox(box);
                  }}
                  onDeleteBox={handleDeleteBox}
                />
              )}
              {mode === "segmentation" && selectedImage && (
                <PolygonRecapPanel
                  polygons={selectedImage.annotations.polygons || []}
                  labels={labels}
                  imageDimensions={segmentationImageDimensions || undefined}
                  onDeletePolygon={handleDeletePolygon}
                />
              )}
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <AnnotationToolbar mode={mode} onModeChange={setMode} />
          
          {mode === "detection" && (
            <>
              <ImageFilterBar
                labels={labels}
                selectedFilters={filters}
                onFilterChange={setFilters}
                gridMode={gridMode}
                onGridModeChange={setGridMode}
              />
              <ImageNavigationBar
                currentImageName={selectedImage?.name || ""}
                currentImagePath={selectedImage?.url || ""}
                canGoPrevious={currentImageIndex > 0}
                canGoNext={currentImageIndex < filteredImages.length - 1}
                onPrevious={handlePreviousImage}
                onNext={handleNextImage}
              />
            </>
          )}

          <div className="flex-1 overflow-auto bg-muted/20">
            {gridMode === "single" ? (
              <>
                {selectedImage && mode === "detection" && (
                  <EnhancedDetectionCanvas
                    imageUrl={selectedImage.url}
                    boxes={selectedImage.annotations.boxes || []}
                    labels={labels}
                    selectedLabelId={selectedLabelId}
                    onAddBox={handleAddBox}
                    onDeleteBox={handleDeleteBox}
                    onUpdateBox={handleUpdateBox}
                    onImageLoad={(dims) => {
                      setImageDimensions(dims);
                      const canvas = document.querySelector("canvas");
                      if (canvas) {
                        setNormalizedDimensions({
                          width: canvas.width,
                          height: canvas.height,
                        });
                      }
                    }}
                    onBoxSelect={setSelectedBox}
                    onBoxHover={setHoveredBox}
                  />
                )}
                {selectedImage && mode === "classification" && (
                  <ClassificationPanel
                    imageUrl={selectedImage.url}
                    tags={selectedImage.annotations.tags || []}
                    labels={labels}
                    onToggleTag={handleToggleTag}
                    onImageDimensions={(dims) => {
                      setImageDimensions(dims.original);
                      setNormalizedDimensions(dims.normalized);
                    }}
                  />
                )}
                {selectedImage && mode === "segmentation" && (
                  <EnhancedSegmentationCanvas
                    imageUrl={selectedImage.url}
                    polygons={selectedImage.annotations.polygons || []}
                    labels={labels}
                    selectedLabelId={selectedLabelId}
                    onAddPolygon={handleAddPolygon}
                    onDeletePolygon={handleDeletePolygon}
                    onImageDimensions={setSegmentationImageDimensions}
                  />
                )}
                {mode === "video" && (
                  <VideoAnnotationCanvas
                    videoUrl={SAMPLE_VIDEO_URL}
                    frames={videoFrames}
                    currentFrameId={selectedFrameId}
                    onFrameSelect={handleFrameSelect}
                    onExtractFrames={handleExtractVideoFrames}
                  />
                )}
                {mode === "audio" && (
                  <AudioAnnotationCanvas
                    audioUrl={SAMPLE_AUDIO_URL}
                    segments={audioSegments}
                    labels={labels}
                    selectedLabelId={selectedLabelId}
                    onAddSegment={handleAddAudioSegment}
                    onDeleteSegment={handleDeleteAudioSegment}
                  />
                )}
                {mode === "text" && (
                  <TextAnnotationCanvas
                    text={SAMPLE_TEXT}
                    annotations={textAnnotations}
                    labels={labels}
                    selectedLabelId={selectedLabelId}
                    onAddAnnotation={handleAddTextAnnotation}
                    onDeleteAnnotation={handleDeleteTextAnnotation}
                  />
                )}
              </>
            ) : (
              <div className={`p-4 ${getGridClass()}`}>
                {displayImages.map((img) => (
                  <div
                    key={img.id}
                    className={`relative bg-card rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageId === img.id ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
                    }`}
                    style={{ minHeight: '300px' }}
                  >
                    {mode === "detection" && (
                      <EnhancedDetectionCanvas
                        imageUrl={img.url}
                        boxes={img.annotations.boxes || []}
                        labels={labels}
                        selectedLabelId={selectedLabelId}
                        onAddBox={(box) => {
                          setSelectedImageId(img.id);
                          const newBox: BoundingBox = {
                            ...box,
                            id: `box-${Date.now()}`,
                          };
                          setImages(
                            images.map((image) =>
                              image.id === img.id
                                ? {
                                    ...image,
                                    annotations: {
                                      ...image.annotations,
                                      boxes: [...(image.annotations.boxes || []), newBox],
                                    },
                                  }
                                : image
                            )
                          );
                        }}
                        onDeleteBox={(id) => {
                          setImages(
                            images.map((image) =>
                              image.id === img.id
                                ? {
                                    ...image,
                                    annotations: {
                                      ...image.annotations,
                                      boxes: (image.annotations.boxes || []).filter((b) => b.id !== id),
                                    },
                                  }
                                : image
                            )
                          );
                        }}
                        onUpdateBox={(id, updates) => {
                          setImages(
                            images.map((image) =>
                              image.id === img.id
                                ? {
                                    ...image,
                                    annotations: {
                                      ...image.annotations,
                                      boxes: (image.annotations.boxes || []).map((b) =>
                                        b.id === id ? { ...b, ...updates } : b
                                      ),
                                    },
                                  }
                                : image
                            )
                          );
                        }}
                        onImageLoad={(dims) => {
                          if (selectedImageId === img.id) {
                            setImageDimensions(dims);
                            setNormalizedDimensions(dims);
                          }
                        }}
                        onBoxSelect={(box) => {
                          setSelectedImageId(img.id);
                          setSelectedBox(box);
                        }}
                        onBoxHover={(box) => {
                          if (selectedImageId === img.id) setHoveredBox(box);
                        }}
                      />
                    )}
                    {mode === "classification" && (
                      <>
                        <ClassificationPanel
                          imageUrl={img.url}
                          tags={img.annotations.tags || []}
                          labels={labels}
                          onToggleTag={(labelId) => {
                            setSelectedImageId(img.id);
                            setImages(
                              images.map((image) => {
                                if (image.id !== img.id) return image;
                                const tags = image.annotations.tags || [];
                                const hasTag = tags.some((t) => t.labelId === labelId);
                                return {
                                  ...image,
                                  annotations: {
                                    ...image.annotations,
                                    tags: hasTag
                                      ? tags.filter((t) => t.labelId !== labelId)
                                      : [...tags, { labelId }],
                                  },
                                };
                              })
                            );
                          }}
                        />
                        <div className="absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs">
                          <div className="font-medium truncate">{img.name}</div>
                          <div className="text-muted-foreground">
                            {img.annotations.tags?.length || 0} tags
                          </div>
                        </div>
                      </>
                    )}
                    <div 
                      className="absolute inset-0 pointer-events-none border-2 rounded-lg transition-all"
                      style={{ 
                        borderColor: selectedImageId === img.id ? 'hsl(var(--primary))' : 'transparent' 
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
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
