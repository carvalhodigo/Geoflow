#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// Motor genérico de testes de caracterização para radier_estaqueado_unico.html
// Ver README.md para explicação da técnica e como usar.
// ═══════════════════════════════════════════════════════════════════════════
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = process.env.CHROME_PATH ||
  '/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const BASELINE_DIR = path.join(__dirname, 'baseline');

// ── helpers de manipulação de página, usados pelos arquivos de cenários ──
async function setVal(page, id, val){
  await page.evaluate(({id,val})=>{
    const el = document.getElementById(id);
    if(!el) throw new Error('elemento não encontrado: #'+id);
    el.value = val;
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
  }, {id,val});
}
async function setChecked(page, id, checked){
  await page.evaluate(({id,checked})=>{
    const el = document.getElementById(id);
    if(!el) throw new Error('elemento não encontrado: #'+id);
    el.checked = checked;
    el.dispatchEvent(new Event('change', {bubbles:true}));
  }, {id,checked});
}
async function clickAll(page, selector){
  await page.evaluate((sel)=>{ document.querySelectorAll(sel).forEach(b=>b.click()); }, selector);
}
async function clickOne(page, selector){
  await page.evaluate((sel)=>{ const b=document.querySelector(sel); if(b) b.click(); else throw new Error('não encontrado: '+sel); }, selector);
}
async function callFn(page, fnName, ...args){
  await page.evaluate(({fnName,args})=>{
    if(typeof window[fnName]!=='function') throw new Error('função global não encontrada: '+fnName);
    window[fnName](...args);
  }, {fnName, args});
}

const HELPERS = { setVal, setChecked, clickAll, clickOne, callFn };

// ── captura genérica: innerHTML de uma lista de containers + variáveis globais pedidas ──
async function snapshot(page, {containers, globals}){
  return await page.evaluate(({containers, globals})=>{
    const out = {containers:{}, globals:{}};
    for(const id of containers){
      const el = document.getElementById(id);
      out.containers[id] = el ? el.innerHTML : `__ELEMENTO_AUSENTE__(${id})`;
    }
    for(const g of (globals||[])){
      try{
        const parts = g.split('.');
        let v = window;
        for(const p of parts) v = v==null ? undefined : v[p];
        out.globals[g] = v===undefined ? undefined : JSON.parse(JSON.stringify(v));
      }catch(e){ out.globals[g] = '__ERRO_AO_LER__: '+e.message; }
    }
    return out;
  }, {containers, globals});
}

async function runScenario(page, htmlPath, scenario){
  await page.goto('file://'+htmlPath);
  await page.waitForTimeout(300);
  await scenario.setup(page, HELPERS);
  await page.waitForTimeout(150);
  if(scenario.recalc){
    for(const fn of scenario.recalc){
      await page.evaluate((fnName)=>{ if(typeof window[fnName]==='function') window[fnName](); }, fn);
    }
  }
  // espera passar do debounce de autosave (600ms) — o autosave recalcula TUDO (inclusive a
  // Interação PDR, que por sua vez recalcula o Radier de novo) como efeito colateral, então a
  // captura precisa acontecer DEPOIS dessa cascata assentar, ou o resultado fica não-determinístico
  // dependendo de qual lado da corrida a captura cai (mesma causa raiz documentada no código-fonte,
  // ver comentário perto do listener 'in-L'/'in-B' em calcularRadier).
  await page.waitForTimeout(850);
  return await snapshot(page, scenario.capture);
}

function diffSummary(before, after){
  const lines = [];
  for(const id of Object.keys(before.containers)){
    if(before.containers[id] !== after.containers[id]){
      lines.push(`  container #${id}: MUDOU (${(before.containers[id]||'').length} → ${(after.containers[id]||'').length} chars)`);
    }
  }
  for(const g of Object.keys(before.globals||{})){
    const b = JSON.stringify(before.globals[g]), a = JSON.stringify(after.globals[g]);
    if(b !== a){
      lines.push(`  global ${g}: ${b}  →  ${a}`);
    }
  }
  return lines;
}

async function main(){
  const args = process.argv.slice(2);
  const saveBaseline = args.includes('--save-baseline');
  const htmlArg = args.find(a => !a.startsWith('--'));
  if(!htmlArg){
    console.error('Uso: node run-tests.js [--save-baseline] /caminho/para/radier_estaqueado_unico.html');
    process.exit(1);
  }
  const htmlPath = path.resolve(htmlArg);
  if(!fs.existsSync(htmlPath)){
    console.error('Arquivo não encontrado:', htmlPath);
    process.exit(1);
  }

  const scenarioFiles = ['scenarios-radier.js', 'scenarios-estacas.js', 'scenarios-interacao.js'];
  let allScenarios = [];
  for(const f of scenarioFiles){
    const mod = require(path.join(__dirname, f));
    allScenarios = allScenarios.concat(mod.map(s => ({...s, _file:f})));
  }

  const browser = await chromium.launch({ executablePath: CHROME_PATH, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: {width:1400, height:1100} });

  fs.mkdirSync(BASELINE_DIR, {recursive:true});

  let pass=0, fail=0, saved=0;
  const failures = [];

  for(const scenario of allScenarios){
    const baselineFile = path.join(BASELINE_DIR, `${scenario.name}.json`);
    try{
      const result = await runScenario(page, htmlPath, scenario);

      if(saveBaseline){
        fs.writeFileSync(baselineFile, JSON.stringify(result, null, 0));
        console.log(`  [gravado] ${scenario.name}`);
        saved++;
        continue;
      }

      if(!fs.existsSync(baselineFile)){
        console.log(`  [SEM BASELINE] ${scenario.name} — rode com --save-baseline primeiro`);
        fail++;
        continue;
      }
      const before = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
      const same = JSON.stringify(before) === JSON.stringify(result);
      if(same){
        console.log(`  PASS  ${scenario.name}`);
        pass++;
      } else {
        console.log(`  FALHOU  ${scenario.name}  (${scenario._file})`);
        diffSummary(before, result).forEach(l => console.log(l));
        fail++;
        failures.push(scenario.name);
      }
    }catch(err){
      console.log(`  ERRO  ${scenario.name}: ${err.message}`);
      fail++;
      failures.push(scenario.name);
    }
  }

  await browser.close();

  console.log('');
  if(saveBaseline){
    console.log(`Baseline gravado: ${saved} cenário(s) em ${BASELINE_DIR}`);
  } else {
    console.log(`${pass} passaram, ${fail} falharam (${allScenarios.length} no total)`);
    if(failures.length) console.log('Cenários com problema:', failures.join(', '));
    process.exit(fail > 0 ? 1 : 0);
  }
}

main();
