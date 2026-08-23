// Cenários de caracterização para calcularRadier() — aba "Geometria e Cargas" /
// "Dimensionamento do Radier". Container comuns capturados por todos: main-r
// (planta/corte + resumo geotécnico) e main-r-dim (geotecnia, rigidez, Winkler,
// punção, armadura, quantitativos — tudo que calcularRadier() escreve).
const CAPTURE = {
  containers: ['main-r', 'main-r-dim'],
  globals: ['_radierResumo'],
};

module.exports = [
  {
    name: 'radier_default',
    capture: CAPTURE,
    setup: async () => {},
  },
  {
    name: 'radier_terzaghi_ok',
    capture: CAPTURE,
    setup: async (page, {setVal}) => {
      await setVal(page,'in-phi-solo','30'); await setVal(page,'in-coesao','10'); await setVal(page,'in-gamma-solo','18');
      await setVal(page,'in-L','10'); await setVal(page,'in-B','8'); await setVal(page,'in-df','1.5');
    },
  },
  {
    name: 'radier_terzaghi_reprovado',
    capture: CAPTURE,
    setup: async (page, {setVal}) => {
      await setVal(page,'in-phi-solo','15'); await setVal(page,'in-coesao','5'); await setVal(page,'in-gamma-solo','16');
      await setVal(page,'in-L','3'); await setVal(page,'in-B','3'); await setVal(page,'in-df','0.5');
      await setVal(page,'in-sadm','300');
    },
  },
  {
    name: 'radier_terzaghi_phi_zero',
    capture: CAPTURE,
    setup: async (page, {setVal}) => {
      // ramo phiSoloDeg<=0.01 dentro do bloco Terzaghi (Nq=1, Nc=5.14 direto, sem tan/exp)
      await setVal(page,'in-phi-solo','0'); await setVal(page,'in-coesao','25'); await setVal(page,'in-gamma-solo','17');
    },
  },
  {
    name: 'radier_na_acima_df_subpressao',
    capture: CAPTURE,
    setup: async (page, {setVal}) => {
      await setVal(page,'in-df','2'); await setVal(page,'g-na','0.5');
    },
  },
  {
    name: 'radier_na_abaixo_df',
    capture: CAPTURE,
    setup: async (page, {setVal}) => {
      await setVal(page,'in-df','1'); await setVal(page,'g-na','20');
    },
  },
  {
    name: 'radier_kv_manual',
    capture: CAPTURE,
    setup: async (page, {setVal}) => {
      await setVal(page,'in-kv-modo','manual'); await setVal(page,'in-kv','35000');
    },
  },
  {
    name: 'radier_flexivel',
    capture: CAPTURE,
    setup: async (page, {setVal}) => {
      await setVal(page,'in-H','0.25'); await setVal(page,'in-vao','9'); await setVal(page,'in-L','12'); await setVal(page,'in-B','10');
    },
  },
  {
    name: 'radier_rigido',
    capture: CAPTURE,
    setup: async (page, {setVal}) => {
      await setVal(page,'in-H','1.2'); await setVal(page,'in-vao','3');
    },
  },
  {
    name: 'radier_muitos_pilares_excentrico',
    capture: CAPTURE,
    setup: async (page, {clickAll, clickOne}) => {
      await clickAll(page, '.pil-del');
      await page.waitForTimeout(150);
      for(let i=0;i<4;i++){ await clickOne(page,'#btn-add-pilar'); await page.waitForTimeout(80); }
      const rows = await page.$$('.pil-row');
      const vals = [['P1','1','1','300','0.3','0.3'],['P2','7','1','600','0.4','0.4'],
                     ['P3','1','5','200','0.3','0.3'],['P4','7','5','900','0.4','0.4']];
      for(let i=0;i<rows.length && i<vals.length;i++){
        const inputs = await rows[i].$$('input');
        for(let j=0;j<inputs.length && j<vals[i].length;j++){
          await inputs[j].evaluate((el,v)=>{ el.value=v; el.dispatchEvent(new Event('input',{bubbles:true})); }, vals[i][j]);
        }
      }
      await page.waitForTimeout(100);
    },
  },
  {
    name: 'radier_sem_pilares',
    capture: CAPTURE,
    setup: async (page, {clickAll}) => { await clickAll(page, '.pil-del'); },
  },
  {
    name: 'radier_caa_extremos_gagua',
    capture: CAPTURE,
    setup: async (page, {setVal}) => {
      await setVal(page,'in-caa','4'); await setVal(page,'in-cob','2'); await setVal(page,'in-gagua','10.5');
    },
  },
  {
    name: 'radier_puncao_critico_pilar_pequeno',
    capture: CAPTURE,
    // pilar pequeno com carga alta e radier fino → força τsd alto, possivelmente excedendo τRd1/τRd2
    setup: async (page, {clickAll, clickOne, setVal}) => {
      await setVal(page,'in-H','0.20');
      await clickAll(page, '.pil-del');
      await clickOne(page, '#btn-add-pilar');
      const row = (await page.$$('.pil-row'))[0];
      const vals = ['P1','4','3','1500','0.25','0.25'];
      const inputs = await row.$$('input');
      for(let j=0;j<inputs.length && j<vals.length;j++){
        await inputs[j].evaluate((el,v)=>{ el.value=v; el.dispatchEvent(new Event('input',{bubbles:true})); }, vals[j]);
      }
    },
  },
  {
    name: 'radier_flexopuncao_momento_desbalanceado',
    capture: CAPTURE,
    setup: async (page, {setVal}) => { await setVal(page,'in-mdesb','80'); },
  },
  {
    name: 'radier_cobertura_superior_total',
    capture: CAPTURE,
    setup: async (page, {setVal}) => { await setVal(page,'in-cobertura-sup','total'); },
  },
  {
    name: 'radier_elu_ja_majorado',
    capture: CAPTURE,
    // ramo eluModo!=='servico' → gammaf=1.0 direto (cargas já de cálculo)
    setup: async (page, {setVal}) => { await setVal(page,'in-elu-modo','calculo'); },
  },
  {
    name: 'radier_sadm_baixo_extrapolacao',
    capture: CAPTURE,
    // exercita o ramo de EXTRAPOLAÇÃO de kvMorrison() (sadm < primeiro ponto da tabela, 98,07 kPa)
    setup: async (page, {setVal}) => { await setVal(page,'in-sadm','60'); },
  },
  {
    name: 'radier_sadm_no_primeiro_trecho_morrison',
    capture: CAPTURE,
    // exercita o primeiro trecho de INTERPOLAÇÃO de kvMorrison() (entre 98,07 e 147,10 kPa) —
    // o valor padrão de σadm (150 kPa) fica logo ACIMA desse trecho e nunca o exercita
    setup: async (page, {setVal}) => { await setVal(page,'in-sadm','120'); },
  },
  {
    name: 'radier_sadm_alto_ultimo_trecho_morrison',
    capture: CAPTURE,
    // exercita o ramo sadmKpa >= último ponto da tabela (extrapolação por reta entre os 2 últimos pontos)
    setup: async (page, {setVal}) => { await setVal(page,'in-sadm','400'); },
  },
  {
    name: 'radier_meyerhof_area_efetiva_colapsada',
    capture: CAPTURE,
    // exercita areaEfSuficienteMey=false — excentricidade grande o bastante para que L_efMey ou
    // B_efMey (=L/B menos 2×|e|) fique ≤0,05m, mesmo com Terzaghi/Meyerhof ativos (φ'/c' informados).
    // Nenhum outro cenário testa esse ramo específico do Meyerhof (colapso da área efetiva).
    // H reduzido ao mínimo e carga do pilar muito maior que o peso próprio, para que o peso
    // próprio (que sempre "puxa" a resultante de volta ao centro) não descentralize o suficiente
    // pra sair da faixa de colapso.
    setup: async (page, {setVal, clickAll, clickOne}) => {
      await setVal(page,'in-phi-solo','25'); await setVal(page,'in-coesao','5');
      await setVal(page,'in-H','0.16');
      await clickAll(page, '.pil-del');
      await clickOne(page, '#btn-add-pilar');
      const row = (await page.$$('.pil-row'))[0];
      const vals = ['P1','7.999','3','100000','0.3','0.3']; // bem excêntrico em X (radier 8x6m padrão)
      const inputs = await row.$$('input');
      for(let j=0;j<inputs.length && j<vals.length;j++){
        await inputs[j].evaluate((el,v)=>{ el.value=v; el.dispatchEvent(new Event('input',{bubbles:true})); }, vals[j]);
      }
    },
  },
];
