import { ReactNode } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface WorkflowStep {
  text: string;
}

interface KeyboardShortcut {
  keys: string;
  description: string;
}

interface WorkflowInfoCardProps {
  title: string;
  icon: ReactNode;
  steps: WorkflowStep[];
  shortcuts: KeyboardShortcut[];
}

export const WorkflowInfoCard = ({
  title,
  icon,
  steps,
  shortcuts,
}: WorkflowInfoCardProps) => {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 z-10 h-9 w-9 p-0 bg-card/95 backdrop-blur-sm shadow-lg"
        >
          <Info className="w-4 h-4" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="left">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            {icon}
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-sm">{title}</h4>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              {steps.map((step, index) => (
                <li key={index}>{step.text}</li>
              ))}
            </ol>
            {shortcuts.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-1">Keyboard Shortcuts:</p>
                <div className="text-[10px] text-muted-foreground space-y-1">
                  {shortcuts.map((shortcut, index) => (
                    <p key={index}>
                      • <kbd className="px-1 rounded bg-muted">{shortcut.keys}</kbd> {shortcut.description}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};