# Critérios de Aceite

Critérios de aceite do SRM Credit Engine, descritos conforme o sistema **atualmente implementado** (não aspiracionais). Organizados por usabilidade, segurança, desempenho e escalabilidade, no formato Dado/Quando/Então por funcionalidade.

## Usabilidade

### Criação de transação (Painel do Operador)

- **Dado** que o operador está na tela de Simulação, **quando** a página carrega, **então** os campos Cedente, Tipo de Recebível e Moeda vêm preenchidos com dados reais do backend (não valores fixos no código), com fallback local apenas se a API falhar.
- **Dado** um formulário preenchido, **quando** o operador altera Valor Face ou Prazo, **então** o valor líquido estimado é recalculado em tempo real, usando a taxa base vigente consultada no backend.
- **Dado** um campo inválido (ex: Valor Face vazio ou zero, Prazo ≤ 0 ou não-inteiro), **quando** o campo perde foco ou é alterado, **então** uma mensagem de erro aparece abaixo do campo e o campo é destacado visualmente.
- **Dado** que o formulário tem pelo menos um campo inválido, **quando** o operador tenta submeter, **então** o botão de submit permanece desabilitado até todos os erros serem corrigidos.
- **Dado** que a transação foi criada com sucesso, **quando** o backend responde, **então** uma notificação de sucesso mostra o ID da transação e o valor líquido efetivamente gravado (não apenas o preview local).
- **Dado** que a criação falhou (erro de negócio ou de rede), **quando** o backend responde com erro, **então** uma notificação de erro persiste na tela até o operador fechá-la manualmente (não some sozinha, diferente da notificação de sucesso).

### Extrato de Liquidação

- **Dado** que o operador abre o Extrato, **quando** a página carrega, **então** os últimos 30 dias de transações já aparecem automaticamente, sem exigir que o operador configure filtros antes da primeira busca.
- **Dado** os filtros de Cedente e Moeda de Pagamento, **quando** o operador os abre, **então** eles mostram o **nome** do cedente/moeda (não IDs numéricos) em uma lista suspensa, mas enviam o ID correspondente na consulta ao backend.
- **Dado** o filtro de Status, **quando** o operador o abre, **então** as opções são restritas aos valores válidos (Pendente, Liquidada, Cancelada, Todos) — não é um campo de texto livre.
- **Dado** uma lista de resultados paginada, **quando** o operador navega entre páginas ou muda o tamanho da página, **então** a tabela é recarregada com os dados corretos e o resumo "Página X de Y (Z resultados)" reflete o estado atual.
- **Dado** uma transação com status Pendente, **quando** o operador clica em "Liquidar", **então** a ação é executada, uma notificação confirma o sucesso, e a linha é atualizada para refletir o novo status — sem a necessidade de recarregar a página manualmente.
- **Dado** uma transação já Liquidada ou Cancelada, **então** o botão "Liquidar" não é exibido para essa linha.

### Resiliência da interface

- **Dado** que ocorre um erro inesperado de renderização em qualquer tela (não um erro de API, um bug de componente), **quando** o erro acontece, **então** a aplicação exibe uma tela de fallback ("Algo deu errado" + botão de recarregar) em vez de quebrar para uma tela em branco — a barra lateral de navegação permanece visível e funcional.
- **Dado** que o operador navega para outra rota após um erro, **então** a tela de fallback é descartada e a nova rota renderiza normalmente (o erro não "gruda" na aplicação inteira).

## Segurança

- **Dado** qualquer requisição com corpo, query string ou parâmetro de rota, **quando** ela chega no backend, **então** é validada por um schema Zod antes de tocar qualquer lógica de negócio; entradas inválidas retornam `400` com a lista de campos e mensagens de erro, sem expor stack trace.
- **Dado** uma regra de negócio violada (ex: liquidar uma transação já liquidada, moedas de origem/destino iguais no câmbio), **então** o backend retorna `422` com uma mensagem de negócio clara, não um erro genérico `500`.
- **Dado** uma entidade referenciada que não existe (cedente, produto, transação, taxa de câmbio para o par de moedas), **então** o backend retorna `404`.
- **Dado** um erro não tratado e inesperado no backend, **então** ele é capturado pelo exception handler global, logado no console do servidor, e o cliente recebe `500` com uma mensagem genérica — nunca o stack trace ou detalhes internos.
- **Dado** valores monetários e taxas, **então** todos os cálculos usam `decimal.js` (nunca `Number` puro), evitando erro de arredondamento por ponto flutuante.
- **Limitação conhecida e aceita no escopo atual:** o CORS do backend está aberto (`cors()` sem restrição de origem), adequado para desenvolvimento local/demo desta entrega, mas **não** deveria ir para produção sem uma allowlist de origens. Não há autenticação/autorização implementada — fora do escopo desta entrega.

## Desempenho

- **Dado** uma consulta ao Extrato, **então** ela é paginada no servidor (nunca retorna a tabela inteira) e construída com Knex (SQL direto via query builder), não um ORM genérico, para consultas analíticas eficientes.
- **Dado** o schema do banco, **então** existem índices dedicados para os padrões de consulta do Extrato (`data_transacao`, `moeda_pagamento_id`, `cedente_id` compostos) e para os filtros mais comuns de transações.
- **Dado** listas de baixa volatilidade (cedentes, tipos de recebível, taxa base), **quando** consultadas pelo frontend, **então** o resultado é cacheado em `sessionStorage` com retry e backoff exponencial em caso de falha temporária de rede, evitando reconsultar a API a cada navegação entre páginas.
- **Dado** o build de produção do frontend, **então** ele é servido como estático via Nginx (não via servidor de desenvolvimento), com assets com hash de conteúdo para cache de navegador de longa duração.

## Escalabilidade

- **Dado** o backend, **então** a lógica está separada em três camadas (controller → service → repository) para regras de negócio, e em duas camadas (controller → repository) para relatórios — permitindo evoluir cada camada independentemente.
- **Dado** uma operação de escrita crítica (criar ou liquidar transação), **então** ela roda dentro de uma transação de banco (ACID) com rollback automático em qualquer falha intermediária.
- **Dado** duas requisições concorrentes tentando liquidar a mesma transação, **então** um lock pessimista (`SELECT ... FOR UPDATE`) garante que apenas uma seja bem-sucedida; a outra recebe `422` porque o status já não é mais `PENDENTE` quando ela é processada.
- **Dado** a infraestrutura, **então** banco, backend e frontend rodam como serviços independentes via Docker Compose, cada um com seu próprio Dockerfile, permitindo escalar/substituir cada peça isoladamente.
- **Limitação conhecida e aceita no escopo atual:** não há cache distribuído, réplicas de leitura, sharding, filas ou circuit breaker — deliberadamente fora do escopo desta entrega (nível Pleno), que trata desses tópicos apenas a partir do nível Sênior no case.
