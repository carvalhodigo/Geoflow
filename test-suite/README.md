# Suíte de testes de regressão — Radier Estaqueado

Testes de **caracterização** (não são testes unitários no sentido clássico — não
verificam se um valor está "certo" segundo uma referência externa, e sim se o
app continua produzindo **exatamente a mesma saída** depois de uma mudança no
código). É a técnica recomendada para mexer com segurança em código legado sem
suíte de testes prévia (Michael Feathers, *Working Effectively with Legacy
Code*): antes de refatorar, tira uma "foto" de tudo que a tela mostra para uma
bateria de cenários; depois da refatoração, tira a foto de novo e compara byte
a byte. Qualquer diferença = regressão introduzida pela refatoração (a menos
que a mudança pretendida fosse exatamente mudar aquele resultado).

## Por que isso existe

`radier_estaqueado_unico.html` tem 8 motores de cálculo (`calcularRadier`,
`calcularS1` a `calcularS6`, `calcularInteracao`) com dezenas de variáveis
locais compartilhadas dentro de cada um — nenhum tinha proteção de teste
antes desta suíte. Ela nasceu de uma tentativa de quebrar `calcularRadier()`
(782 linhas) em sub-funções menores: ao mapear a função, ficou claro que uma
extração manual sem uma rede de segurança automatizada seria arriscada demais
para uma função que decide segurança estrutural — daí a suíte, para que essa
e outras refatorações futuras possam ser feitas com confiança real, não só
"parece que não quebrou nada".

## Como usar

Pré-requisitos: Node.js + Playwright com Chromium instalado (mesmo ambiente
usado para desenvolver o app).

```bash
# 1) Antes de mexer no código, grava o "golden master" (estado atual = referência)
node run-tests.js --save-baseline /caminho/para/radier_estaqueado_unico.html

# 2) Faça as mudanças no código...

# 3) Depois de mexer, compara o novo comportamento contra o golden master
node run-tests.js /caminho/para/radier_estaqueado_unico.html
```

Saída esperada num `git diff` puramente refatorador (sem mudança de
comportamento): `TODOS OS CENÁRIOS PASSARAM`. Qualquer `FALHOU` imprime
exatamente qual trecho do HTML de saída mudou, para investigar se foi uma
regressão real ou uma mudança de comportamento intencional (nesse caso,
regrave o baseline).

## O que cada arquivo cobre

| Arquivo | Função testada | Cenários |
|---|---|---|
| `scenarios-radier.js` | `calcularRadier()` | 15 — geotecnia, Terzaghi, N.A./subpressão, rigidez rígida/flexível, punção, sem pilares, excêntrico |
| `scenarios-estacas.js` | `calcularS1/S2/S3/S4/S6` | 18 — perfil SPT, arranjo, material da estaca, flambagem, atrito negativo, detalhamento |
| `scenarios-interacao.js` | `calcularInteracao()` | 6 — parâmetros de rigidez do solo, casos de referência (Westend/Messeturm) |

## Limitações (honestas)

- **Não valida se o resultado está certo** — só se ele *mudou*. Correção
  numérica continua dependendo da validação cruzada com exercícios/casos
  reais (ver `relatorio_validacao_radier_estaqueado.docx`).
- **Cobertura de ramos, não de valores** — os cenários foram escolhidos para
  passar por cada `if`/`else` importante pelo menos uma vez, não para cobrir
  toda combinação possível de entradas.
- Se um cenário legitimamente precisar mudar de resultado (correção de bug,
  nova funcionalidade), regrave o baseline daquele cenário conscientemente —
  a suíte avisa da mudança, não impede.
