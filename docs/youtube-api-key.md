# Como criar a API key do YouTube Data API v3

1. Acesse https://console.cloud.google.com/ e faça login com sua conta Google.
2. Crie um novo projeto (ou selecione um existente) no seletor de projetos no topo.
3. Vá em **APIs & Services > Library**, busque por **"YouTube Data API v3"** e clique em **Enable**.
4. Vá em **APIs & Services > Credentials > Create Credentials > API key**.
5. Copie a chave gerada.
6. (Recomendado) Clique em **Restrict key** e limite em **API restrictions** apenas para **YouTube Data API v3**, já que a chave só será usada no servidor (Server Actions), nunca exposta no navegador.
7. Cole a chave no arquivo `.env.local` na raiz do projeto:

   ```
   YOUTUBE_API_KEY=SUACHAVEAQUI
   ```

8. Reinicie o `npm run dev` depois de adicionar a chave.

A API tem uma cota gratuita diária (10.000 unidades/dia); cada busca consome ~100 unidades, então dá para ~100 buscas/dia sem custo.
