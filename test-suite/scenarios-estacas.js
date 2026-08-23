// Cenários de caracterização para os motores de cálculo da aba Estacas:
// calcularS1 (Estaca Isolada), calcularS2 (Grupo), calcularS3 (Verificação
// Estrutural), calcularS4 (Atrito Negativo), calcularS6 (Detalhamento).
// Containers capturados: main-e (Passo 1+2) e main-e-verif (Passo 3, 4, 6 —
// todos os três data-step-panel ficam no DOM ao mesmo tempo, só escondidos
// via CSS, então innerHTML captura os três independente de qual está ativo).
const CAPTURE_ESTACAS = {
  containers: ['main-e', 'main-e-verif'],
  globals: ['BRIDGE'],
};

module.exports = [
  // ── S1: Estaca Isolada — capacidade de carga ──
  {
    name: 'estacas_s1_default',
    capture: CAPTURE_ESTACAS,
    setup: async () => {},
  },
  {
    name: 'estacas_s1_tipo_metalica',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'g-tipoestaca','1'); },
  },
  {
    name: 'estacas_s1_tipo_helice',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'g-tipoestaca','4'); },
  },
  {
    name: 'estacas_s1_forma_quadrada',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'g-forma','quadrada'); await setVal(page,'g-D','0.35'); },
  },
  {
    name: 'estacas_s1_diametro_grande',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'g-D','0.60'); },
  },
  {
    name: 'estacas_s1_na_raso',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'g-na','1.0'); },
  },

  // ── S2: Grupo de estacas — arranjo e distribuição de carga ──
  {
    name: 'estacas_s2_grade_3x3',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'g-nx','3'); await setVal(page,'g-ny','3'); },
  },
  {
    name: 'estacas_s2_grade_1x4_linha',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'g-nx','1'); await setVal(page,'g-ny','4'); },
  },
  {
    name: 'estacas_s2_carga_manual_excentrica',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => {
      // digitar manualmente desliga a sincronização automática com o Radier (ver Passo 2)
      await setVal(page,'g-Nk','2400'); await setVal(page,'g-Mx','300'); await setVal(page,'g-My','450');
    },
  },
  {
    name: 'estacas_s2_espacamento_apertado',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'g-sx','0.60'); await setVal(page,'g-sy','0.60'); },
  },

  // ── S3: Verificação estrutural — compressão, flambagem, flexo-compressão ──
  {
    name: 'estacas_s3_material_metalico',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'s3-material','metalica'); },
  },
  {
    name: 'estacas_s3_material_madeira',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'s3-material','madeira'); },
  },
  {
    name: 'estacas_s3_flambagem_ativa',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'s3-L0','4'); },
  },
  {
    name: 'estacas_s3_momento_fletor',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'s3-Mk','25'); },
  },
  {
    name: 'estacas_s3_vinculacao_engastada',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'s3-vinc','0.5'); await setVal(page,'s3-L0','5'); },
  },

  // ── S4: Atrito negativo — camadas de solo e checkboxes de necessidade ──
  {
    name: 'estacas_s4_default',
    capture: CAPTURE_ESTACAS,
    setup: async () => {},
  },
  {
    name: 'estacas_s4_carga_estrutural_alta',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'s4-Nkestr','900'); },
  },

  // ── S6: Detalhamento e quantitativos ──
  {
    name: 'estacas_s6_bitola_maior',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'s6-phi-long','25'); },
  },
  {
    name: 'estacas_s6_perda_concreto_alta',
    capture: CAPTURE_ESTACAS,
    setup: async (page, {setVal}) => { await setVal(page,'s6-perda-concreto','15'); },
  },
];
