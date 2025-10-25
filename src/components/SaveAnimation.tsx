import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import unicornAnimation from "@/assets/unicorn-animation.json";

interface SaveAnimationProps {
  show: boolean;
  onComplete: () => void;
}

export const SaveAnimation = ({ show, onComplete }: SaveAnimationProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) return;

    // Simulate sync progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      setProgress(0);
    };
  }, [show, onComplete]);

  return (
    <Dialog open={show}>
      <DialogContent className="max-w-md border-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-64 h-64">
            <Lottie
              animationData={unicornAnimation}
              loop={true}
              autoplay={true}
            />
          </div>
          <div className="text-center space-y-2 mt-4">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Syncing annotations...
            </h3>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
