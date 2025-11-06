import { ImageItem } from "@/types/annotation";
import { VideoItem } from "@/types/video";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Video } from "lucide-react";

interface ThumbnailGalleryProps {
  images: ImageItem[];
  videos?: VideoItem[];
  selectedImageId: string | null;
  selectedVideoId?: string | null;
  selectedFrameId?: string | null;
  onSelectImage: (id: string) => void;
  onSelectVideo?: (videoId: string) => void;
  onSelectFrame?: (videoId: string, frameId: string) => void;
}

export const ThumbnailGallery = ({
  images,
  videos = [],
  selectedImageId,
  selectedVideoId,
  selectedFrameId,
  onSelectImage,
  onSelectVideo,
  onSelectFrame,
}: ThumbnailGalleryProps) => {
  return (
    <div className="h-32 border-t bg-card">
      <ScrollArea className="h-full">
        <div className="flex gap-2 p-2">
          {images.map((image) => {
            const isSelected = selectedImageId === image.id;
            const hasAnnotations = 
              (image.annotations.boxes && image.annotations.boxes.length > 0) ||
              (image.annotations.polygons && image.annotations.polygons.length > 0) ||
              (image.annotations.tags && image.annotations.tags.length > 0);

            return (
              <div
                key={image.id}
                className={`relative flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-primary scale-105 glow-primary"
                    : "hover:ring-2 hover:ring-primary/50"
                }`}
                onClick={() => onSelectImage(image.id)}
              >
                <img
                  src={image.thumbnailUrl}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                {hasAnnotations && (
                  <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                    <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">{image.name}</p>
                </div>
              </div>
            );
          })}
          
          {/* Video Thumbnails */}
          {videos.map((video) => {
            const isSelected = selectedVideoId === video.id;
            const hasFrames = video.frames.length > 0;

            return (
              <div key={video.id} className="flex-shrink-0">
                <div
                  className={`relative w-28 h-28 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-primary scale-105 glow-primary"
                      : "hover:ring-2 hover:ring-primary/50"
                  }`}
                  onClick={() => onSelectVideo?.(video.id)}
                >
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  {hasFrames && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full px-1.5 py-0.5">
                      <span className="text-xs text-primary-foreground font-medium">
                        {video.frames.length}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-xs text-white truncate">{video.name}</p>
                  </div>
                </div>
                
                {/* Video Frames */}
                {hasFrames && isSelected && (
                  <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
                    {video.frames.map((frame) => (
                      <div
                        key={frame.id}
                        className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden cursor-pointer transition-all ${
                          selectedFrameId === frame.id
                            ? "ring-2 ring-primary"
                            : "hover:ring-1 hover:ring-primary/50"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFrame?.(video.id, frame.id);
                        }}
                      >
                        <img
                          src={frame.thumbnailUrl}
                          alt={`Frame ${frame.frameNumber}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1">
                          <p className="text-[10px] text-white truncate">
                            #{frame.frameNumber}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
