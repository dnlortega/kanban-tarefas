import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL inválida do YouTube" }, { status: 400 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "A chave RAPIDAPI_KEY não está configurada no servidor (.env)." }, { status: 500 });
  }

  try {
    // Extrair o ID do vídeo da URL do Youtube
    let videoId = "";
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname === "youtu.be") {
        videoId = parsedUrl.pathname.slice(1);
      } else {
        videoId = parsedUrl.searchParams.get("v") || "";
      }
    } catch {
      return NextResponse.json({ error: "Formato de URL inválido" }, { status: 400 });
    }

    if (!videoId) {
      return NextResponse.json({ error: "Não foi possível extrair o ID do vídeo." }, { status: 400 });
    }

    // Fazer requisição para a API do RapidAPI (youtube-mp36)
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
      },
    };

    const response = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, options);
    if (!response.ok) {
      throw new Error(`Erro na API do RapidAPI: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "ok" && data.status !== "success" && !data.link) {
      throw new Error(data.msg || data.message || "Erro desconhecido na API.");
    }

    const downloadLink = data.link;
    const title = data.title || "audio";

    // Fazer o streaming do arquivo gerado para o cliente
    const fileResponse = await fetch(downloadLink);
    
    if (!fileResponse.ok || !fileResponse.body) {
      throw new Error("Não foi possível acessar o arquivo de áudio gerado.");
    }

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${title.replace(/[^\w\s-]/gi, "")}.mp3"`);
    headers.set("Content-Type", "audio/mpeg");
    
    const contentLength = fileResponse.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(fileResponse.body, { headers });

  } catch (error: any) {
    console.error("Erro ao baixar:", error);
    return NextResponse.json({ error: error.message || "Erro ao processar o vídeo" }, { status: 500 });
  }
}
