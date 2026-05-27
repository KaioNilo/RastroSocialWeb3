# 🌿 Rastro Social - ImpactLedger

## 📌 Definição do Problema

ONGs sérias realizam diversas ações de proteção territorial (reuniões comunitárias, oficinas de formação, notificações extrajudiciais contra empresas, vistorias técnicas em áreas ameaçadas). Porém, para prestar contas a financiadores internacionais (fundações, agências de cooperação), precisam produzir relatórios trimestrais que dependem de registros manuais em planilhas, e-mails e fotos soltas.

### Isso gera:
- Baixa confiança dos doadores (auto-declaração sem verificação externa)
- Retrabalho na consolidação de dados
- Dificuldade de provar cronologia e autenticidade das ações
- Falta de métricas objetivas de impacto (ex: quantas notificações geraram efeito?)

## 💡 Solução Proposta

Uma plataforma onde cada ação relevante da ONG é registrada como um Evento de Impacto em um Smart Contract. Cada evento contém:

- **Tipo de ação** (reunião, oficina, notificação extrajudicial, vistoria, denúncia pública, articulação com Ministério Público)
- **Data e local** (geocoordenadas)
- **Evidência** (hash da ata, foto, vídeo – armazenado no IPFS)
- **Participantes** (opcional – número ou lista anônima)

O sistema soma pontos para cada tipo de ação e permite que, periodicamente (a cada 3 meses), qualquer pessoa possa chamar uma função que gera um relatório público agregado (total de pontos por tipo, por território, por período). Esse relatório é registrado na blockchain e pode ser apresentado a financiadores como prova verificável do trabalho realizado, sem depender de auto-declaração não auditável.

Os financiadores podem consultar o histórico diretamente no explorador de blocos ou em um dashboard público, vendo exatamente quando cada ação ocorreu e qual foi sua evidência.

## 🏗️ Arquitetura da Solução

### Fluxo da Solução:

1. Equipe ONG → Ação de campo (ex: vistoria)
2. Ação → Formulário Web (upload evidência para IPFS)
3. Formulário → Contrato RegistrarImpacto (transação blockchain)
4. Contrato → Emite RegistrarEvento (prova imutável)
5. A cada 3 meses → Chamar GerarRelatorioTrimestral
6. Relatório → EventoRelatorioGerado (público e verificável)
7. Financiadores → Consultam Painel Público ou Etherscan

### Fluxo de Autenticação e Autorização:
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


## 🛠️ Tecnologias Utilizadas

### Web 3.0 / Blockchain:
- **Solidity** - Linguagem dos smart contracts
- **Ethereum** - Rede blockchain utilizada
- **Remix** - IDE para desenvolvimento do contrato
- **Sepolia** - Testnet utilizada para deploy
- **MetaMask** - Carteira para conexão com a blockchain
- **OpenZeppelin** - Biblioteca de contratos (DateTime)
- **Polygon Amoy** - Testnet alternativa

### Front-end:
- **TypeScript** - Tipagem estática
- **React** - Biblioteca para interface de usuário
- **Vercel** - Hospedagem da aplicação

### Armazenamento:
- **IPFS (Pinata)** - Armazenamento descentralizado das evidências

## 📊 Tipos de Ação e Pontuação

| ID | Tipo de Ação | Pontos |
|----|--------------|--------|
| 1 | Vistoria Técnica | 5 |
| 2 | Reunião Comunitária | 1 |
| 3 | Notificação Extrajudicial | 6 |
| 4 | Denúncia Pública | 4 |
| 5 | Oficina de Formação | 2 |
| 6 | Articulação com MP | 6 |

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 18+
- MetaMask instalado no navegador
- Conta na Pinata (para IPFS)
- ETH de teste na Sepolia (faucet)

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/rastro-social.git
cd rastro-social

3. Configurar o Smart Contract
cd contracts
npm install
npx hardhat compile

4. Acessar a aplicação
Frontend: rastro-social-web3.vercel.app

Contrato na Sepolia: 0xC0dEF23D9E7347bdC029786271f51e925770a8C9

🔗 Links Importantes
Contrato na Sepolia	https://sepolia.etherscan.io/address/0xC0dEF23D9E7347bdC029786271f51e925770a8C9
Carteira Autorizada (ONG)	0x6707e22489528Cc355892c5F5aC927C247ee6CF2
Frontend (Vercel)	https://rastro-social-web3.vercel.app

👥 Fluxo da Aplicação
Área Pública (sem login - qualquer pessoa pode acessar)
Visualizar dashboard com estatísticas de impacto

Ver lista completa de ações registradas

Consultar relatórios trimestrais gerados

Verificar evidências no IPFS

Verificar transações no Etherscan

Área ONG (requer conexão com carteira autorizada)
Conectar carteira MetaMask (apenas endereço autorizado)

Registrar novas ações de impacto

Gerar relatórios trimestrais oficiais

Gerenciar histórico de ações

Visualizar dashboard exclusivo da ONG

📈 Métricas de Impacto Acompanhadas
Total de ações executadas - Quantidade de eventos registrados

Pontuação acumulada - Soma dos pontos de todas as ações

Pontos por tipo de ação - Detalhamento por categoria

Territórios atendidos - Localizações geográficas das ações

Evidências materiais - Número de arquivos/IPFS registrados

Relatórios trimestrais - Documentos oficiais gerados na blockchain

🔐 Configuração de Acesso 
Apenas a carteira autorizada pode registrar ações e gerar relatórios:
Endereço autorizado: 0x6707e22489528Cc355892c5F5aC927C247ee6CF2
Senha: 011235813213455 (Disponibilizado para monitores conseguirem verificar ambas as páginas)

Para adicionar novos membros da ONG, utilize a função adicionarAutorizado() no contrato.

🎯 Diferenciais do Projeto
Transparência total - Qualquer pessoa pode auditar as ações na blockchain

Prova verificável - Relatórios com hash na blockchain

Automação de relatórios - Geração trimestral automática

Controle de acesso - Apenas ONG autorizada pode registrar

Evidências descentralizadas - IPFS para armazenamento de arquivos

Dashboard intuitivo - Interface clara para financiadores e público

Carteira específica - Segurança na autorização de ações