import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export function useDownloader() {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [isIndeterminate, setIsIndeterminate] = useState(true);
  const [fileName, setFileName] = useState("");

  const startDownload = async (url: string, type: "mp3" | "mp4", quality: string, defaultTitle: string) => {
    setIsOpen(true);
    setProgress(0);
    setLoadedBytes(0);
    setTotalBytes(0);
    setIsIndeterminate(true);
    setFileName(`${defaultTitle}.${type}`);

    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&type=${type}&quality=${quality}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Erro ao iniciar o download.");
      }

      // Try to get filename from Content-Disposition
      const disposition = response.headers.get("Content-Disposition");
      if (disposition && disposition.includes("filename=")) {
        const matches = /filename="([^"]+)"/.exec(disposition);
        if (matches && matches[1]) {
          setFileName(matches[1]);
        }
      }

      const contentLength = response.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      if (total > 0) {
        setTotalBytes(total);
        setIsIndeterminate(false);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Não foi possível ler o arquivo.");

      let loaded = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        setLoadedBytes(loaded);
        
        if (total > 0) {
          setProgress(Math.round((loaded / total) * 100));
        }
      }

      const blob = new Blob(chunks);
      const objectUrl = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      URL.revokeObjectURL(objectUrl);
      setIsOpen(false);
      toast.success("Download concluído com sucesso!");
    } catch (error: any) {
      setIsOpen(false);
      toast.error(error.message || "Erro durante o download.");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const DownloadDialog = () => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setIsOpen(false)}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Baixando Arquivo</DialogTitle>
          <DialogDescription>
            {fileName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          {isIndeterminate ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Iniciando o download e processando mídia...<br/>
                Baixado: {formatBytes(loadedBytes)}
              </p>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress}%</span>
                <span>{formatBytes(loadedBytes)} / {formatBytes(totalBytes)}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Por favor, não feche esta janela até que o download seja concluído.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );

  return { startDownload, DownloadDialog };
}
