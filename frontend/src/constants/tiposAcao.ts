export const TIPOS_ACAO = {
  1: { nome: "Vistoria Tecnica", pontos: 5, icone: "🔍", cor: "bg-blue-500", descricao: "Inspeção técnica em área ameaçada" },
  2: { nome: "Reuniao Comunitaria", pontos: 1, icone: "🤝", cor: "bg-green-500", descricao: "Mobilização comunitária" },
  3: { nome: "Notificacao Extrajudicial", pontos: 6, icone: "📋", cor: "bg-red-500", descricao: "Notificação formal a empresas/órgãos" },
  4: { nome: "Denuncia Publica", pontos: 4, icone: "📢", cor: "bg-orange-500", descricao: "Exposição pública de ameaças" },
  5: { nome: "Oficina de Formacao", pontos: 2, icone: "🎓", cor: "bg-purple-500", descricao: "Capacitação de comunidades" },
  6: { nome: "Articulacao com MP", pontos: 6, icone: "⚖️", cor: "bg-indigo-500", descricao: "Articulação com Ministério Público" },
};

export type TipoAcaoId = keyof typeof TIPOS_ACAO;