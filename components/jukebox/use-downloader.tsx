import { toast } from "sonner";

export function useDownloader() {
  const startDownload = async (url: string, type: "mp3" | "mp4", quality: string, defaultTitle: string) => {
    // Redireciona para um downloader alternativo (yt1s)
    const downloadUrl = `https://yt1s.com/en/youtube-to-mp3?q=${encodeURIComponent(url)}`;
    
    // Método mais robusto contra bloqueadores de pop-up
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();

    toast.success("Abrindo aba de download...");
  };

  const DownloadDialog = () => null;

  return { startDownload, DownloadDialog };
}
