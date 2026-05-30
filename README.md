# 🌿 Rastro Social - ImpactLedger

## 📌 Índice

- [Definição do Problema]
- [Solução Proposta]
- [Arquitetura da Solução]
- [Tecnologias Utilizadas]
- [Tipos de Ação e Pontuação]
- [Fluxo da Aplicação]
- [Como Executar o Projeto]
- [Links Importantes]
- [Métricas de Impacto]
- [Diferenciais do Projeto]

---

## 📌 Definição do Problema

ONGs sérias realizam diversas ações de proteção territorial (reuniões comunitárias, oficinas de formação, notificações extrajudiciais contra empresas, vistorias técnicas em áreas ameaçadas). Porém, para prestar contas a financiadores internacionais (fundações, agências de cooperação), precisam produzir relatórios trimestrais que dependem de registros manuais em planilhas, e-mails e fotos soltas.

### Isso gera:

| Problema | Impacto |
|----------|---------|
| 🔴 Baixa confiança dos doadores | Auto-declaração sem verificação externa |
| 🔴 Retrabalho na consolidação de dados | Equipe gasta tempo organizando informações |
| 🔴 Dificuldade de provar cronologia | Ações sem ordem temporal verificável |
| 🔴 Falta de métricas objetivas | Ex: quantas notificações geraram efeito? |

---

## 💡 Solução Proposta

Uma plataforma onde cada ação relevante da ONG é registrada como um **Evento de Impacto** em um Smart Contract.

### Cada evento contém:

| Campo | Descrição |
|-------|-----------|
| 🏷️ **Tipo de ação** | Reunião, oficina, notificação, vistoria, denúncia, articulação com MP |
| 📍 **Data e local** | Geocoordenadas da ação |
| 📎 **Evidência** | Hash IPFS da ata, foto ou vídeo |
| 👥 **Participantes** | Número de participantes (opcional) |

### Como funciona:

1. ✅ O sistema soma **pontos para cada tipo de ação**
2. ✅ A cada 3 meses, **qualquer pessoa** pode gerar um relatório público
3. ✅ O relatório é **registrado na blockchain** com hash de integridade
4. ✅ Financiadores consultam o **dashboard público ou Etherscan**

---

## 🏗️ Arquitetura da Solução

### Fluxo da Solução

┌─────────────────────────────────────────────────────────────────────────────┐
│ FLUXO COMPLETO DA SOLUÇÃO │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ 1. Equipe ONG → Ação de campo (ex: vistoria) │
│ │ │
│ ▼ │
│ 2. Ação → Formulário Web (upload evidência para IPFS) │
│ │ │
│ ▼ │
│ 3. Formulário → Contrato RegistroImpacto (transação blockchain) │
│ │ │
│ ▼ │
│ 4. Contrato → Emite EventoRegistrado (prova imutável) │
│ │ │
│ ▼ │
│ 5. A cada 3 meses → Chamar gerarRelatorioTrimestral │
│ │ │
│ ▼ │
│ 6. Relatório → EventoRelatorioGerado (público e verificável) │
│ │ │
│ ▼ │
│ 7. Financiadores → Consultam Painel Público ou Etherscan │
│ │
└─────────────────────────────────────────────────────────────────────────────┘

### Arquitetura Técnica

┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React) │
├─────────────────────────────────────────────────────────────────┤
│ Área Pública │ Área Restrita (ONG) │
│ - Dashboard com métricas │ - Registrar ações │
│ - Lista de ações │ - Gerenciar relatórios │
│ - Visualizar relatórios │ - Dashboard da ONG │
│ - Verificar transações │ - Apenas carteira autorizada │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ SMART CONTRACT (Solidity) │
│ │
│ • registrarImpacto() → Registra nova ação │
│ • gerarRelatorioTrimestral() → Gera relatório oficial │
│ • obterEvento() → Consulta ação por ID │
│ • obtertotalEventos() → Total de ações registradas │
│ • consultarRelatorioTrimestral() → Consulta relatórios │
│ • adicionarAutorizado() → Gerencia acesso da ONG │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ BLOCKCHAIN (Sepolia) │
│ │
│ • Cada ação = 1 transação (timestamp verificável) │
│ • Relatórios = eventos na blockchain │
│ • Histórico imutável e auditável │
└─────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│ ARMAZENAMENTO OFF-CHAIN │
│ │
│ • IPFS (Pinata) → Evidências (fotos, vídeos, atas) │
│ • Gateway IPFS para consulta pública │
└─────────────────────────────────────────────────────────────────┘

---

## 🛠️ Tecnologias Utilizadas

### Web 3.0 / Blockchain

| Tecnologia | Finalidade |
|------------|------------|
| **Solidity** | Linguagem dos smart contracts |
| **Ethereum** | Rede blockchain utilizada |
| **Remix** | IDE para desenvolvimento do contrato |
| **Sepolia** | Testnet utilizada para deploy |
| **MetaMask** | Carteira para conexão com a blockchain |
| **OpenZeppelin** | Biblioteca de contratos (DateTime) |
| **Polygon Amoy** | Testnet alternativa |

### Front-end

| Tecnologia | Finalidade |
|------------|------------|
| **TypeScript** | Tipagem estática |
| **React** | Biblioteca para interface de usuário |
| **Tailwind CSS** | Estilização da aplicação |
| **Vercel** | Hospedagem da aplicação |

### Armazenamento

| Tecnologia | Finalidade |
|------------|------------|
| **IPFS (Pinata)** | Armazenamento descentralizado das evidências |

---

## 📊 Tipos de Ação e Pontuação

| ID | Tipo de Ação | Pontos | Ícone |
|----|--------------|--------|-------|
| 1 | Vistoria Técnica | 5 | 🔍 |
| 2 | Reunião Comunitária | 1 | 🤝 |
| 3 | Notificação Extrajudicial | 6 | 📋 |
| 4 | Denúncia Pública | 4 | 📢 |
| 5 | Oficina de Formação | 2 | 🎓 |
| 6 | Articulação com MP | 6 | ⚖️ |

**Total de pontos possível (1 ação de cada tipo): 24 pontos**

---

## 👥 Fluxo da Aplicação

### Área Pública (sem login - qualquer pessoa pode acessar)

| Funcionalidade | Descrição |
|----------------|-----------|
| 📊 Dashboard | Visualizar estatísticas de impacto |
| 📋 Lista de ações | Ver todas as ações registradas |
| 📄 Relatórios | Consultar relatórios trimestrais gerados |
| 📎 Evidências | Verificar evidências no IPFS |
| 🔗 Transações | Verificar transações no Etherscan |

### Área ONG (requer conexão com carteira autorizada)

| Funcionalidade | Descrição |
|----------------|-----------|
| 🔐 Login | Conectar carteira MetaMask (apenas endereço autorizado) |
| ✍️ Registrar ação | Adicionar novas ações de impacto |
| 📊 Relatórios | Gerar relatórios trimestrais oficiais |
| 📋 Histórico | Gerenciar histórico de ações |
| 📈 Dashboard | Visualizar dashboard exclusivo da ONG |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 18+ (baixar em [nodejs.org](https://nodejs.org))
- MetaMask instalado no navegador
- Conta na Pinata (para IPFS) - [pinata.cloud](https://pinata.cloud)
- ETH de teste na Sepolia - [Faucet](https://sepoliafaucet.com)

### 1. Clonar o repositório

```bash
git clone https://github.com/KaioNilo/RastroSocialWeb3.git
cd RastroSocialWeb3

### 2. Configurar o Frontend

# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Criar arquivo de ambiente
cp .env.example .env

# Editar o .env com seu endereço do contrato
# VITE_CONTRACT_ADDRESS=0xC0dEF23D9E7347bdC029786271f51e925770a8C9

# Rodar o projeto em modo desenvolvimento
npm run dev

### 3. Configurar o Smart Contract (opcional)

# Entrar na pasta do contrato
cd contracts

# Instalar dependências
npm install

# Compilar o contrato
npx hardhat compile

# Executar testes
npx hardhat test

### 4. Acessar a aplicação

Desenvolvimento: local	http://localhost:5173

Produção (Vercel):	https://rastro-social-web3.vercel.app


🔗 Links Importantes

Frontend (Vercel):	rastro-social-web3.vercel.app
Smart Contract (Sepolia):	0xC0dEF23D9E7347bdC029786271f51e925770a8C9
Carteira Autorizada (ONG):	0x6707e22489528Cc355892c5F5aC927C247ee6CF2
Repositório GitHub:	github.com/KaioNilo/RastroSocialWeb3
Documentação Completa:	PDF no repositório
Vídeo de Demonstração da Aplicação: https://tomato-cautious-dog-601.mypinata.cloud/ipfs/bafybeiglrbhwuds6vb2ao6qzi76b4aplei2bu4ltnpijiao5fmz7cq3hme
Vídeo do Pitch: https://tomato-cautious-dog-601.mypinata.cloud/ipfs/bafybeic25tu3p4d3t55rd2qobdokswofhc5btmkj2kazlkcujejakpm72a
Slide do Pitch: https://tomato-cautious-dog-601.mypinata.cloud/ipfs/bafybeifyibkzk7iop2xzn2z3m77rnr5mhrcjdil2on72qts2xmacirkige


Transações de Exemplo (Sepolia)

Vistoria Técnica (5 pts)	https://sepolia.etherscan.io/tx/0x8a8bbcffcfbb7b2b56b3773f1b1baa4be4382538e577d35d125f704f47790911
Reunião Comunitária (1 pt)	https://sepolia.etherscan.io/tx/0xe21be6d2f41b843d29e554d5388aecd9490e565c1d8b65680f3e7865f31ded0
Notificação Extrajudicial (6 pts)	https://sepolia.etherscan.io/tx/0x930d9635f61aeac129f065380a2dafcc18cdea713957a5e0d2eaba1f34e4b4fa
Denúncia Pública (4 pts)	https://sepolia.etherscan.io/tx/0xbb2eb11397f4b60fbea2a4091b7b9c06dfdcdf90c7f36767ecd3c4fe77884e00
Oficina de Formação (2 pts)	https://sepolia.etherscan.io/tx/0xa1d5031a0399349af73f6619cf9ca420462078600e71a641f66bb0042f25b220


📈 Métricas de Impacto Acompanhadas

📊 Total de ações executadas:	Quantidade de eventos registrados
⭐ Pontuação acumulada:	Soma dos pontos de todas as ações
📋 Pontos por tipo de ação:	Detalhamento por categoria
🗺️ Territórios atendidos:	Localizações geográficas das ações
📎 Evidências materiais:	Número de arquivos/IPFS registrados
📄 Relatórios trimestrais:	Documentos oficiais gerados na blockchain


🔐 Configuração de Acesso
Apenas a carteira autorizada pode registrar ações e gerar relatórios:
Endereço autorizado: 0x6707e22489528Cc355892c5F5aC927C247ee6CF2


🎯 Diferenciais do Projeto
 🔒 Transparência total:	Qualquer pessoa pode auditar as ações na blockchain
 📜 Prova verificável:	Relatórios com hash na blockchain
 🤖 Automação de relatórios:	Geração trimestral automática
 🔐 Controle de acesso:	Apenas ONG autorizada pode registrar
 🌐 Evidências descentralizadas:	IPFS para armazenamento de arquivos
 📱 Dashboard intuitivo:	Interface clara para financiadores e público
 🦊 Carteira específica:	Segurança na autorização de ações


📄 Licença
MIT © 2026 Kaio Nilo Freitas


🌿 Rastro Social - Transparência que gera impacto!

Acompanhe e verifique ações socioambientais registradas em blockchain com evidências públicas e auditáveis.