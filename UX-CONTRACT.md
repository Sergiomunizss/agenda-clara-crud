# Agenda Clara — contrato de interação

## Fonte e escopo
Fonte de negócio: enunciado Tarefa 2 fornecido no chat. Dados locais, CRUD individual,
sem autenticação, pagamentos ou integração ativa. Deleção remove apenas registro deste
navegador, mediante confirmação explícita. Usar somente dados de demonstração.

## Mapa canônico
| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Form | #formulario + currentForm/validation/openEditor em script.js | este contrato | criar/editar | ciclo CRUD, validação, foco |
| CRUD | script.js + STORAGE_KEY | enunciado e este contrato | create/read/update/delete locais | persistência, cancelamento |
| Select/Listbox | select nativo + style.css | DESIGN.md | filtro/status do cliente | teclado e popup do SO |
| Toast | announce + #mensagem | este contrato | confirmação informativa | live region |
| Scrollbar | :root + globais em style.css | DESIGN.md | normal/forced-colors | inspeção de CSS |
| Dialog | #editor e #confirmacao | este contrato | formulário/exclusão/descarte | foco, Escape e cancelamento |

## Lista e navegação
Ordem alfabética pt-BR, 8 registros por página. Filtros locais imediatos por nome/e-mail
(sem distinção de acentos) e status. Limpar busca devolve foco ao campo. Contadores
representam todos os clientes; rodapé representa resultados filtrados. Paginação é
limitada após excluir/filtrar. Filtros são transitórios, sem URL: podem conter dados
pessoais, e o escopo é uma aplicação estática sem navegação entre rotas.
Após salvar, filtros são limpos e a página do registro salvo é exibida. Após excluir,
a lista é atualizada e o foco retorna a Novo cliente.

## Formulário e confirmação
Campos obrigatórios: nome (2–100 caracteres), e-mail válido e único. Telefone opcional
com 10–15 dígitos; cidade opcional até 80 caracteres; status ativo ou inativo.
Erros preservam dados, indicam campo com aria-invalid e focam o primeiro inválido.
Nome/e-mail são texto, nunca inseridos com innerHTML. Submit duplicado é bloqueado.
Cancelar/Escape pede confirmação se há alterações. Diálogos são modais e confinam foco
com showModal; confirmação inicia em Cancelar. Exclusão sempre identifica o cliente.

## Dados e falhas
localStorage por origem/navegador, versão v1. Primeira visita recebe seis exemplos com
example.com. Lista vazia salva continua vazia após recarregar. Escrita falha mantém
formulário e mensagem de recuperação. Eventos storage atualizam outras abas; edição
com registro alterado em outra aba é impedida com aviso para reabrir. Outras inclusões
são preservadas pela releitura antes de mutações. Sem sincronização entre dispositivos.
Sem loading remoto: não existe back-end; callbacks REST são apenas comentários.
Exportação CSV inclui todos os resultados filtrados, UTF-8 com BOM e proteção básica
contra interpretação de fórmulas. Datas são data civil brasileira dd/mm/aaaa.

## Responsividade
Mesmos dados e ações em desktop/tablet/celular. Data de cadastro é informação secundária
oculta em <=1000px, mantendo-a no CSV. Tela móvel não perde editar/excluir/filtrar.
Formulário tem rolagem própria quando necessário; ações permanecem alcançáveis.
