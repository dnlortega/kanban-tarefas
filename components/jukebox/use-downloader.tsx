import { toast } from "sonner";

export function useDownloader() {
  const startDownload = async (url: string, type: "mp3" | "mp4", quality: string, defaultTitle: string) => {
    // Redireciona para um downloader confiável de terceiros, passando a URL
    window.open(`https://cobalt.tools/?url=${encodeURIComponent(url)}`, '_blank');
    toast.success("Redirecionando para página de download seguro...");
  };

  const DownloadDialog = () => null;

  return { startDownload, DownloadDialog };
}
