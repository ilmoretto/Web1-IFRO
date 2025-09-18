// Funciona online (lendo conteudos.json) e OFFLINE (file://) usando dados embutidos no index.html.
// Estrutura esperada: conteudos/<pasta da aula>/index.html

const DATA_FILE = './conteudos.json';

const layout = document.querySelector('.layout');
const menuEl = document.getElementById('menu');
const searchEl = document.getElementById('search');
const viewer = document.getElementById('viewer');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');

let itens = [];
let activePath = '';

init();

async function init(){
  try{
    itens = await getConteudos();
    itens = sortByDateIfPossible(itens);
    renderMenu(itens);
    applyFromHashOrDefault();
    wireEvents();
    setInitialSidebarState();
  }catch(e){
    console.error('Erro carregando dados:', e);
    menuEl.innerHTML = `<p style="color:#fca5a5">Não foi possível carregar a lista de conteúdos.</p>
    <details style="margin-top:.5rem;color:#93c5fd"><summary>Como resolver</summary>
      <ol>
        <li>Se estiver usando file://, mantenha o bloco JSON embutido no index.html (script#conteudos-data).</li>
        <li>Se estiver em servidor, garanta que <code>conteudos.json</code> está no mesmo nível do <code>index.html</code> e é JSON válido.</li>
      </ol>
    </details>`;
  }
}

function wireEvents(){
  // Atualiza quando o hash muda (ex.: voltar/avançar do navegador)
  window.addEventListener('hashchange', () => {
    const path = getHashPath();
    if (path) {
      load(path);
      setActive(path);
    }
  });

  // Toggle do menu em qualquer largura (mobile = abre/fecha; desktop = colapsa/expande)
  menuToggle.addEventListener('click', () => {
    const isMobile = window.matchMedia('(max-width: 900px)').matches;

    if (isMobile){
      const open = !sidebar.classList.contains('open');
      sidebar.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      try{ localStorage.setItem('sidebarState', open ? 'open' : 'closed'); }catch{}
    }else{
      const collapsed = !sidebar.classList.contains('collapsed');
      sidebar.classList.toggle('collapsed', collapsed);
      layout.classList.toggle('collapsed', collapsed);
      menuToggle.setAttribute('aria-expanded', String(!collapsed));
      try{ localStorage.setItem('sidebarState', collapsed ? 'collapsed' : 'expanded'); }catch{}
    }
  });

  // Reage a mudanças de largura (entra/sai do breakpoint)
  const mq = window.matchMedia('(max-width: 900px)');
  if (mq.addEventListener){
    mq.addEventListener('change', setInitialSidebarState);
  }else{
    // Safari antigo
    mq.addListener(setInitialSidebarState);
  }
}

function setInitialSidebarState(){
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const state = (() => { try{ return localStorage.getItem('sidebarState'); }catch{ return null; } })();

  // Limpa classes antes de aplicar
  sidebar.classList.remove('open', 'collapsed');
  layout.classList.remove('collapsed');

  if (isMobile){
    // Mobile: padrão fechado (open = visível)
    const open = state ? state === 'open' : false;
    sidebar.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  }else{
    // Desktop: padrão expandido (collapsed = escondido)
    const collapsed = state ? state === 'collapsed' : false;
    sidebar.classList.toggle('collapsed', collapsed);
    layout.classList.toggle('collapsed', collapsed);
    menuToggle.setAttribute('aria-expanded', String(!collapsed));
  }
}

async function getConteudos(){
  // 1) Se for file://, usa o fallback embutido
  if (location.protocol === 'file:'){
    const inline = readInlineData();
    if (inline?.length) return inline;
    throw new Error('Rodando via file:// sem dados embutidos (script#conteudos-data).');
  }

  // 2) Busca conteudos.json; se falhar, tenta fallback embutido
  try{
    const res = await fetch(DATA_FILE, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Falha ao buscar ${DATA_FILE} (status ${res.status})`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }catch(err){
    console.warn('Falha no fetch de conteudos.json, tentando fallback embutido...', err);
    const inline = readInlineData();
    if (inline?.length) return inline;
    throw err;
  }
}

function readInlineData(){
  const el = document.getElementById('conteudos-data');
  if (!el) return null;
  try{
    return JSON.parse(el.textContent);
  }catch(e){
    console.error('JSON embutido inválido:', e);
    return null;
  }
}

function sortByDateIfPossible(list){
  const withDate = list.map(item => ({ ...item, _date: extractDate(item.titulo || item.arquivo) }));
  withDate.sort((a, b) => {
    if (a._date && b._date) return b._date - a._date;
    return (b.titulo || '').localeCompare(a.titulo || '');
  });
  return withDate.map(({ _date, ...rest }) => rest);
}

function renderMenu(items){
  menuEl.innerHTML = '';
  items.forEach((item) => {
    const path = String(item.arquivo);
    const href = `#/${encodeURI(path)}`;

    const a = document.createElement('a');
    a.href = href;
    a.textContent = item.titulo || path;
    a.dataset.path = path;

    // Atualiza imediatamente no clique (sem depender apenas do hashchange)
    a.addEventListener('click', (ev) => {
      ev.preventDefault(); // evita navegação padrão
      const isMobile = window.matchMedia('(max-width: 900px)').matches;
      if (isMobile) {
        sidebar.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        try{ localStorage.setItem('sidebarState', 'closed'); }catch{}
      }
      navigateTo(path);
    });

    menuEl.appendChild(a);
  });
  highlightActive();
}

function navigateTo(path){
  const norm = String(path).trim();
  // Atualiza o hash (para permitir voltar/avançar) e carrega imediatamente
  if (getHashPath() !== norm) {
    location.hash = `#/${encodeURI(norm)}`;
  }
  load(norm);
  setActive(norm);
}

function applyFromHashOrDefault(){
  const hashPath = getHashPath();
  const stored = (() => { try{ return localStorage.getItem('ultimoConteudo'); }catch{ return ''; } })();

  if (hashPath){
    load(hashPath);
    setActive(hashPath);
  }else if (stored){
    navigateTo(stored);
  }else if (itens.length){
    navigateTo(itens[0].arquivo);
  }
}

function getHashPath(){
  return decodeURIComponent(location.hash.replace(/^#\/?/, '')).trim();
}

function load(path){
  viewer.src = encodeURI(path); // suporta espaços
  const current = itens.find(i => String(i.arquivo) === path);
  if (current) document.title = `Web1-IFRO | ${current.titulo}`;
  try{ localStorage.setItem('ultimoConteudo', path); }catch{}
}

function setActive(path){
  activePath = path;
  highlightActive();
}

function highlightActive(){
  const links = menuEl.querySelectorAll('a');
  links.forEach(a => {
    a.classList.toggle('active', a.dataset.path === activePath);
  });
}

// Busca simples
searchEl.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  const links = menuEl.querySelectorAll('a');
  links.forEach(a => {
    const visible = a.textContent.toLowerCase().includes(q);
    a.style.display = visible ? '' : 'none';
  });
});

// Extrai data no formato DD-MM-YY do texto
function extractDate(text){
  const m = /(\d{2})-(\d{2})-(\d{2})/.exec(text || '');
  if (!m) return null;
  const [ , dd, mm, yy ] = m;
  const year = 2000 + parseInt(yy, 10);
  const monthIndex = parseInt(mm, 10) - 1;
  const day = parseInt(dd, 10);
  const d = new Date(year, monthIndex, day);
  return isNaN(d.getTime()) ? null : d;
}