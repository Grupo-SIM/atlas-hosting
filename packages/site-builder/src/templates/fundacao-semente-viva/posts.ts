import type { Block, Category, Post } from "../../model/index.js";
import { NEWS_COVER } from "./images.js";

/**
 * Notícias de exemplo do template Semente Viva: **fictícias** (eventos, números e pessoas inventados). Seis posts em
 * cinco categorias, com texto próprio. A referência lista as notícias a partir de um feed externo e traz imagens sem
 * descrição; aqui são posts de verdade do site, todos com capa e texto alternativo.
 */
export const CATEGORIES: [slug: string, name: string][] = [
  ["esporte", "Esporte"],
  ["cursos", "Cursos"],
  ["educacao", "Educação"],
  ["melhor-idade", "Melhor idade"],
  ["comunidade", "Comunidade"],
];

export const categories: Category[] = CATEGORIES.map(([slug, name]) => ({
  id: `cat-${slug}`,
  name,
  slug,
}));

const text = (id: string, value: string): Block => ({
  id,
  props: { text: value },
  type: "text",
});

interface Seed {
  body: string[];
  category: string;
  cover: string;
  date: string;
  excerpt: string;
  slug: string;
  title: string;
}

const SEEDS: Seed[] = [
  {
    body: [
      "Mais de 200 crianças e adolescentes entraram em campo no último sábado para o campeonato de futebol da fundação, que reuniu 16 times de bairros vizinhos.",
      "Além dos jogos, a programação teve oficina de arbitragem, lanche coletivo e entrega de medalhas para todos os participantes. O foco do torneio não é o placar: é o trabalho em equipe e o respeito entre os times.",
      "As inscrições para a próxima turma de treinos estão abertas. Basta procurar a coordenação de esportes no horário de atendimento.",
    ],
    category: "esporte",
    cover: NEWS_COVER.campeonato,
    date: "2026-11-08T10:00:00Z",
    excerpt:
      "Dezesseis times de bairros vizinhos disputaram o torneio, com oficina de arbitragem, lanche coletivo e medalhas para todos.",
    slug: "campeonato-de-futebol-reune-200-criancas-e-adolescentes",
    title: "Campeonato de futebol reúne 200 crianças e adolescentes",
  },
  {
    body: [
      "Quarenta jovens receberam o certificado do curso de informática básica em uma cerimônia simples, com a presença das famílias e dos professores voluntários.",
      "Durante quatro meses, a turma aprendeu a usar planilhas e editores de texto, a montar um currículo e a procurar vagas pela internet. Parte dos formandos já foi chamada para entrevistas.",
      "Uma nova turma começa no próximo trimestre, com aulas à noite para quem trabalha durante o dia.",
    ],
    category: "cursos",
    cover: NEWS_COVER.formatura,
    date: "2026-10-22T18:00:00Z",
    excerpt:
      "Turma de informática básica se formou depois de quatro meses de aulas gratuitas com professores voluntários.",
    slug: "turma-de-informatica-se-forma-e-40-jovens-recebem-certificado",
    title: "Turma de informática se forma e 40 jovens recebem certificado",
  },
  {
    body: [
      "O reforço escolar da fundação abriu novas vagas para o ano letivo. As aulas acontecem duas vezes por semana, em turmas pequenas, com foco em leitura, escrita e matemática.",
      "Os professores voluntários também organizam oficinas de leitura e rodas de conversa para as famílias, porque o estudo funciona melhor quando a casa participa.",
      "Para matricular, é preciso levar um documento do estudante e o comprovante de matrícula da escola.",
    ],
    category: "educacao",
    cover: NEWS_COVER.voltaAulas,
    date: "2026-02-02T09:00:00Z",
    excerpt:
      "Reforço escolar e oficinas de leitura têm vagas abertas, com turmas pequenas e professores voluntários.",
    slug: "volta-as-aulas-reforco-escolar-abre-novas-vagas",
    title: "Volta às aulas: reforço escolar abre novas vagas",
  },
  {
    body: [
      "Três centenas de cestas básicas e kits de higiene foram entregues a famílias da comunidade na ação de Natal da fundação.",
      "Os itens foram arrecadados em campanhas de empresas parceiras e de moradores que abriram mão de um pouco do que tinham para dividir com os vizinhos. Voluntários separaram, montaram e levaram as cestas até as casas.",
      "A fundação agradece a cada pessoa que participou e já prepara a campanha deste ano.",
    ],
    category: "comunidade",
    cover: NEWS_COVER.natal,
    date: "2025-12-20T16:00:00Z",
    excerpt:
      "Voluntários montaram e entregaram 300 cestas básicas e kits de higiene a famílias da comunidade.",
    slug: "acao-de-natal-entrega-300-cestas-para-familias",
    title: "Ação de Natal entrega 300 cestas para famílias da comunidade",
  },
  {
    body: [
      "A feira de saúde para idosos reuniu equipes de enfermagem, nutrição e fisioterapia, com aferição de pressão, teste de glicemia, orientação alimentar e alongamento em grupo.",
      "Mais de 120 pessoas passaram pelos atendimentos. Quem precisou foi encaminhado para a unidade de saúde do bairro, com o relatório em mãos.",
      "Os encontros semanais da melhor idade continuam: são atividades físicas leves, conversa e acompanhamento de saúde, sempre em grupo.",
    ],
    category: "melhor-idade",
    cover: NEWS_COVER.saude,
    date: "2026-07-18T08:30:00Z",
    excerpt:
      "Mais de 120 idosos fizeram exames simples e receberam orientação de profissionais de saúde voluntários.",
    slug: "feira-de-saude-leva-exames-e-orientacao-a-idosos",
    title: "Feira de saúde leva exames e orientação a idosos",
  },
  {
    body: [
      "No mutirão de sábado, cerca de 50 voluntários pintaram as paredes, consertaram o telhado e plantaram canteiros no espaço de convivência da fundação.",
      "A tarefa foi dividida em equipes, e as crianças do projeto ajudaram a escolher as cores e a regar as primeiras mudas. No fim do dia, todo mundo almoçou junto.",
      "Quer participar do próximo mutirão? Fale com a gente pelo formulário de contato e diga em que pode ajudar.",
    ],
    category: "comunidade",
    cover: NEWS_COVER.mutirao,
    date: "2026-06-06T09:00:00Z",
    excerpt:
      "Cerca de 50 voluntários reformaram e plantaram canteiros no espaço de convivência durante um sábado inteiro.",
    slug: "mutirao-de-voluntarios-reforma-o-espaco-de-convivencia",
    title: "Mutirão de voluntários reforma o espaço de convivência",
  },
];

export const posts: Post[] = SEEDS.map((s, i) => ({
  blocks: s.body.map((t, j) => text(`sv-post-${i}-${j}`, t)),
  categoryId: `cat-${s.category}`,
  coverImage: s.cover,
  excerpt: s.excerpt,
  id: `post-${i + 1}`,
  publishedAt: s.date,
  slug: s.slug,
  status: "published",
  title: s.title,
}));
