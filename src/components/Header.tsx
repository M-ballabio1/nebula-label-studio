import { Layers } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-16 border-b bg-card flex items-center px-6 sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center glow-primary">
          <Layers className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Nebula Flow
          </h1>
          <p className="text-xs text-muted-foreground">Multi-Modal Annotation Platform</p>
        </div>
      </div>
    </header>
  );
};
