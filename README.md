# BISEPLAN

PROMPT MESTRE — DASHBOARD EXECUTIVO SEPLAN ITAPOÁ

Crie o painel final de apresentação e análise operacional da Secretaria de Planejamento Urbano — SEPLAN de Itapoá/SC, utilizando React + Vite, com interface profissional, responsiva, rápida e preparada para receber atualização periódica da base de dados.

Este não é um dashboard genérico de BI e não deve parecer uma planilha transformada em gráficos.

O sistema deve permitir que uma pessoa da gestão compreenda em poucos segundos:

quanto entrou → quanto foi produzido → quanto permaneceu em estoque → onde está o estoque → há quanto tempo está parado → quais demandas estão pressionando a equipe → quais protocolos formam aquele número.

1. OBJETIVO DO PAINEL

O objetivo principal é demonstrar, com dados rastreáveis:

volume de demanda recebida;

produção efetivamente realizada;

evolução da demanda;

evolução da produção;

estoque atual de processos;

envelhecimento desse estoque;

tempo necessário para atendimento das principais demandas;

distribuição do trabalho entre setores/equipe;

principais categorias de serviço;

pontos de concentração ou gargalo;

comparação entre 2025 e 2026;

acesso direto aos registros que originaram qualquer indicador.

O painel deve responder principalmente:

A demanda aumentou ou diminuiu?

A equipe está produzindo mais ou menos?

A produção acompanha a entrada de novos processos?

Quanto trabalho ainda está pendente?

Onde esse estoque está concentrado?

Há quanto tempo esses processos estão aguardando?

Quais tipos de processo estão levando mais tempo?

Qual setor ou grupo está absorvendo maior volume de demanda?

2. PRINCÍPIO DE LEITURA

Toda a arquitetura deve seguir:

DEMANDA → PRODUÇÃO → ESTOQUE → TEMPO → GARGALO → DETALHAMENTO

Não misturar conceitos diferentes.

Especialmente:

Recebidos = demanda de entrada;

Concluídos = produção realizada;

Estoque = processos ainda não concluídos;

processos herdados de períodos anteriores devem continuar identificáveis;

produção não pode ser artificialmente aumentada somando entrada, estoque ou passivo anterior;

comparação entre períodos deve usar bases equivalentes.

Não atribuir automaticamente atraso à SEPLAN apenas porque um processo está aberto.

O status real do processo deve permitir distinguir situações como:

efetivamente em análise;

aguardando providência externa;

aguardando requerente;

tramitação administrativa;

concluído;

encerrado;

demais situações reais existentes na base normalizada.

3. REGRA FUNDAMENTAL SOBRE OS DADOS

O frontend NÃO deve classificar os protocolos.

A base que alimentará o sistema já será submetida a um processo de ETL e classificação semântica.

Utilizar prioritariamente os campos finais normalizados da base, como:

categoria final;

situação final;

datas;

responsável;

setor;

protocolo;

observações necessárias ao detalhamento;

demais dimensões consolidadas existentes.

Manter os campos originais disponíveis apenas para rastreabilidade e auditoria.

PROIBIDO

inventar categorias;

corrigir categorias automaticamente;

criar status;

combinar duas categorias;

usar categoria CANDIDATA;

inferir valores inexistentes;

inventar SLA;

criar metas sem fonte;

completar dados ausentes;

usar números mockados como se fossem reais;

hardcode de indicadores.

Quando o dado não existir, mostrar claramente:

“Dado não disponível na base.”

4. ESTRUTURA PRINCIPAL

Criar uma aplicação com:

VISÃO EXECUTIVA

Tela principal de apresentação.

DEMANDA

Análise das entradas de protocolos.

PRODUÇÃO

Análise das conclusões e produtividade.

ESTOQUE E TEMPO

Processos pendentes, envelhecimento e tempos.

CATEGORIAS

Análise das diferentes demandas da SEPLAN.

SETORES / EQUIPE

Distribuição operacional do trabalho.

EXPLORADOR DE PROTOCOLOS

Tabela analítica completa para investigação dos registros.

A navegação deve ser simples e permanente.

5. TELA 01 — VISÃO EXECUTIVA

Essa é a tela mais importante.

Ela precisa funcionar em reunião, apresentação para chefia e análise operacional.

Evitar excesso de informação.

PRIMEIRA LINHA — 5 KPIs

Mostrar no máximo cinco indicadores principais:

1. RECEBIDOS

Quantidade de novos protocolos recebidos no período selecionado.

Mostrar:

valor atual;

comparação com período equivalente anterior;

variação absoluta;

variação percentual.

2. CONCLUÍDOS

Quantidade de processos efetivamente concluídos no período.

Mesma lógica comparativa.

3. ESTOQUE ATUAL

Quantidade de protocolos ainda não concluídos na data de referência.

Este indicador representa a carga de trabalho acumulada.

4. TEMPO MEDIANO

Tempo mediano de atendimento/conclusão dos processos.

Usar mediana como indicador principal, evitando que poucos processos extremamente antigos distorçam a percepção.

Quando pertinente, média pode aparecer como informação secundária.

Sempre indicar a unidade:

dias

5. PARADOS HÁ MAIS DE 30 DIAS

Quantidade de protocolos atualmente em estoque cuja última movimentação ou referência temporal válida ultrapasse 30 dias, conforme a estrutura disponível na base.

Permitir clicar e visualizar imediatamente os protocolos.

6. GRÁFICO PRINCIPAL — ENTRADA × CONCLUSÃO

Criar gráfico temporal mensal comparando:

protocolos recebidos;

protocolos concluídos.

Mostrar inicialmente 2025 × 2026 de forma claramente comparável.

Objetivo:

identificar se a produção está acompanhando a demanda.

Preferência visual:

linhas ou colunas agrupadas;

valores claramente legíveis;

tooltip detalhado;

possibilidade de selecionar mês;

comparação com período equivalente.

Não usar gráfico meramente decorativo.

Ao clicar em qualquer mês, todos os demais elementos devem responder ao filtro.

7. DEMANDA POR CATEGORIA

Mostrar quais serviços estão gerando maior volume de entrada.

Utilizar as categorias finais normalizadas.

Preferencialmente:

ranking horizontal ordenado por volume.

Exibir:

categoria;

quantidade;

percentual da demanda;

comparação 2025 × 2026 quando aplicável.

Evitar pizza/donut quando houver muitas categorias.

O usuário deve perceber imediatamente quais demandas mais pressionam a Secretaria.

8. PRODUÇÃO POR CATEGORIA

Criar visual equivalente mostrando o volume concluído de cada categoria.

Isso permite comparar:

o que entra × o que a equipe consegue entregar.

Disponibilizar uma visão onde seja possível identificar situações como:

muita entrada + muita produção;

muita entrada + pouca produção;

pouca entrada + estoque elevado.

Não transformar essas relações automaticamente em causa.

Mostrar os dados; interpretações devem ser sustentadas pelos números.

9. ESTOQUE POR FAIXA DE IDADE

Criar um painel de envelhecimento do estoque.

Faixas sugeridas:

0–7 dias;

8–15 dias;

16–30 dias;

31–60 dias;

61–90 dias;

acima de 90 dias.

As faixas devem poder ser ajustadas na implementação caso a distribuição real demonstre necessidade.

Mostrar:

quantidade;

percentual;

categoria;

setor/responsável quando disponível.

A representação deve tornar os processos antigos visualmente evidentes.

10. SITUAÇÃO REAL DOS PROCESSOS

Criar distribuição usando SITUAÇÃO FINAL normalizada, não necessariamente o texto bruto do sistema de protocolo.

As situações precisam representar operacionalmente o que está acontecendo.

Mostrar quantidade e percentual.

O usuário precisa conseguir diferenciar rapidamente:

processo trabalhando dentro da SEPLAN

de

processo aguardando ação externa/requerente

de

processo efetivamente concluído.

Não interpretar todo processo aberto como atraso interno.

11. TEMPO POR TIPO DE DEMANDA

Criar ranking das categorias pelo tempo de atendimento.

Mostrar prioritariamente:

mediana;

quantidade de processos;

percentis ou distribuição quando houver espaço;

média apenas como informação complementar.

Exemplo de leitura desejada:

Alvará de Construção — 60 dias

Esse número precisa ser imediatamente compreensível, porque representa impacto real para quem depende daquele serviço.

Não esconder o número dentro de gráficos complexos.

Sempre mostrar:

valor + unidade + universo analisado.

12. PRODUÇÃO POR SETOR / EQUIPE

Criar página específica para avaliar a produção operacional.

Mostrar, conforme os campos disponíveis:

recebidos;

concluídos;

estoque;

tempo mediano;

processos antigos;

participação no volume total.

Permitir comparação entre setores sem sugerir automaticamente que volume menor significa desempenho inferior.

Categorias possuem complexidades e tempos diferentes.

A interface deve apresentar os dados de forma neutra.

13. SAZONALIDADE

Sazonalidade NÃO deve ser tratada como o objetivo principal do dashboard.

Ela é uma variável de interpretação posterior.

O painel primeiro deve demonstrar objetivamente:

demanda;

produção;

estoque;

tempo;

distribuição.

Somente posteriormente padrões sazonais podem ajudar a explicar oscilações e subsidiar planejamento ou ações corretivas.

Não utilizar sazonalidade para justificar automaticamente aumento ou queda de demanda.

14. COMPARAÇÃO 2025 × 2026

A comparação temporal é central.

Sempre que estatisticamente e temporalmente válido, permitir:

2025 × 2026

ou

período atual × mesmo período do ano anterior.

Se 2026 ainda estiver incompleto, comparar somente períodos equivalentes.

Exemplo:

01/01/2025–25/08/2025

versus

01/01/2026–25/08/2026.

Nunca comparar um ano completo contra um ano parcial sem informar claramente essa diferença.

15. DRILL-DOWN / DETALHAMENTO

Todo indicador importante deve ser clicável.

O comportamento esperado é:

KPI → distribuição → protocolos individuais

Exemplo:

Estoque atual

→ clicar

→ visualizar estoque por categoria

→ clicar em Alvará de Construção

→ visualizar faixas de idade

→ clicar em >60 dias

→ abrir tabela com os protocolos correspondentes.

O usuário nunca deve ficar preso em um gráfico sem conseguir descobrir quais registros produziram aquele resultado.

16. EXPLORADOR DE PROTOCOLOS

Criar uma tabela analítica poderosa, porém visualmente limpa.

Colunas conforme disponibilidade da base:

Número/Ano;

Data de abertura;

Categoria final;

Situação final;

setor;

responsável;

idade do protocolo;

tempo de atendimento;

última movimentação;

requerente quando adequado;

observação relevante;

ano.

Permitir:

pesquisa por protocolo;

ordenação;

filtros;

filtros combinados;

paginação;

exportação dos registros filtrados.

A tabela deve refletir exatamente o filtro aplicado no dashboard.

17. FILTROS GLOBAIS

Criar barra de filtros clara e compacta.

Priorizar:

período;

ano;

categoria;

situação;

setor;

responsável.

Mostrar filtros ativos.

Adicionar botão:

Limpar filtros

Evitar dezenas de filtros simultaneamente.

18. INTERAÇÃO ENTRE VISUAIS

Todos os componentes devem ser interativos.

Exemplo:

clicar em uma categoria deve atualizar:

KPIs;

evolução mensal;

tempo;

estoque;

situações;

tabela.

O painel deve funcionar como ferramenta investigativa, não como conjunto independente de gráficos.

19. DESIGN VISUAL

Criar aparência de sistema executivo institucional moderno.

Não parecer:

template genérico;

painel financeiro;

planilha;

Power BI padrão;

sistema SaaS comercial genérico;

interface carregada de gradientes;

apresentação cheia de cards ornamentais.

DIREÇÃO VISUAL

Usar:

fundo claro neutro;

alto contraste;

muito espaço em branco;

cards discretos;

bordas suaves;

sombras mínimas;

tipografia extremamente legível;

grid consistente;

alinhamento rigoroso.

Visual institucional, técnico e contemporâneo.

20. CORES COM SIGNIFICADO

As cores devem possuir função semântica.

Exemplo conceitual:

Neutro
informação normal ou sem julgamento.

Positivo
resultado favorável comprovado pela métrica.

Atenção
situação que exige observação.

Crítico
estoque envelhecido, valor fora do parâmetro ou outra condição objetivamente definida.

Não pintar números automaticamente de verde/vermelho apenas porque aumentaram ou diminuíram.

Exemplo:

+20% de protocolos recebidos

não é necessariamente positivo.

Pode significar aumento de demanda.

A cor precisa refletir o significado operacional da métrica.

21. HIERARQUIA DOS NÚMEROS

Números importantes devem ser grandes e imediatamente visíveis.

Sempre mostrar unidade.

Exemplos:

683 protocolos

42 dias

+18,4%

Nunca mostrar apenas:

683

42

18,4

O usuário não deve precisar interpretar mentalmente a unidade.

22. TOOLTIPS

Criar tooltips informativos.

Além do valor, mostrar quando pertinente:

definição do indicador;

período;

quantidade;

comparação;

universo considerado.

Evitar textos longos.

23. DEFINIÇÕES DOS INDICADORES

Adicionar ícone discreto de informação nos principais indicadores.

Exemplo:

Estoque atual ⓘ

Tooltip:

“Protocolos ainda não classificados como concluídos na data de referência.”

Isso reduz divergências de interpretação durante apresentação.

24. NÃO CRIAR UM SCORE GENÉRICO

Não criar:

nota geral da SEPLAN;

índice artificial de eficiência;

performance score;

semáforo global;

ranking de funcionário;

indicador composto arbitrário.

Cada indicador deve preservar significado operacional próprio.

25. DIFERENÇA ENTRE CORRELAÇÃO E CAUSA

O painel pode mostrar padrões.

Exemplo:

entrada aumentou enquanto estoque aumentou.

Mas não afirmar:

“o estoque aumentou porque a equipe produziu pouco”

sem evidência.

Apresentar fatos primeiro.

Diagnóstico causal pertence a uma fase posterior de gestão e melhoria contínua.

26. IMPACTO OPERACIONAL

Embora o painel seja executivo, seus números representam consequências reais.

Tempos elevados em determinados serviços podem significar:

obras aguardando autorização;

equipes contratadas aguardando;

investimentos parados;

requerentes aguardando documentação;

empresas aguardando implantação;

processos administrativos represados.

Esses impactos servem como princípio de projeto para dar relevância aos indicadores.

Não criar esses impactos como dados mensurados se não estiverem presentes na base.

27. FUTURA CAMADA DE GESTÃO

A arquitetura deve permitir evolução futura para ferramentas como:

Pareto;

PDCA;

5W2H;

Ishikawa;

análise de causa;

plano de ação;

acompanhamento de melhorias.

Porém:

NÃO implementar essa camada agora na tela executiva principal.

Primeiro precisamos estabelecer corretamente:

INDICADOR → PROBLEMA → REGISTROS

Somente depois:

PROBLEMA → CAUSA → AÇÃO

28. RESPONSIVIDADE

Prioridade:

Desktop / notebook

Uso principal para análise e apresentação.

Também adaptar adequadamente para:

tablets;

smartphones.

Em telas pequenas, preservar primeiro:

KPIs;

gráfico Entrada × Conclusão;

principais gargalos;

filtros.

29. ESTADOS DA INTERFACE

Criar estados profissionais para:

carregamento;

base vazia;

filtro sem resultados;

dado inexistente;

erro de importação;

atualização.

Nunca substituir ausência de informação por zero sem saber que o valor é efetivamente zero.

30. RASTREABILIDADE

Todo número apresentado precisa ser reproduzível a partir da base.

Sempre que possível, permitir:

clicar no número → visualizar os registros que compõem o número.

Essa é uma exigência estrutural do projeto.

31. COMPONENTES REUTILIZÁVEIS

Estruturar o frontend com componentes reutilizáveis, por exemplo:

KpiCard

ComparisonBadge

PeriodFilter

FilterBar

MonthlyFlowChart

CategoryRanking

AgingDistribution

StatusDistribution

SectorPerformance

ProcessTable

DetailDrawer

MetricInfo

EmptyState

Evitar componentes monolíticos.

32. ARQUITETURA DE DADOS

Separar claramente:

dados

de

apresentação.

Criar uma camada única de transformação para alimentar os componentes.

Evitar cálculos diferentes do mesmo KPI em componentes distintos.

Indicadores devem possuir uma única definição reutilizável.

Preparar o sistema para troca futura da fonte de dados sem reconstrução completa da interface.

33. PRECISÃO NUMÉRICA

Não inventar casas decimais.

Regras gerais:

protocolos → inteiro;

dias → preferencialmente inteiro ou uma decimal quando necessário;

percentual → uma casa decimal;

datas → padrão brasileiro;

milhares → separação adequada para PT-BR.

34. CABEÇALHO

Criar cabeçalho discreto:

SEPLAN | Itapoá

Título:

Painel Executivo

Subtítulo:

Demanda, produção, estoque e tempo de atendimento

Exibir também:

Dados atualizados até: DD/MM/AAAA HH:mm

35. TELA INICIAL — COMPOSIÇÃO RECOMENDADA

Organizar aproximadamente assim:

LINHA 1

Cabeçalho + filtros globais

LINHA 2

5 KPIs principais

Recebidos | Concluídos | Estoque Atual | Tempo Mediano | >30 dias

LINHA 3

Gráfico principal ocupando maior área:

Entrada × Conclusão — evolução mensal

Ao lado:

Situação atual do estoque

LINHA 4

Principais demandas

Envelhecimento do estoque

LINHA 5

Tempo por categoria

Produção / estoque por setor

FINAL

acesso para:

Ver protocolos

36. DETALHAMENTO LATERAL

Ao clicar em indicadores ou gráficos, preferir inicialmente abrir um drawer lateral ou painel de detalhamento.

Isso permite investigar sem perder o contexto da página.

O drawer pode apresentar:

indicador selecionado;

filtros que produziram o resultado;

distribuição;

principais categorias;

protocolos correspondentes;

botão para abrir análise completa.

37. PRIORIDADE VISUAL

A hierarquia da tela deve ser:

1º

O número.

2º

A comparação.

3º

A tendência.

4º

A distribuição.

5º

Os registros.

Não começar por textos explicativos.

38. PRINCÍPIO DE APRESENTAÇÃO

Imagine o seguinte cenário:

A chefia pergunta:

“Estamos recebendo mais processos este ano?”

A resposta precisa estar visível.

Depois:

“Estamos conseguindo acompanhar?”

A resposta precisa estar logo ao lado.

Depois:

“Então onde está acumulando?”

Um clique deve responder.

Depois:

“Quais processos são esses?”

Outro clique deve chegar aos registros.

Este fluxo deve orientar toda a experiência.

39. NÃO EXPOR RACIOCÍNIO INTERNO DA CLASSIFICAÇÃO

O dashboard final não precisa apresentar:

heurísticas de classificação;

regras internas do ETL;

persona de engenharia utilizada na análise;

raciocínio semântico;

categorias candidatas;

decisões intermediárias de normalização.

Isso pertence à camada técnica/auditoria, não à apresentação executiva.

O painel deve mostrar apenas o resultado consolidado e rastreável.

40. RESTRIÇÕES DE ESCOPO

Não transformar esta aplicação agora em:

sistema de protocolo;

workflow;

sistema de tarefas;

CRM;

ERP;

ferramenta de RH;

sistema de avaliação individual;

aplicativo de plano de ação completo;

sistema para edição manual dos dados;

plataforma de gestão documental.

O produto atual é:

UM SISTEMA ANALÍTICO PARA ENTENDER A OPERAÇÃO DA SEPLAN.

41. CRITÉRIO DE SUCESSO

A primeira tela deve permitir responder, sem treinamento prévio:

Quanto entrou?

Quanto saiu?

Quanto ficou?

Quanto tempo está levando?

Onde está o problema?

E, com no máximo alguns cliques:

Quais protocolos estão formando esse resultado?

Se uma informação visual não ajudar a responder uma dessas perguntas, avaliar se realmente precisa estar na tela principal.

42. IMPLEMENTAÇÃO

Construa efetivamente a aplicação.

Não entregue apenas wireframe ou descrição.

Criar:

layout completo;

componentes;

navegação;

gráficos;

filtros;

interações;

drill-down;

drawer;

tabela;

estados vazios;

responsividade.

Se ainda não houver dataset conectado durante a criação, estruturar uma camada de dados separada para integração posterior.

Dados temporários utilizados apenas para desenvolver componentes devem estar explicitamente identificados no código como DEMO, nunca apresentados ao usuário como dados reais da SEPLAN.

43. ORDEM DE IMPLEMENTAÇÃO

Priorizar nesta sequência:

arquitetura geral;

Visão Executiva;

filtros;

KPIs;

Entrada × Conclusão;

demanda por categoria;

estoque/envelhecimento;

situações;

tempo por categoria;

setor/equipe;

drill-down;

explorador de protocolos;

responsividade;

refinamento visual.

Não gastar esforço primeiro em animações ou elementos ornamentais.

44. RESULTADO FINAL ESPERADO

O resultado deve transmitir:

clareza

controle

rastreabilidade

capacidade de análise

relevância operacional

credibilidade técnica

Ao abrir o dashboard, a percepção não deve ser:

“há muitos gráficos”.

A percepção deve ser:

“Agora consigo entender exatamente o que está acontecendo na SEPLAN e chegar aos processos que explicam cada resultado.”

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://seplanbi.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5f5fe473-3a02-42bf-9ceb-d0087da03bb5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
