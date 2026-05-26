// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
  REGISTRO DE IMPACTO - PLATAFORMA DE REGISTRO DE AÇÕES DE IMPACTO
  
  PROBLEMA RESOLVIDO:
  - ONGs enfrentam dificuldade para comprovar impacto a financiadores
  - Relatórios manuais não são confiáveis e podem ser fraudados
  - Falta de transparência e auditabilidade nas ações realizadas
  
  SOLUÇÃO:
  - Cada ação vira uma transação imutável na blockchain
  - Evidências armazenadas no IPFS com hash registrado
  - Relatórios trimestrais gerados on-demand com prova verificável
  
*/

// Biblioteca DateTime
import "./libraries/BokkyPooBahsDateTimeLibrary.sol";


// CONTRATO PRINCIPAL

contract RegistroImpacto {
    
    using BokkyPooBahsDateTimeLibrary for uint256;
    
    // ESTRUTURAS DE DADOS 

    struct TipoAcao {
        string nome;
        uint256 pontos;
        bool ativo;
    }
    

    struct EventoImpacto {
        uint256 id;
        address autor;
        uint256 tipoAcaoId;
        string latitude;
        string longitude;
        string hashEvidencia;
        uint256 participantes;
        uint256 timestamp;
        uint256 pontos;
    }
    

    struct RelatorioTrimestral {
        uint256 totalPontos;
        uint256 totalEventos;
        uint256[] pontosPorTipo;
        uint256 timestamp;
        address geradoPor;
        bytes32 hashRelatorio;
    }
    
    // VARIÁVEIS DE ESTADO 
    
    // Mapeia ID do evento
    mapping(uint256 => EventoImpacto) public eventos;
    uint256 public contadorEventos;
    
    // Mapeia ID do tipo
    mapping(uint256 => TipoAcao) public tiposAcao;
    uint256[] public tiposAcaoAtivos;
    uint256 public proximoIdTipoAcao = 1;
    
    // Contadores por trimestre
    mapping(uint256 => mapping(uint256 => uint256)) public pontosPorTrimestre;
    mapping(uint256 => mapping(uint256 => uint256)) public eventosPorTrimestre;
    
    // Relatórios oficiais
    mapping(uint256 => mapping(uint256 => RelatorioTrimestral)) public relatorios;
    mapping(uint256 => mapping(uint256 => bool)) public relatorioGerado;
    
    // Pontos detalhados por tipo dentro de cada relatório
    mapping(uint256 => mapping(uint256 => mapping(uint256 => uint256))) public pontosPorTipoNoRelatorio;
    
    // Controle de acesso
    mapping(address => bool) public autorizados;
    address public dono;
    

    // EVENTOS 
    
    // Emitido quando um novo evento de impacto é registrado
    event EventoRegistrado(
        uint256 indexed id,
        address indexed autor,
        uint256 indexed tipoAcaoId,
        uint256 pontos,
        uint256 participantes,
        uint256 timestamp
    );
    
    // Emitido quando um relatório trimestral é gerado
    event RelatorioGerado(
        uint256 indexed ano,
        uint256 indexed trimestre,
        uint256 totalPontos,
        uint256 totalEventos,
        bytes32 hashRelatorio
    );
    
    // Emitido quando um novo tipo de ação é adicionado
    event NovoTipoAcaoAdicionado(
        uint256 indexed id,
        string nome,
        uint256 pontos
    );
    
    // Emitido quando um novo usuário é autorizado a registrar eventos
    event AutorizadoAdicionado(address indexed usuario);
    

    // MODIFICADORES 
    
    // Apenas o dono do contrato pode executar a função
    modifier apenasDono() { 
        require(msg.sender == dono, "!dono"); 
        _; 
    }
    
    // Apenas endereços autorizados podem executar a função
    modifier apenasAutorizado() { 
        require(autorizados[msg.sender], "!autorizado"); 
        _; 
    }
    
    // Verifica se o trimestre é válido
    modifier trimestreValido(uint256 t) { 
        require(t >= 1 && t <= 4, "trimestre 1-4"); 
        _; 
    }

    
    // CONSTRUTOR
    
    constructor() {
        dono = msg.sender;
        autorizados[msg.sender] = true;
        
        _addTipo("Vistoria Tecnica", 5);           // ID 1
        _addTipo("Reuniao Comunitaria", 1);        // ID 2
        _addTipo("Notificacao Extrajudicial", 6);  // ID 3
        _addTipo("Denuncia Publica", 4);           // ID 4
        _addTipo("Oficina de Formacao", 2);        // ID 5
        _addTipo("Articulacao com MP", 6);         // ID 6
    }
    

    // FUNÇÃO PRINCIPAL
    
    // Registrar uma nova ação de impacto
    function registrarImpacto(
        uint256 tipoAcaoId,
        string calldata latitude,
        string calldata longitude,
        string calldata hashEvidencia,
        uint256 participantes
    ) external apenasAutorizado {
        // Validações básicas
        require(tiposAcao[tipoAcaoId].ativo, "tipo invalido");
        require(bytes(hashEvidencia).length > 0, "hash vazio");
        
        // Chama função auxiliar para processar
        _processarRegistro(tipoAcaoId, latitude, longitude, hashEvidencia, participantes);
    }
    
    function _processarRegistro(
        uint256 tipoAcaoId,
        string calldata latitude,
        string calldata longitude,
        string calldata hashEvidencia,
        uint256 participantes
    ) internal {
        // Gera novo ID sequencial
        uint256 id = ++contadorEventos;
        uint256 ts = block.timestamp;
        uint256 pontos = tiposAcao[tipoAcaoId].pontos;
        
        // Calcula trimestre atual para atualizar contadores
        (uint256 ano, uint256 trim) = _getTrimestre(ts);
        pontosPorTrimestre[ano][trim] += pontos;
        eventosPorTrimestre[ano][trim]++;
        
        // Armazena o evento no mapping
        EventoImpacto storage ev = eventos[id];
        ev.id = id;
        ev.autor = msg.sender;
        ev.tipoAcaoId = tipoAcaoId;
        ev.latitude = latitude;
        ev.longitude = longitude;
        ev.hashEvidencia = hashEvidencia;
        ev.participantes = participantes;
        ev.timestamp = ts;
        ev.pontos = pontos;
        
        // Emite evento para indexação off-chain
        emit EventoRegistrado(id, msg.sender, tipoAcaoId, pontos, participantes, ts);
    }
    

    // FUNÇÃO DE RELATÓRIO TRIMESTRAL
    
    function gerarRelatorioTrimestral(uint256 ano, uint256 trimestre) 
        external 
        trimestreValido(trimestre) 
    {
        // Verificações de trimestre e relatório gerado
        require(_trimestreJaPassou(ano, trimestre), "trimestre em andamento");
        require(!relatorioGerado[ano][trimestre], "ja gerado");
        
        // Obtém totais do trimestre
        uint256 totalPontos = pontosPorTrimestre[ano][trimestre];
        uint256 totalEventos = eventosPorTrimestre[ano][trimestre];
        
        // Calcula pontos por tipo de ação
        (uint256 inicio, uint256 fim) = _getLimitesTrimestre(ano, trimestre);
        uint256 totalTipos = tiposAcaoAtivos.length;
        uint256[] memory pontosPorTipo = new uint256[](totalTipos);
        
        // Percorre todos os eventos e soma pontos por tipo
        for (uint256 i = 1; i <= contadorEventos; i++) {
            EventoImpacto memory evento = eventos[i];
            if (evento.timestamp >= inicio && evento.timestamp <= fim) {
                // Encontra o índice do tipo na lista de ativos
                for (uint256 j = 0; j < totalTipos; j++) {
                    if (tiposAcaoAtivos[j] == evento.tipoAcaoId) {
                        pontosPorTipo[j] += evento.pontos;
                        break;
                    }
                }
                // Armazena para consulta futura
                pontosPorTipoNoRelatorio[ano][trimestre][evento.tipoAcaoId] += evento.pontos;
            }
        }
        
        // Gera hash único para verificação de integridade
        bytes32 hashRelatorio = keccak256(
            abi.encodePacked(ano, trimestre, totalPontos, totalEventos, pontosPorTipo, block.timestamp)
        );
        
        // Armazena o relatório na blockchain
        relatorios[ano][trimestre] = RelatorioTrimestral({
            totalPontos: totalPontos,
            totalEventos: totalEventos,
            pontosPorTipo: pontosPorTipo,
            timestamp: block.timestamp,
            geradoPor: msg.sender,
            hashRelatorio: hashRelatorio
        });
        
        relatorioGerado[ano][trimestre] = true;
        
        // Emite evento público
        emit RelatorioGerado(ano, trimestre, totalPontos, totalEventos, hashRelatorio);
    }
    
    // FUNÇÕES DE CONSULTA DE RELATÓRIOS

    function consultarRelatorioTrimestral(uint256 ano, uint256 trimestre) 
        external 
        view 
        returns (
            uint256 totalPontos,
            uint256 totalEventos,
            uint256[] memory pontosPorTipo,
            uint256 timestamp,
            address geradoPor,
            bytes32 hashRelatorio
        ) 
    {
        require(relatorioGerado[ano][trimestre], "nao gerado");
        RelatorioTrimestral memory rel = relatorios[ano][trimestre];
        return (
            rel.totalPontos,
            rel.totalEventos,
            rel.pontosPorTipo,
            rel.timestamp,
            rel.geradoPor,
            rel.hashRelatorio
        );
    }
    

    // Calcula pontos por tipo de ação
    function calcularPontosPorTipo(uint256 ano, uint256 trimestre) 
        external 
        view 
        returns (uint256[] memory ids, uint256[] memory pontos, string[] memory nomes) 
    {
        uint256 totalTipos = tiposAcaoAtivos.length;
        ids = new uint256[](totalTipos);
        pontos = new uint256[](totalTipos);
        nomes = new string[](totalTipos);
        
        for (uint256 i = 0; i < totalTipos; i++) {
            ids[i] = tiposAcaoAtivos[i];
            nomes[i] = tiposAcao[ids[i]].nome;
            
            // Se relatório já foi gerado, usa dados armazenados
            if (relatorioGerado[ano][trimestre]) {
                pontos[i] = pontosPorTipoNoRelatorio[ano][trimestre][ids[i]];
            } else {
                // Caso contrário, calcula ao vivo
                (uint256 inicio, uint256 fim) = _getLimitesTrimestre(ano, trimestre);
                for (uint256 j = 1; j <= contadorEventos; j++) {
                    EventoImpacto memory evento = eventos[j];
                    if (evento.timestamp >= inicio && evento.timestamp <= fim && evento.tipoAcaoId == ids[i]) {
                        pontos[i] += evento.pontos;
                    }
                }
            }
        }
    }
    
    // ADMINISTRAÇÃO DE TIPOS DE AÇÃO
    function adicionarTipo(string calldata nome, uint256 pontos) external apenasDono {
        require(bytes(nome).length > 0, "nome vazio");
        require(pontos > 0, "pontos > 0");
        _addTipo(nome, pontos);
    }
    
    // Função interna para adicionar tipo de ação
    function _addTipo(string memory nome, uint256 pontos) internal {
        uint256 id = proximoIdTipoAcao++;
        tiposAcao[id] = TipoAcao({nome: nome, pontos: pontos, ativo: true});
        tiposAcaoAtivos.push(id);
        emit NovoTipoAcaoAdicionado(id, nome, pontos);
    }
    
    // Atualiza a pontuação de um tipo de ação existente
    function atualizarPontos(uint256 tipoId, uint256 novosPontos) external apenasDono {
        require(tiposAcao[tipoId].ativo, "tipo invalido");
        tiposAcao[tipoId].pontos = novosPontos;
    }
    
    // CONTROLE DE ACESSO 
    
    // Adiciona um novo membro autorizado a registrar eventos
    function adicionarAutorizado(address novo) external apenasDono {
        autorizados[novo] = true;
        emit AutorizadoAdicionado(novo);
    }
    
    // Remove um membro
    function removerAutorizado(address usuario) external apenasDono {
        require(usuario != dono, "nao remove dono");
        autorizados[usuario] = false;
    }
    
    // Verifica se um endereço é autorizado
    function isAutorizado(address usuario) external view returns (bool) {
        return autorizados[usuario];
    }
    

    // FUNÇÕES DE CONSULTA PÚBLICA
    
    // Retorna todos os tipos de ação ativos
    function obterTiposAtivos() 
        external 
        view 
        returns (uint256[] memory ids, string[] memory nomes, uint256[] memory pontos) 
    {
        uint256 total = tiposAcaoAtivos.length;
        ids = new uint256[](total);
        nomes = new string[](total);
        pontos = new uint256[](total);
        
        for (uint256 i = 0; i < total; i++) {
            ids[i] = tiposAcaoAtivos[i];
            nomes[i] = tiposAcao[ids[i]].nome;
            pontos[i] = tiposAcao[ids[i]].pontos;
        }
    }
    
    // Obtém detalhes de um evento específico pelo ID
    function obterEvento(uint256 id) external view returns (EventoImpacto memory) {
        require(id <= contadorEventos, "nao existe");
        return eventos[id];
    }
    
    // Obtém todos os eventos em um período de tempo
    function obterEventosPorPeriodo(uint256 inicio, uint256 fim) 
        external 
        view 
        returns (uint256[] memory ids) 
    {
        uint256 count = 0;
        // Primeiro conta quantos eventos estão no período
        for (uint256 i = 1; i <= contadorEventos; i++) {
            if (eventos[i].timestamp >= inicio && eventos[i].timestamp <= fim) count++;
        }
        
        // Cria array do tamanho exato
        ids = new uint256[](count);
        uint256 idx = 0;
        // Preenche o array
        for (uint256 i = 1; i <= contadorEventos; i++) {
            if (eventos[i].timestamp >= inicio && eventos[i].timestamp <= fim) ids[idx++] = i;
        }
    }
    
    // Retorna o número total de eventos registrados
    function obtertotalEventos() external view returns (uint256) { 
        return contadorEventos; 
    }
    
    // FUNÇÕES AUXILIARES DE DATA
    
    // Converte um timestamp em ano e trimestre
    function _getTrimestre(uint256 ts) internal pure returns (uint256 ano, uint256 trim) {
        ano = ts.getYear();                    
        uint256 mes = ts.getMonth();           
        
        // Converte mês para trimestre
        if (mes <= 3) trim = 1;
        else if (mes <= 6) trim = 2;
        else if (mes <= 9) trim = 3;
        else trim = 4;
    }
    
    // Verifica se um trimestre já passou
    function _trimestreJaPassou(uint256 ano, uint256 trim) internal view returns (bool) {
        uint256 agora = block.timestamp;
        uint256 anoAtual = agora.getYear();
        
        // Se o ano atual é maior, o trimestre já passou
        if (anoAtual > ano) return true;
        // Se o ano atual é menor, o trimestre ainda não chegou
        if (anoAtual < ano) return false;
        
        // Mesmo ano: compara os trimestres
        uint256 mes = agora.getMonth();
        uint256 trimAtual;
        if (mes <= 3) trimAtual = 1;
        else if (mes <= 6) trimAtual = 2;
        else if (mes <= 9) trimAtual = 3;
        else trimAtual = 4;
        
        return trimAtual > trim;
    }
    
    // Retorna os timestamps de início e fim de um trimestre
    function _getLimitesTrimestre(uint256 ano, uint256 trim) 
        internal 
        pure 
        returns (uint256 inicio, uint256 fim) 
    {
        // Define o mês inicial e final do trimestre
        uint256 mi;  // mês início
        uint256 mf;  // mês fim
        
        if (trim == 1) { mi = 1; mf = 3; }
        else if (trim == 2) { mi = 4; mf = 6; }
        else if (trim == 3) { mi = 7; mf = 9; }
        else { mi = 10; mf = 12; }
        
        // Timestamp do primeiro dia do trimestre
        inicio = BokkyPooBahsDateTimeLibrary.timestampFromDateTime(ano, mi, 1, 0, 0, 0);
        
        // Calcula quantos dias tem o último mês do trimestre
        uint256 dias;
        if (mf == 2) {
            dias = BokkyPooBahsDateTimeLibrary.isLeapYear(ano) ? 29 : 28;
        } else if (mf == 4 || mf == 6 || mf == 9 || mf == 11) {
            dias = 30;
        } else {
            dias = 31;
        }
        
        // Timestamp do último dia do trimestre
        fim = BokkyPooBahsDateTimeLibrary.timestampFromDateTime(ano, mf, dias, 23, 59, 59);
    }
}