"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function DonateQRModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-none w-[800px] h-[800px] max-h-[90vh] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-5xl text-center mb-8">BUY ME A COFFEE</DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-12 flex-1 flex flex-col items-center justify-center">
          <div className="w-[500px] h-[500px] mx-auto">
            <img
              src="/qr.png"
              alt="Donate QR Code"
              className="w-full h-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          <Button
            onClick={onClose}
            className="px-8 py-3 text-lg font-bold"
            size="lg"
          >
            CLOSE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
