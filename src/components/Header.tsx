import { Layers } from "lucide-react";
import { AppMenu } from "./AppMenu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AnnotationMode, ImageItem, Label } from "@/types/annotation";

interface HeaderProps {
  mode: AnnotationMode;
  images: ImageItem[];
  labels: Label[];
}

export const Header = ({ mode, images, labels }: HeaderProps) => {
  return (
    <header className="h-16 border-b bg-card flex items-center px-6 sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <SidebarTrigger className="mr-3" />
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl gradient-logo flex items-center justify-center glow-logo">
          <Layers className="w-6 h-6 text-accent-logo-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-logo bg-clip-text text-transparent">Nebula Flow</h1>
          <p className="text-xs text-muted-foreground">Multi-Modal Annotation Platform</p>
        </div>
      </div>
      <AppMenu mode={mode} images={images} labels={labels} />
    </header>
  );
};
