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

## Estrutura do repositório

```
geo_flow_editor.html   → aplicativo completo (HTML + CSS + JS em um arquivo só)
README.md              → este arquivo
.gitignore             → arquivos e pastas ignorados pelo Git
```

## Aviso técnico

Os resultados gerados são apoio técnico ao dimensionamento e **não substituem** projeto executivo, verificação normativa completa (ABNT NBR 6122, NBR 6118, NBR 11682 etc.) ou responsabilidade técnica registrada (ART/CREA).

## Licença

Defina aqui a licença do projeto (ex. MIT, uso interno, etc.), conforme a política da sua organização.
