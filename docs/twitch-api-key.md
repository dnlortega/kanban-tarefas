# Como criar as credenciais da Twitch API

1. Acesse https://dev.twitch.tv/console/apps e faça login com sua conta Twitch.
2. Clique em **Register Your Application**.
3. Preencha:
   - **Name**: um nome qualquer (ex: "Central Tarefas").
   - **OAuth Redirect URLs**: `http://localhost:3000` (não é usado de verdade, mas o campo é obrigatório).
   - **Category**: "Application Integration".
4. Clique em **Create**, depois em **Manage** no app criado.
5. Copie o **Client ID**.
6. Clique em **New Secret** para gerar o **Client Secret** e copie também (só aparece uma vez).
7. Cole as duas no arquivo `.env.local` na raiz do projeto:

   ```
   TWITCH_CLIENT_ID=SEUCLIENTIDAQUI
   TWITCH_CLIENT_SECRET=SEUCLIENTSECRETAQUI
   ```

8. Reinicie o `npm run dev` depois de adicionar as credenciais.

A aplicação usa o fluxo **Client Credentials** (token de app, sem login de usuário) para consultar a Helix API — buscar canais, ver quem está ao vivo e listar clipes. Esse token é gerado automaticamente pelo servidor e não exige nenhuma ação manual sua além de colar as duas credenciais acima.
