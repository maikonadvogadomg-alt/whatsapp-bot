# WhatsApp Bot Jurídico 🤖⚖️

Bot de atendimento automatizado para escritório de advocacia via WhatsApp.

## Instalação

```bash
npm install
```

## Executar

```bash
npm start
```

Escaneie o QR Code que aparecer no terminal com o WhatsApp do escritório.

## Funcionalidades

- ✅ Menu interativo com navegação por número
- ✅ Consulta de processos (integrar com banco de dados)
- ✅ Agendamento de reuniões
- ✅ Informações de documentos por tipo de processo
- ✅ Horários e contato do escritório
- ✅ Transferência para advogado

## Como integrar com banco de dados

1. Instale o driver do banco: `npm install @neondatabase/serverless`
2. No caso 'consultar_processo', substitua a resposta simulada por:

```javascript
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

const resultado = await sql`
  SELECT numero_processo, status, fase, vara, comarca
  FROM processos 
  WHERE numero_processo = ${numProcesso}
`;
```

## Publicar em servidor (VPS/Railway/Render)

1. Suba para um servidor Linux com Node.js
2. Use `pm2` para manter rodando: `pm2 start index.js --name bot-juridico`
3. Configure variável DATABASE_URL com a URL do Neon

## ⚠️ Importante

- Use um número de WhatsApp exclusivo para o bot (não o pessoal)
- Respeite os Termos de Serviço do WhatsApp
- Para produção em escala, considere a API oficial do WhatsApp Business
