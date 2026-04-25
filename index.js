const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ─── Configuração do cliente ───────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'meu-bot' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  }
});

// ─── QR Code para autenticar ──────────────────────────────────────────────
client.on('qr', (qr) => {
  console.log('\n📱 Escaneie o QR Code abaixo no WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => console.log('✅ Autenticado com sucesso!'));
client.on('ready', () => {
  console.log('🟢 Bot pronto! Aguardando mensagens...');
  console.log('   Envie "!menu" para ver os comandos');
});

// ─── Banco de dados simples (memória) ────────────────────────────────────
const processos = new Map(); // numeroProcesso → dados

// ─── Menu principal ───────────────────────────────────────────────────────
const MENU = `⚖️ *ESCRITÓRIO SK — Assistente Jurídico*

Olá! Sou o assistente do escritório. Escolha uma opção:

1️⃣ Consultar processo
2️⃣ Agendar reunião
3️⃣ Falar com advogado
4️⃣ Documentos necessários
5️⃣ Horário de atendimento
0️⃣ Encerrar atendimento

_Responda com o número da opção_`;

// ─── Sessões de usuário ───────────────────────────────────────────────────
const sessoes = new Map(); // número → { etapa, dados }

function getSessao(numero) {
  if (!sessoes.has(numero)) sessoes.set(numero, { etapa: 'inicio', dados: {} });
  return sessoes.get(numero);
}

// ─── Handler de mensagens ─────────────────────────────────────────────────
client.on('message', async (msg) => {
  if (msg.isGroupMsg) return; // Ignora grupos (remova para ativar em grupos)
  
  const texto = msg.body.trim().toLowerCase();
  const numero = msg.from;
  const sessao = getSessao(numero);
  
  console.log(`📨 [${numero}]: ${msg.body}`);

  // Comando de menu a qualquer momento
  if (texto === '!menu' || texto === 'menu' || texto === 'oi' || texto === 'olá') {
    sessao.etapa = 'menu';
    await msg.reply(MENU);
    return;
  }

  // Máquina de estados por etapa
  switch (sessao.etapa) {
    case 'inicio':
      await msg.reply(MENU);
      sessao.etapa = 'menu';
      break;

    case 'menu':
      if (texto === '1') {
        sessao.etapa = 'consultar_processo';
        await msg.reply('📋 *Consulta de Processo*\n\nDigite o número do processo (ex: 1234567-89.2024.8.26.0001):');
      } else if (texto === '2') {
        sessao.etapa = 'agendar';
        await msg.reply('📅 *Agendamento*\n\nQual o seu nome completo?');
      } else if (texto === '3') {
        await msg.reply('👨‍💼 *Falar com Advogado*\n\nVou transferir você para o Dr. Saulo Kenji.\n\n_Aguarde, ele responderá em breve._');
        // Notificar o advogado (substitua pelo número real)
        // await client.sendMessage('5511999999999@c.us', `⚠️ Cliente ${numero} quer falar com você!`);
        sessao.etapa = 'inicio';
      } else if (texto === '4') {
        await msg.reply(
          '📄 *Documentos Gerais*\n\n' +
          '• RG e CPF (originais + cópia)\n' +
          '• Comprovante de residência (últimos 3 meses)\n' +
          '• Comprovante de renda\n\n' +
          '*Processos Trabalhistas:* Carteira de trabalho, contracheques, CTPS\n' +
          '*Processos Cíveis:* Contratos, notas fiscais, comprovantes\n' +
          '*Processos de Família:* Certidão de casamento, nascimento\n\n' +
          '_Digite !menu para voltar_'
        );
      } else if (texto === '5') {
        await msg.reply(
          '🕐 *Horário de Atendimento*\n\n' +
          '• Segunda a Sexta: 8h às 18h\n' +
          '• Sábado: 8h às 12h\n' +
          '• Emergências: disponível 24h\n\n' +
          '📍 *Endereço:* Rua das Leis, 123 — Centro\n' +
          '📞 *Telefone:* (11) 99999-9999\n\n' +
          '_Digite !menu para voltar_'
        );
      } else if (texto === '0') {
        await msg.reply('👋 Até logo! Em caso de dúvidas, é só chamar. ⚖️');
        sessoes.delete(numero);
      } else {
        await msg.reply('❓ Opção inválida. Digite !menu para ver as opções.');
      }
      break;

    case 'consultar_processo':
      const numProcesso = msg.body.trim();
      await msg.reply(
        `🔍 *Consultando processo...*\n` +
        `Número: ${numProcesso}\n\n` +
        `_Esta é uma versão de demonstração.\n` +
        `Em produção, este número seria consultado no banco de dados ou no sistema do tribunal._\n\n` +
        `Para integração real, veja o arquivo README.md`
      );
      sessao.etapa = 'menu';
      break;

    case 'agendar':
      if (!sessao.dados.nome) {
        sessao.dados.nome = msg.body.trim();
        await msg.reply(`Olá, *${sessao.dados.nome}*! Qual sua disponibilidade?\n\n1 - Manhã (8h-12h)\n2 - Tarde (13h-18h)`);
      } else if (!sessao.dados.turno) {
        sessao.dados.turno = texto === '1' ? 'Manhã' : 'Tarde';
        await msg.reply(
          `✅ *Agendamento Solicitado!*\n
` +
          `*Nome:* ${sessao.dados.nome}\n` +
          `*Turno:* ${sessao.dados.turno}\n\n` +
          `Entraremos em contato para confirmar a data.\n_Digite !menu para voltar_`
        );
        sessao.etapa = 'menu';
        sessao.dados = {};
      }
      break;
  }
});

client.on('disconnected', (reason) => {
  console.log('❌ Desconectado:', reason);
  process.exit(1);
});

console.log('🚀 Iniciando WhatsApp Bot...');
client.initialize();