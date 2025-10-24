import { Settings, Download, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const AppMenu = () => {
  const handleSettings = () => {
    toast.info("Settings panel coming soon");
  };

  const handleDownload = () => {
    toast.info("Download annotations coming soon");
  };

  const handleHelp = () => {
    toast.info("Help documentation coming soon");
  };

  const handleLogout = () => {
    toast.info("Logout functionality coming soon");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary" className="h-9">
          <Settings className="w-4 h-4 mr-2" />
          Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download Annotations
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleHelp}>
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & Documentation
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
