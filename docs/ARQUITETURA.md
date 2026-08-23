# Arquitetura — Radier Estaqueado

Documentação para quem for **modificar o código**, não para quem vai usar o app (ver `docs/manual_usuario_radier_estaqueado.pdf`) nem para entender os métodos de cálculo em si (ver `docs/memoria_tecnica_radier_estaqueado.pdf`).

Este documento assume que você já leu o comentário de convenção de IDs no topo do próprio `radier_estaqueado_unico.html` (linhas 1–40) — ele não é repetido aqui na íntegra, só referenciado.

---

## 1. Visão geral

`radier_estaqueado_unico.html` é um **arquivo único, autocontido** (~7.060 linhas) — HTML, CSS e JS no mesmo arquivo, sem build step, sem dependências instaladas (a única dependência externa é o Three.js, carregado via CDN, só usado pela Vista 3D — ver Seção 7). Abre direto no navegador.

O arquivo tem **13 blocos `<script>`** separados. Isso não é um padrão arquitetural deliberado — é uma marca de como o app foi montado: originalmente dois apps separados (um de "Radier", outro de "Estacas") foram fundidos num arquivo só, e cada um trouxe consigo múltiplos blocos de script já fragmentados. A fusão já foi objeto de uma limpeza (ver Seção 10 — Fase 1 removeu CSS e funções `fmt`/`rb` duplicadas entre os dois blocos originais), mas a fragmentação em si não foi desfeita porque não há necessidade funcional de fazer isso — funções declaradas em blocos diferentes compartilham o mesmo escopo global do documento.

**Não tente dividir isto em múltiplos arquivos.** O app é entregue e distribuído como um único `.html` — essa é uma restrição de produto (facilidade de compartilhar/abrir), não uma limitação técnica a ser corrigida.

---

## 2. Convenção de nomenclatura de IDs

Resumo (ver o comentário completo no topo do arquivo para a versão canônica):

| Prefixo | Módulo |
|---|---|
| `in-*` | Aba 1 · Geometria e Cargas (e aba 4, que usa o mesmo motor `calcularRadier()`) |
| `g-*` | "Dados Globais" (aba 2 · Estacas) — compartilhado entre todas as etapas de estacas |
| `s1-*` … `s6-*` | Estacas, Passo 1 a 6 (ver Seção 3 para qual função calcula cada um) |
| `i-*` | Aba 3 · Interação Radier-Estaca (PDR) |
| `btn-*`, `svg-*`, `main-*`, `side-*`, `mod-*`, `help-*` | Ver comentário no topo do arquivo |

Dentro de cada prefixo de passo, o sufixo geralmente segue `-svg-*`, `-grid-*`, `-checklist-*`, `-form-*`, `-banner-*`, `-tbl-*` para elementos de **saída** (preenchidos via `innerHTML` por um `calcularSX()`), e nomes sem esses sufixos para campos de **entrada** editáveis pelo usuário.

---

## 3. Os 8 motores de cálculo

Cada aba tem uma ou mais funções `calcularX()` que leem os campos de entrada do DOM, calculam, e escrevem os resultados de volta no DOM via `innerHTML`. Nenhuma delas retorna valor — o "retorno" é o efeito colateral de atualizar a tela (ver Seção 10 sobre por que isso limita testabilidade, e o que foi feito a respeito).

| Função | Aba / Passo | Linhas atuais |
|---|---|---|
| `calcularRadier()` | Aba 1 + Aba 4 (mesmo motor) | 207 (orquestra as 6 sub-funções abaixo) |
| &nbsp;&nbsp;`calcRadierRigidez(ctx)` | — | 58 |
| &nbsp;&nbsp;`calcRadierWinkler(ctx)` | — | 131 |
| &nbsp;&nbsp;`calcRadierPuncao(ctx)` | — | 141 |
| &nbsp;&nbsp;`calcRadierArmadura(ctx)` | — | 172 |
| &nbsp;&nbsp;`calcRadierQuantitativos(ctx)` | — | 104 |
| &nbsp;&nbsp;`calcRadierResumo(ctx)` | — | 25 |
| `calcularS1()` | Aba 2, Passo 1 (Estaca Isolada) | 120 |
| `calcularS2()` | Aba 2, Passo 2 (Grupo de Estacas) | 128 |
| `calcularS3()` | Aba 5, Passo 3 (Verificação Estrutural) | 153 |
| `calcularS4()` | Aba 5, Passo 4 (Atrito Negativo) | 71 |
| `calcularS5()` | **Desativada** (Bloco de Coroamento — não se aplica a radier estaqueado) | 7 (só `return` antecipado) |
| `calcularS6()` | Aba 5, Passo 6 (Detalhamento e Quantitativos) | 92 |
| `calcularInteracao()` | Aba 3 (Interação PDR) | 146 |

(Linhas medidas contando chaves de abertura/fechamento da própria função — reproduza com o script Python usado nesta sessão se precisar reconferir após uma edição.)

`calcularS5()` existe só por compatibilidade histórica — o app já foi uma variante com bloco de coroamento; nesta variante (radier estaqueado) a carga vai direto para a laje. **Não reative essa função sem entender por quê ela foi desativada** — ver commit "Revisão de código (Fase 1+2)" no histórico do Git, que removeu ~680 linhas de código morto que dependiam dela.

---

## 4. `calcularRadier()` — por que foi dividida, e como

Era uma função de **818 linhas** até uma revisão de código dedicada (ver Seção 10). Foi dividida em 7 seções nomeadas usando o **padrão de objeto de contexto**: em vez de cada sub-função receber uma lista longa de parâmetros individuais, todas recebem o mesmo objeto `ctx`, leem dele via destructuring no início, e escrevem de volta nele via `Object.assign` no final.

```js
function calcularRadier(){
  // ═══ 1. GEOTECNIA ═══
  // ...calcula L, B, H, Ntotal, pMax, pMin, ex, ey... (dezenas de variáveis)
  const ctx = { L, B, H, /* ...todas as ~78 variáveis de nível superior desta seção... */ };

  calcRadierRigidez(ctx);        // ═══ 2. RIGIDEZ ═══
  calcRadierWinkler(ctx);        // ═══ 3. WINKLER ═══
  calcRadierPuncao(ctx);         // ═══ 4. PUNÇÃO ═══
  calcRadierArmadura(ctx);       // ═══ 5. ARMADURA ═══
  calcRadierQuantitativos(ctx);  // ═══ 6. QUANTITATIVOS ═══
  calcRadierResumo(ctx);         // ═══ 7. RESUMO ═══
}

function calcRadierRigidez(ctx){
  const {L, B, H, ...tudo_que_ja_existe} = ctx;   // lê o que precisar
  // ...lógica original, copiada verbatim, sem reescrever nada...
  Object.assign(ctx, {Kv, Ecs, I, rigido});        // escreve de volta o que as próximas seções vão precisar
}
```

**Por que essa técnica, e não uma extração "limpa" com parâmetros explícitos**: a função original tinha ~60–80 variáveis locais cruzando os limites das 7 seções, muitas usadas 2–3 seções à frente de onde foram calculadas. Uma extração manual com listas de parâmetros mínimas e exatas exigiria rastrear cada uma dessas variáveis uma a uma — alto risco de esquecer uma (bug silencioso) numa função que decide segurança estrutural. A técnica do `ctx` passa tudo adiante de forma **generosa** (cada seção recebe tudo que já foi calculado até ali, não só o mínimo necessário) — mais simples de garantir correto, ao custo de um acoplamento mais frouxo entre seções (qualquer seção *poderia* ler qualquer variável anterior, mesmo que não devesse).

**As outras 7 funções de cálculo (S1–S6, Interação) não passaram por essa divisão** — nenhuma se aproxima do tamanho que `calcularRadier()` tinha (todas ≤153 linhas hoje). Não é necessário replicar a técnica nelas a menos que cresçam muito.

**Se for extrair mais alguma função grande no futuro**: monte primeiro uma suíte de testes de caracterização (ver Seção 9) cobrindo os principais ramos de decisão da função, *antes* de tocar no código. Foi assim que a extração de `calcularRadier()` foi validada — sem isso, não tente.

---

## 5. Fluxo de dados entre módulos

O app não tem um "estado global" único — cada `calcularX()` lê o DOM (fonte da verdade dos inputs) e escreve no DOM (saída). A comunicação **entre módulos diferentes** acontece por um punhado de pontes explícitas:

```
┌─────────────┐   window._radierResumo    ┌──────────────┐
│  Radier      │ ─────────────────────────▶│  Estacas     │
│ (calcularRadier)  {L,B,H,sadm,Ntotal,     │ (calcularS2) │
│              │   pAvg,ex,ey,pMax,pMin...} │              │
└─────────────┘                            └──────────────┘
       ▲                                           │
       │ window._PrAtivo (fatorProjeto)            │ BRIDGE.s1Radm, s2n, s2eta,
       │                                            │ s4NkTotal, s6PileRebar...
┌─────────────┐                                     │
│  Interação   │◀────────────────────────────────────┘
│ (calcularInteracao)
└─────────────┘
```

- **`window._radierResumo`** — objeto simples `{L,B,H,sadm,Ntotal,NtotalProjeto,fatorProjeto,pAvg,ex,ey,pMax,pMin,fck,cob,gc}`, reescrito toda vez que `calcRadierResumo(ctx)` roda (fim de `calcularRadier()`). Lido por `calcularS2()` (verificação de afastamento à borda) e por `calcularInteracao()`.
- **`BRIDGE`** — objeto único (`const BRIDGE = {...}`, ~linha 3874) com campos por passo (`s1Radm`, `s1Ru`, `s1L`, `s2N`, `s2Nimax`, `s2malha`, `s2n`, `s2eta`, `s4NkTotal`, `s5Armaduras`, `s6PileRebar`). Cada `calcularSX()` escreve os seus; outros passos e a Vista 3D leem. **Ao adicionar um novo dado cross-módulo dentro da aba Estacas, adicione um campo aqui** — é o padrão já estabelecido, não crie um novo mecanismo paralelo.
- **`window._PrAtivo`** — setado por `calcularInteracao()` com o valor de P_r (fração de carga que vai para o radier). Lido por `calcularRadier()` para calcular `fatorProjeto` (linha ~2628) — se a Interação já rodou, o radier é dimensionado para a fração reduzida, não a carga cheia. **Isso cria um ciclo de recálculo**: `calcularInteracao()` termina chamando `calcularRadier()` de novo (para refletir a nova carga). Ao mexer nesse trecho, cuidado com recursão infinita — o ciclo hoje é intencionalmente de **uma única volta** (Interação → Radier, não Radier → Interação de novo).
- **`sincronizarCargaGrupoComRadier()`** (dentro do módulo Estacas) — lê `window._radierResumo` e escreve `g-Nk`/`g-Mx`/`g-My` diretamente nos campos do DOM, a menos que o usuário tenha editado manualmente (flag `window._cargaGrupoManual`). Chamada pelo listener de `in-L`/`in-B` (não de dentro de `calcularRadier()` — ver comentário no próprio código explicando por quê: prender ali dentro causava duplo-recálculo dentro da cascata de autosave/Interação).

**Regra geral ao adicionar uma nova ponte entre módulos**: escreva num objeto/campo dedicado e exposto (`window.algumaCoisa` ou um campo em `BRIDGE`), nunca leia o `.value` de um campo de outro módulo diretamente de dentro de uma função de cálculo — quebra na primeira reorganização de UI.

---

## 6. Sistema de ajuda (ícones "?")

Cada seção calculada tem um botão `<button class="help-ic" onclick="abrirAjuda('chave')">`. `abrirAjuda()` (perto do fim do arquivo) busca a chave num objeto `HELP` e preenche um modal compartilhado (`#help-modal-overlay`) com título + HTML.

As **tabelas de coeficientes** dentro dos textos de ajuda (`tbl*()` — ex.: `tblSolosAV()`, `tblTiposEstacaAV()`, `tblDQ_C()`) são geradas a partir dos **mesmos arrays usados nos cálculos** (`SOLOS_AV`, `DQ_C`, `TIPOS_ESTACA_S1`, `SOLOS_BETA`, `IF_TABLE_I`), não são valores digitados à parte. **Se editar um desses arrays, a tabela do pop-up de ajuda correspondente já reflete a mudança automaticamente** — não precisa (e não deve) editar o texto do pop-up separadamente.

Exceção: a tabela de correlação σ<sub>adm</sub>×K<sub>v</sub> (Morrison) no pop-up de ajuda do Winkler é uma cópia literal dos mesmos 5 pontos usados por `kvMorrison()` — não pôde ser gerada dinamicamente porque aquela função é local ao escopo de `calcularRadier()` (não é acessível de fora). Se os pontos da tabela mudarem em `kvMorrison()`, atualize a cópia manualmente (comentário no código já avisa disso).

---

## 7. Vista 3D do Radier Estaqueado

Motor: **Three.js r128** + `OrbitControls`, carregados via CDN (`cdnjs.cloudflare.com` e `cdn.jsdelivr.net`) — únicas dependências externas do app. Se o CDN estiver bloqueado (ex.: rede restrita, firewall corporativo), a Vista 3D mostra uma mensagem de erro e o resto do app continua funcionando normalmente (offline).

- **Inicialização preguiçosa** (`garantirInit3DRadier()`) — só carrega/inicia a cena na primeira vez que a aba "Dimensionamento do Radier" é aberta, não no carregamento da página.
- **Estado**: `let THREE3D_RADIER = {pronto, tentouCarregar, scene, camera, renderer, controls, group, subgrupos}` — declarado com `let`, portanto **não é acessível via `window.THREE3D_RADIER`** a partir de fora do script (armadilha comum ao debugar via console/testes automatizados — confirme isso antes de tentar inspecionar o estado 3D de fora).
- **Grupos com toggle independente**: radier, estacas, armadura das estacas, pilares, malha N1/N2, malha N3/N4 — cada um é um `THREE.Group()` cuja visibilidade é ligada a um checkbox (`r3d-tog-*`). Ao adicionar um novo elemento visual, siga o mesmo padrão: crie o grupo, dê um checkbox correspondente, registre no objeto `map` do listener de toggle (perto do fim do arquivo).
- **Armadura das estacas** (adicionada depois da Vista 3D original) — usa `BRIDGE.s6PileRebar` (nº de barras, bitola, passo de estribo — os mesmos valores calculados e desenhados em 2D no Passo 6). Se a estaca não for de concreto, `calcularS6()` escreve `BRIDGE.s6PileRebar = null` e a Vista 3D não desenha nada ali.
- **Densidade limitada por desempenho**: tanto a malha de armadura do radier quanto os estribos das estacas têm um teto de elementos desenhados (`MAX_BARRAS_3D`, `MAX_ANEIS_3D`) — a vista usa um espaçamento mais grosso que o real quando o espaçamento calculado geraria elementos demais para o navegador aguentar. Isso é só visual; os valores reais continuam nas tabelas e desenhos 2D.

**Para testar a Vista 3D neste ambiente (sandbox sem acesso ao CDN)**: baixe `three@0.128.0` via npm (`registry.npmjs.org` é liberado), sirva localmente com `python3 -m http.server`, e troque temporariamente as tags `<script src="https://cdnjs...">` por `<script src="three.min.js">` numa **cópia** do arquivo (nunca no arquivo real) — foi assim que a Vista 3D foi validada nas sessões de desenvolvimento anteriores.

---

## 8. Integração com `geo_flow_editor.html` (pontes `postMessage`)

O app pode rodar standalone (arquivo aberto direto) ou embutido como `<iframe>` dentro do `geo_flow_editor.html`. Duas pontes independentes, uma por módulo:

| Mensagem | Direção | Conteúdo |
|---|---|---|
| `radier-init` / `estacas-init` | pai → iframe | Estado inicial (campos + dados semânticos de nodes conectados) |
| `radier-params` / `estacas-params` | iframe → pai | Snapshot sob demanda (botão "Enviar para Visualização") |
| `radier-autosave` / `estacas-autosave` | iframe → pai | Snapshot automático, debounced 600ms após qualquer input |

**Validação de origem**: os dois listeners `window.addEventListener('message', ...)` checam `e.source === window.parent` antes de processar qualquer mensagem — adicionado na revisão de código (Fase 1) depois de identificar que o app aceitava mensagens de qualquer origem sem checagem. **Mantenha essa checagem em qualquer novo listener de mensagem que adicionar.**

**Adaptadores semânticos** (dentro de `applyInitialState()`, nos dois módulos): quando uma mensagem `*-init` chega, além de aceitar `state.fields` (mapa `id → valor`, aplicado direto via `.value=`), os dois módulos também aceitam algumas chaves semânticas de nodes específicos do geo_flow (`zw`/`yw` do node "Nível d'Água", `layers`/`golpes` do node "Boletim de Sondagem", `phi`/`coh`/`garg` de um node "Solo Multicamadas", `q` de um node "Sobrecarga") e as traduzem para os campos internos corretos. **Isso só cobre o lado do app** — o `geo_flow_editor.html` ainda não tem os node types registrados para efetivamente montar essas mensagens (ver Seção 11).

`window.__RADIER_NODE_ID__` / `window.__ESTACAS_NODE_ID__` e `window.__RADIER_INITIAL_DATA__` / `window.__ESTACAS_INITIAL_DATA__` são esperados como globais definidos pelo host (geo_flow) antes do app carregar, se estiver embutido — ausentes/`null` quando standalone (comportamento padrão, sem erro).

---

## 9. Suíte de testes de regressão

Pasta `test-suite/` (ver `test-suite/README.md` para o guia completo de uso). Resumo:

- **Técnica**: testes de caracterização (Michael Feathers) — não validam se um número está matematicamente certo, só se o comportamento **não mudou** entre duas versões do arquivo.
- **44 cenários** cobrindo os 8 motores de cálculo, escolhidos para passar por ramos de decisão importantes (Terzaghi ativo/inativo, N.A. acima/abaixo da base, rígido/flexível, com/sem pilares, punção crítica, etc.) — não é cobertura exaustiva de combinações.
- **Uso**: `node test-suite/run-tests.js --save-baseline caminho/do/arquivo.html` antes de mexer, `node test-suite/run-tests.js caminho/do/arquivo.html` depois — compara automaticamente.
- **Armadilha conhecida**: cenários que dependem do ciclo de autosave (Seção 5 e 8 — `window._PrAtivo`) podem ficar instáveis se a espera entre a ação e a captura for curta demais — o harness já espera 850ms por padrão por causa disso (ver comentário em `run-tests.js`). Se adicionar um cenário novo que pareça "flaky", aumente a espera antes de desconfiar de outra coisa.
- **A suíte não roda contra a Vista 3D** (Seção 7) diretamente — ela testa o HTML/texto renderizado nos containers `main-*`, e a Vista 3D desenha num `<canvas>` WebGL que não aparece nesse texto. Validação da Vista 3D até hoje foi manual (screenshot), usando o truque do Three.js local descrito na Seção 7.

---

## 10. Convenções estabelecidas numa revisão de código dedicada

Duas fases de revisão já foram feitas (ver commits "Revisão de código (Fase 1+2)..." no histórico do Git do branch `Radier`). Convenções que saíram delas e devem ser mantidas:

1. **CSS**: sem duplicação de seletor entre os "blocos" históricos do arquivo — um seletor, uma regra. Antes da Fase 1 havia 17 seletores duplicados (alguns com valores diferentes, silenciosamente resolvidos pela ordem de cascata — fonte de bugs visuais).
2. **Funções utilitárias** (`fmt`, `rb`, etc.) — uma única definição, o mais cedo possível no arquivo (antes do primeiro uso síncrono). Não redeclare a mesma função em blocos `<script>` diferentes, mesmo que pareça inofensivo — JS deixa, mas a última declaração "vence" silenciosamente, e isso já causou uma inconsistência real (tratamento de `null` diferente entre a versão que rodava no carregamento vs. depois de qualquer interação).
3. **Código morto**: remover, não comentar/desativar com `return` precoce e deixar o resto — o Git guarda o histórico se precisar recuperar. Exceção deliberada: `calcularS5()` foi mantida como um `return` precoce mínimo (não removida inteiramente) porque é chamada por **vários listeners de input espalhados pelo módulo Estacas** (arranjo, `g-fck`/`g-fyk`/`g-gammaf`, `g-forma`/`g-D`, além de uma chamada incondicional no carregamento da página) — removê-la exigiria também limpar cada um desses pontos de chamada, fora do escopo daquela revisão. Se for remover de vez, comece buscando por `calcularS5(` no arquivo inteiro para mapear todos os pontos.
4. **Extração de função grande**: técnica de objeto de contexto (Seção 4) + suíte de testes de caracterização escrita **antes** de mexer no código, não depois.
5. **`postMessage`**: sempre validar `e.source` (Seção 8).

---

## 11. Débito técnico conhecido / trabalho futuro

Nada aqui é urgente — o app funciona e está testado. Lista para quem for continuar:

- **Fase 3 da revisão de código (nunca feita)**: separar cálculo de renderização de forma sistemática — os motores de cálculo virarem funções puras (recebem números, devolvem um objeto de resultado) desacopladas do `$('...').innerHTML=...`. Facilitaria reaproveitar a lógica de cálculo fora do navegador (ex.: rodar no `geo_flow_editor.html` sem precisar simular um DOM inteiro, ou escrever testes unitários de verdade em vez de testes de caracterização via navegador).
- **`geo_flow_editor.html` não tem os node types registrados** para o Radier Estaqueado — a ponte `postMessage` do lado do app (Seção 8) existe e está pronta, mas não há nada do lado do editor que efetivamente crie um node, monte as mensagens `*-init` com dados de nodes conectados, ou receba `*-params`/`*-autosave`. Esse é o trabalho que falta para a integração ser real, não só possível.
- **`S1`–`S6` e `Interação` não foram divididas** como `calcularRadier()` foi (Seção 4) — nenhuma está grande o suficiente para justificar isso hoje (≤153 linhas), mas se alguma crescer muito, repita a mesma técnica (contexto + testes de caracterização antes).
- **`relatorio_validacao_radier_estaqueado.docx`** não foi atualizado com as mudanças mais recentes (N.A. único, sincronização automática de carga, Vista 3D com armadura das estacas, etc.) — continua refletindo uma versão anterior do motor de cálculo.
