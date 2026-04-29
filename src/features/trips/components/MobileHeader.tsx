import { useState } from 'react';
import { Menu, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Sidebar } from '@/features/trips/components/Sidebar';

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-background md:hidden">
      <div className="flex items-center gap-2">
        <Plane className="h-5 w-5 text-primary" />
        <span className="font-semibold">TripKit</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-sidebar">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div onClick={() => setOpen(false)} className="h-full">
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
