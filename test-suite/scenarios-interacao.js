// Cenários de caracterização para calcularInteracao() — aba "Interação PDR".
// Container: main-i (K_rad, K_pg, repartição de carga, punção da estaca no radier).
const CAPTURE_I = {
  containers: ['main-i'],
  globals: ['_PrAtivo'],
};

module.exports = [
  {
    name: 'interacao_default',
    capture: CAPTURE_I,
    setup: async (page, {clickOne}) => { await clickOne(page, '#btn-i-atualizar'); },
  },
  {
    name: 'interacao_es_alto_solo_rigido',
    capture: CAPTURE_I,
    setup: async (page, {setVal, clickOne}) => {
      await setVal(page,'i-Es','80'); await setVal(page,'i-nu','0.3');
      await clickOne(page, '#btn-i-atualizar');
    },
  },
  {
    name: 'interacao_alfarp_zero_sem_interacao',
    capture: CAPTURE_I,
    setup: async (page, {setVal, clickOne}) => {
      await setVal(page,'i-alfarp','0'); await clickOne(page, '#btn-i-atualizar');
    },
  },
  {
    name: 'interacao_caso_westend',
    capture: CAPTURE_I,
    setup: async (page, {clickOne}) => { await clickOne(page, '#btn-i-westend'); },
  },
  {
    name: 'interacao_caso_messeturm',
    capture: CAPTURE_I,
    setup: async (page, {clickOne}) => { await clickOne(page, '#btn-i-messeturm'); },
  },
  {
    name: 'interacao_recalque_adm_restritivo',
    capture: CAPTURE_I,
    setup: async (page, {setVal, clickOne}) => {
      await setVal(page,'i-recadm','15'); await clickOne(page, '#btn-i-atualizar');
    },
  },
];
