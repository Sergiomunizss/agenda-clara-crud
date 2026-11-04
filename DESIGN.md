# Agenda Clara — contexto visual

## Produto e público
CRUD acadêmico de clientes para Tarefa 2, feito com HTML, CSS e JavaScript puro.
Público brasileiro; idioma pt-BR. Fonte de requisitos: enunciado fornecido por Sérgio
neste chat (CRUD responsivo, Flexbox/Grid, sem back-end, comentários REST, GitHub/Vercel).
Não existe projeto anterior a preservar; esta pasta é isolada das outras atividades.

## Direção
Uma agenda de contatos clara: marca geométrica azul, números abertos, tabela central
e nenhuma barra lateral. A lista é o produto, sem uma página de apresentação extra.
Referência de tela: ../output/playwright/crud-agenda-clara/conceito.png, gerada para este
projeto. A interface é implementada em código; a imagem não é uma dependência do site.

## Tokens e tipografia
Fonte canônica dos valores em execução: :root de style.css. Nenhuma biblioteca externa.
--brand #1746ed; --brand-hover #1036c2; --ink #101936; --muted #566078;
--border #c9cfdd; --surface #ffffff; --soft #f4f6fa; --footer #edf2f9;
--success #15713d; --danger #b42332; --radius 8px.
Segoe UI para títulos e texto, Arial como fallback. Números tabulares para datas/contagens.
H1 36–48px; texto 14–19px; informações auxiliares 12–13px. Sem carregamento de fontes.
Contraste acessível prevalece sobre a cor exata da imagem de referência.

## Layout e componentes
Flexbox no cabeçalho, ações e rodapé. Grid em resumo, filtros, formulário e linhas móveis.
Desktop: tabela com cinco colunas. Tablet: quatro (data oculta). Celular <=640px:
registros em blocos com nome, contato, status e todas as ações; sem rolagem lateral.
Container 1160px (1280px em telas largas); margens móveis de 16px.
Famílias canônicas: .button (primary/outline/neutral/danger), .icon-button,
.field, .dialog, .notice e .toast. Mesmo formulário para criar e editar.
Selecionadores nativos: geometria e teclado do sistema operacional são aceitos.
Diálogos nativos <dialog> com conteúdo e aparência próprios.

## Acessibilidade
Foco visível, rótulos associados, estados textuais além de cor, nomes acessíveis em
ícones, região de status, erro junto do campo, redução de movimento, barras de rolagem
visíveis. Meta de projeto WCAG 2.2 AA; verificação automatizada não certifica conformidade.

## Anti-referências
Sem gráficos decorativos, herói de marketing, números fictícios de desempenho,
dependências de rede, controles inertes, alert/confirm/prompt ou HTML de dados do usuário.
