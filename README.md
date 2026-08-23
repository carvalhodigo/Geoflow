# Geo·Flow Editor

Editor visual de fluxo para cálculos geotécnicos — permite montar, em um canvas interativo, um pipeline de caixas conectadas (sondagem, camadas de solo, recalques, fundações rasas e profundas, estabilidade de taludes etc.) e visualizar os resultados em uma seção transversal técnica, com memória de cálculo completa e exportável.

Todo o app roda em um único arquivo HTML — sem instalação, sem servidor, sem dependências de build. Basta abrir no navegador.

## Como usar

1. Baixe o arquivo `geo_flow_editor.html` deste repositório.
2. Abra o arquivo em qualquer navegador moderno (Chrome, Edge, Firefox).
3. Monte seu fluxo de cálculo arrastando caixas para o canvas e conectando-as.
4. Acompanhe os resultados na aba de Visualização Técnica.
5. Exporte a memória de cálculo em HTML pelo botão **📄 Exportar Memória**.

Também é possível acessar a versão publicada (se o GitHub Pages estiver ativado neste repositório) direto pelo navegador, sem precisar baixar nada — veja o link em **About** desta página do GitHub.

## Módulos disponíveis

- **Solo**: Boletim de Sondagem (SPT), Solo Mole / Multicamadas, Nível d'Água, Curva de Compressão (Oedométrica)
- **Recalques**: Primário, Secundário, Total, Tempo de Adensamento
- **Estabilidade**: Talude (Fellenius / Bishop Simplificado)
- **Fundações rasas**: Sapata Isolada, Radier
- **Fundações profundas**: Estacas (Aoki-Velloso / Décourt-Quaresma), com bloco de coroamento
- **Fundação de Máquinas**: conforme NBR N-1848
- **Análise de Tensões**: bulbo de tensões (Boussinesq), superposição de fundações vizinhas

Cada módulo de fundação (Sapata, Radier, Fundação de Máquinas, Estacas) suporta **múltiplas instâncias** no mesmo fluxo, cada uma com sua própria seção na Visualização Técnica e deslocamento horizontal configurável, para representar várias fundações lado a lado na mesma seção transversal.

## Radier Estaqueado (`radier_estaqueado_unico.html`)

App standalone (também um único arquivo HTML, sem dependências) dedicado ao dimensionamento de **radier estaqueado** — uma fundação mista em que radier e grupo de estacas trabalham juntos, dividindo a carga entre si. Organizado em 5 abas, na ordem em que o cálculo normalmente é conduzido:

1. **Geometria e Cargas** — dimensões do radier, pilares e cargas especiais, parâmetros do solo (Terzaghi)
2. **Estacas — Capacidade e Arranjo** — capacidade de carga da estaca isolada por SPT (Aoki-Velloso e Décourt-Quaresma, lado a lado), arranjo em grade retangular e distribuição de carga no grupo (eficiência de grupo, bloco fictício)
3. **Interação PDR** — repartição de carga entre radier e estacas pela Metodologia Simplificada de Cálculo (Randolph, 1994; Clancy & Randolph, 1993), incluindo verificação de punção da estaca no radier
4. **Dimensionamento do Radier** — verificação geotécnica, classificação rígido×flexível, modelagem em grelha sobre base elástica (Winkler), punção nos pilares, armadura e quantitativos
5. **Verificação das Estacas** — compressão, flambagem e flexo-compressão do fuste; atrito negativo; detalhamento e quantitativos de armadura

Recursos adicionais do app:

- **N.A. e carga do grupo sincronizados automaticamente** a partir da geometria/cargas já lançadas — sem precisar digitar o mesmo dado em mais de um lugar (com opção de sobrescrever manualmente quando necessário)
- **Ícones de ajuda (?)** em cada seção calculada, com pop-up explicativo: fórmula, significado de cada variável, tabelas de coeficientes (geradas dos mesmos dados usados no cálculo, sempre sincronizadas) e uma ilustração esquemática
- **Memória de cálculo única e didática**, cobrindo as 5 abas em ordem lógica, com sumário navegável, pronta para impressão/PDF
- Preparado para futura integração como node(s) do `geo_flow_editor.html`: já expõe pontes `postMessage` (`radier-*` / `estacas-*`) capazes de receber dados de nodes como Nível d'Água, Boletim de Sondagem, Solo Multicamadas e Sobrecarga

Ver `relatorio_validacao_radier_estaqueado.docx` para o histórico de validação do motor de cálculo contra casos reais/publicados (Westend, Messeturm, Burj Khalifa) e exercícios resolvidos de referência, e `docs/manual_usuario_radier_estaqueado.pdf` para o manual do usuário (passo a passo das 5 abas, com capturas de tela reais do app).

## Estrutura do repositório

```
geo_flow_editor.html                       → editor de fluxo completo (HTML + CSS + JS em um arquivo só)
radier_estaqueado_unico.html               → app standalone de Radier Estaqueado (ver seção acima)
relatorio_validacao_radier_estaqueado.docx → relatório de validação do módulo de Radier Estaqueado
docs/manual_usuario_radier_estaqueado.pdf  → manual do usuário do Radier Estaqueado
test-suite/                                → suíte de testes de regressão do Radier Estaqueado (ver test-suite/README.md)
README.md                                  → este arquivo
.gitignore                                 → arquivos e pastas ignorados pelo Git
```

## Aviso técnico

Os resultados gerados são apoio técnico ao dimensionamento e **não substituem** projeto executivo, verificação normativa completa (ABNT NBR 6122, NBR 6118, NBR 11682 etc.) ou responsabilidade técnica registrada (ART/CREA).

## Licença

Defina aqui a licença do projeto (ex. MIT, uso interno, etc.), conforme a política da sua organização.
