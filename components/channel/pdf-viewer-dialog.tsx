"use client";

import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Maximize, Minimize, RefreshCw } from "lucide-react";

interface PDFViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName?: string;
}

export const PDFViewerDialog = ({
  isOpen,
  onClose,
  pdfUrl,
  fileName,
}: PDFViewerDialogProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useProxyUrl, setUseProxyUrl] = useState(false);
  const [displayError, setDisplayError] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLObjectElement>(null);

  // Create a proxy URL for handling cross-origin issues
  const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
  
  // The actual URL to use (either direct or proxied)
  const effectivePdfUrl = useProxyUrl ? proxyUrl : pdfUrl;

  useEffect(() => {
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // Reset error state when dialog opens
    if (isOpen) {
      setDisplayError(false);
      setUseProxyUrl(false);
    }
  }, [isOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      dialogContentRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleLoadError = () => {
    // If direct URL failed, try the proxy
    if (!useProxyUrl) {
      setUseProxyUrl(true);
    } else {
      setDisplayError(true);
    }
  };

  // Check if PDF is loaded correctly
  const checkPdfLoaded = () => {
    if (objectRef.current) {
      // For some browsers, we can detect if the PDF loaded correctly
      const contentDocument = objectRef.current.contentDocument;
      if (contentDocument && contentDocument.body.innerHTML === "") {
        handleLoadError();
      }
    }
  };

  // Extract file name from URL if not provided
  const displayName = fileName || pdfUrl.split('/').pop()?.split('?')[0] || "Document";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-zinc-900 border-zinc-800 text-white max-w-6xl w-[95vw] h-[85vh] p-0 overflow-hidden flex flex-col"
        ref={dialogContentRef}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-medium truncate max-w-[80%]">
            {displayName}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="hover:bg-zinc-800"
            >
              {isFullscreen ? <Minimize /> : <Maximize />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Reset the view state and try alternative method
                setUseProxyUrl(!useProxyUrl);
                setDisplayError(false);
              }}
              className="hover:bg-zinc-800"
              title={useProxyUrl ? "Try direct link" : "Try proxy link"}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hover:bg-zinc-800"
            >
              <a href={pdfUrl} download={displayName} target="_blank">
                <Download />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hover:bg-zinc-800"
            >
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
              </a>
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full h-full bg-zinc-800 overflow-hidden">
          {displayError ? (
            <div className="flex flex-col items-center justify-center h-full bg-white text-black p-8">
              <p className="mb-4 text-lg">Unable to display PDF. Please try one of the options below:</p>
              <div className="flex gap-4 flex-wrap justify-center">
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Open in new tab
                </a>
                <a 
                  href={pdfUrl} 
                  download={displayName}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Download PDF
                </a>
                <button
                  onClick={() => {
                    setUseProxyUrl(!useProxyUrl);
                    setDisplayError(false);
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  {useProxyUrl ? "Try direct link" : "Try proxy link"}
                </button>
              </div>
            </div>
          ) : (
            <object
              ref={objectRef}
              data={effectivePdfUrl}
              type="application/pdf"
              className="w-full h-full bg-white"
              style={{ display: 'block', height: '100%', border: 'none' }}
              onError={handleLoadError}
              onLoad={checkPdfLoaded}
            >
              <div className="flex flex-col items-center justify-center h-full bg-white text-black p-8">
                <p className="mb-4">Unable to display PDF directly. Please try one of the options below:</p>
                <div className="flex gap-4 flex-wrap justify-center">
                  <a 
                    href={pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Open in new tab
                  </a>
                  <a 
                    href={pdfUrl} 
                    download={displayName}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Download PDF
                  </a>
                  <button
                    onClick={() => {
                      setUseProxyUrl(!useProxyUrl);
                      setDisplayError(false);
                    }}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                  >
                    {useProxyUrl ? "Try direct link" : "Try proxy link"}
                  </button>
                </div>
              </div>
            </object>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewerDialog;
