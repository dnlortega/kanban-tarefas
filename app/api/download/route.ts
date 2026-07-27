import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import { PassThrough } from "stream";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const type = searchParams.get("type") || "mp3";

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: "URL inválida do YouTube" }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/gi, "");

    const formatOptions = type === "mp3"
      ? { quality: "highestaudio", filter: "audioonly" }
      : { quality: "highestvideo", filter: "audioandvideo" };

    const format = ytdl.chooseFormat(info.formats, formatOptions as any);
    
    if (!format) {
      return NextResponse.json({ error: "Formato não disponível" }, { status: 400 });
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
