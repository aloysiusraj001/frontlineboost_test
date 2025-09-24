import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import Train from "./pages/Train";

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="frontline-boost-theme">
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-background p-6">
        <Train />
      </div>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
