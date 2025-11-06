import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Image as ImageIcon } from "lucide-react";
import { VideoItem, VideoFrame } from "@/types/video";

interface VideoPlayerProps {
  video: VideoItem;
  onFrameExtracted: (frame: VideoFrame) => void;
  onFrameSelect: (frameId: string) => void;
  selectedFrameId: string | null;
}

export const VideoPlayer = ({
  video,
  onFrameExtracted,
  onFrameSelect,
  selectedFrameId,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [fps] = useState(video.fps || 30);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const seekToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipFrames = (direction: "forward" | "backward") => {
    if (videoRef.current) {
      const frameDuration = 1 / fps;
      const newTime =
        direction === "forward"
          ? Math.min(currentTime + frameDuration, video.duration)
          : Math.max(currentTime - frameDuration, 0);
      seekToTime(newTime);
    }
  };

  const extractCurrentFrame = () => {
    const videoElement = videoRef.current;
    const canvas = canvasRef.current;
    if (!videoElement || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const frameNumber = Math.floor(currentTime * fps);
      const frame: VideoFrame = {
        id: `${video.id}_frame_${frameNumber}`,
        frameNumber,
        timestamp: currentTime,
        imageUrl: url,
        thumbnailUrl: url,
      };

      onFrameExtracted(frame);
    }, "image/jpeg");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Video Display */}
      <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-contain"
          onClick={togglePlay}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="space-y-3 px-2">
        {/* Timeline Slider */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={video.duration}
            step={0.01}
            onValueChange={([value]) => seekToTime(value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(video.duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => skipFrames("backward")}
            title="Previous frame"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => skipFrames("forward")}
            title="Next frame"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            onClick={extractCurrentFrame}
            className="ml-4"
            title="Extract current frame for annotation"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Extract Frame
          </Button>
        </div>
      </div>

      {/* Extracted Frames */}
      {video.frames.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Extracted Frames</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {video.frames.map((frame) => (
              <div
                key={frame.id}
                className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedFrameId === frame.id
                    ? "ring-2 ring-primary scale-105"
                    : "hover:ring-2 hover:ring-primary/50"
                }`}
                onClick={() => onFrameSelect(frame.id)}
              >
                <img
                  src={frame.thumbnailUrl}
                  alt={`Frame ${frame.frameNumber}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <p className="text-xs text-white truncate">
                    Frame {frame.frameNumber}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
