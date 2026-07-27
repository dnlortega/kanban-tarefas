import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import { PassThrough } from "stream";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const type = searchParams.get("type") || "mp3";
  const quality = searchParams.get("quality");

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: "URL inválida do YouTube" }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/gi, "");

    let formatOptions: any = {};
    if (type === "mp3") {
      formatOptions = { 
        quality: quality === "low" ? "lowestaudio" : "highestaudio", 
        filter: "audioonly" 
      };
    } else {
      // Para vídeos com áudio sem usar FFMPEG (suportado pela Vercel), os itags comuns são 22 (720p) e 18 (360p)
      formatOptions = { 
        quality: quality === "360p" ? "18" : (quality === "720p" ? "22" : "highestvideo"), 
        filter: "audioandvideo" 
      };
    }

    const format = ytdl.chooseFormat(info.formats, formatOptions);
    
    if (!format) {
      return NextResponse.json({ error: "Formato ou qualidade não disponível para este vídeo" }, { status: 400 });
    }

    const stream = ytdl(url, { format });
    
    const headers = new Headers();
    if (type === "mp3") {
      headers.set("Content-Disposition", `attachment; filename="${title}.mp3"`);
      headers.set("Content-Type", "audio/mpeg");
    } else {
      headers.set("Content-Disposition", `attachment; filename="${title}.mp4"`);
      headers.set("Content-Type", "video/mp4");
    }

    // Convert node stream to web stream
    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      }
    });

    return new NextResponse(readable, { headers });

  } catch (error: any) {
    console.error("Erro ao baixar:", error);
    return NextResponse.json({ error: error.message || "Erro ao processar o vídeo" }, { status: 500 });
  }
}
