const projectTitles = {
  identidade: ['Identidade visual', 'Branding'],
  campanha: ['Campanha digital', 'Campanha'],
  editorial: ['Projeto editorial', 'Editorial'],
  motion: ['Motion & vídeo', 'Audiovisual'],
  social: ['Social media', 'Conteúdo'],
  web: ['Experiência web', 'Digital'],
  foto: ['Direção de arte', 'Imagem'],
  experimentos: ['Experimentos', 'Arquivo aberto']
};

const projects = Object.fromEntries(Object.entries(projectTitles).map(([key, [title, type]]) => [key, {
  title, type,
  description: 'Espaço reservado para apresentar este projeto com imagens, contexto e o seu processo criativo.',
  year: 'Prévia', skills: 'Conteúdo em preparação', preview: 'Capa em preparação'
}]));

Object.assign(projects, {
  sobre: {type:'Perfil',title:'Sobre mim',description:'Espaço para sua apresentação, trajetória e forma de trabalhar.',year:'Perfil',skills:'Texto em preparação',preview:'Sua apresentação'},
  contato: {type:'Contato',title:'Vamos conversar',description:'Aqui entram seu e-mail, Instagram e outros links de contato.',year:'Contato',skills:'Links em preparação',preview:'Seus contatos'},
  notas: {type:'Aplicativo',title:'Bloco de Notas',description:'Um lugar para ideias, bastidores e anotações sobre o seu trabalho.',year:'Notas',skills:'Conteúdo em preparação',preview:'Suas notas'},
  apresentacoes: {type:'Aplicativo',title:'PowerPoint',description:'Apresentações e estudos de caso poderão ser acessados por aqui.',year:'Decks',skills:'Conteúdo em preparação',preview:'Suas apresentações'},
  fotos: {type:'Aplicativo',title:'Fotos',description:'Um espaço para reunir imagens dos projetos e bastidores do processo criativo.',year:'Galeria',skills:'Conteúdo em preparação',preview:'Sua galeria'},
  lixeira: {type:'Sistema',title:'Lixeira',description:'A lixeira está vazia.',year:'Vazio',skills:'Nenhum arquivo removido',preview:'Lixeira vazia'}
});

const win = document.querySelector('#project-window');
const fields = {type:'#window-type',title:'#window-title',description:'#window-description',year:'#window-year',skills:'#window-skills'};
let lastTrigger = null;

function openProject(key, trigger) {
  const project = projects[key];
  if (!project) return;
  lastTrigger = trigger || document.activeElement;
  Object.entries(fields).forEach(([field, selector]) => { document.querySelector(selector).textContent = project[field]; });
  document.querySelector('#window-label').textContent = project.title;
  document.querySelector('#window-preview span').textContent = project.preview;
  win.hidden = false;
  document.querySelector('.close').focus();
}

function closeWindow() {
  win.hidden = true;
  if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
}

document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.open, button)));
document.querySelector('.close').addEventListener('click', closeWindow);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !win.hidden) closeWindow(); });
document.querySelector('#instagram').addEventListener('click', event => { event.preventDefault(); openProject('contato', event.currentTarget); });

function tick() {
  const now = new Date();
  document.querySelector('#clock').textContent = now.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
  document.querySelector('#date').textContent = now.toLocaleDateString('pt-BR', {weekday:'short',day:'2-digit',month:'short'});
  document.querySelector('#widget-weekday').textContent = now.toLocaleDateString('pt-BR', {weekday:'long'}).toUpperCase();
  document.querySelector('#widget-day').textContent = now.getDate();
  document.querySelector('#widget-month').textContent = now.toLocaleDateString('pt-BR', {month:'long'}).toUpperCase();
}
tick();
setInterval(tick, 30000);

const workspace = document.querySelector('.workspace');
const movableItems = [...workspace.querySelectorAll('.desktop-item, .desktop-widget')];
const desktopLayout = window.matchMedia('(min-width: 701px)');
const layoutStorageKey = 'portfolio.desktop.positions.v1';

function itemId(item) {
  return item.classList.contains('desktop-widget') ? `widget:${item.dataset.dragId}` : `project:${item.dataset.open}`;
}

function readPositions() {
  try { return JSON.parse(localStorage.getItem(layoutStorageKey)) || {}; }
  catch { return {}; }
}

function savePosition(item) {
  const positions = readPositions();
  const maxX = Math.max(0, workspace.clientWidth - item.offsetWidth);
  const maxY = Math.max(0, workspace.clientHeight - item.offsetHeight);
  positions[itemId(item)] = {
    x: maxX ? Math.min(1, Math.max(0, parseFloat(item.style.left) / maxX)) : 0,
    y: maxY ? Math.min(1, Math.max(0, parseFloat(item.style.top) / maxY)) : 0
  };
  try { localStorage.setItem(layoutStorageKey, JSON.stringify(positions)); }
  catch { /* The desktop still works when browser storage is unavailable. */ }
}

function applyPositions() {
  const positions = readPositions();
  movableItems.forEach(item => {
    const position = positions[itemId(item)];
    if (!desktopLayout.matches || !position) {
      item.style.left = '';
      item.style.top = '';
      item.style.right = '';
      return;
    }
    const maxX = Math.max(0, workspace.clientWidth - item.offsetWidth);
    const maxY = Math.max(0, workspace.clientHeight - item.offsetHeight);
    item.style.left = `${Math.round(Math.min(1, Math.max(0, position.x)) * maxX)}px`;
    item.style.top = `${Math.round(Math.min(1, Math.max(0, position.y)) * maxY)}px`;
    item.style.right = 'auto';
  });
}

movableItems.forEach(item => {
  let drag = null;
  let suppressClick = false;

  item.addEventListener('pointerdown', event => {
    if (!desktopLayout.matches || event.button !== 0 || event.target.closest('.desktop-widget button')) return;
    const itemRect = item.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX, startY: event.clientY,
      left: itemRect.left - workspaceRect.left,
      top: itemRect.top - workspaceRect.top,
      moved: false
    };
    item.setPointerCapture(event.pointerId);
  });

  item.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true;
    item.classList.add('dragging');
    const maxX = Math.max(0, workspace.clientWidth - item.offsetWidth);
    const maxY = Math.max(0, workspace.clientHeight - item.offsetHeight);
    item.style.left = `${Math.round(Math.min(maxX, Math.max(0, drag.left + dx)))}px`;
    item.style.top = `${Math.round(Math.min(maxY, Math.max(0, drag.top + dy)))}px`;
    item.style.right = 'auto';
  });

  function finishDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.moved) {
      savePosition(item);
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 500);
    }
    item.classList.remove('dragging');
    drag = null;
  }

  item.addEventListener('pointerup', finishDrag);
  item.addEventListener('pointercancel', finishDrag);
  item.addEventListener('click', event => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClick = false;
  }, true);
});

document.querySelector('#reset-layout').addEventListener('click', () => {
  try { localStorage.removeItem(layoutStorageKey); } catch { /* Ignore disabled storage. */ }
  applyPositions();
});
window.addEventListener('resize', applyPositions);
applyPositions();
