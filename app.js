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
  calendario: {type:'Calendário',title:'Hoje',description:'',year:'',skills:'',preview:'Seu calendário'},
  arquivo: {type:'Projetos',title:'Arquivo',description:'Escolha um dos oito projetos para abrir.',year:'8 projetos',skills:'Portfólio',preview:''},
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
  if (win.hidden || !win.contains(trigger)) lastTrigger = trigger || document.activeElement;
  win.dataset.view = key;
  Object.entries(fields).forEach(([field, selector]) => { document.querySelector(selector).textContent = project[field]; });
  document.querySelector('#window-label').textContent = project.title;
  document.querySelector('#window-preview span').textContent = project.preview;
  document.querySelector('#window-preview').hidden = key === 'arquivo';
  document.querySelector('#window-directory').hidden = key !== 'arquivo';
  const currentSection = key === 'sobre' || key === 'contato' ? key : key === 'arquivo' || key in projectTitles ? 'arquivo' : null;
  document.querySelectorAll('.window-sidebar [data-open]').forEach(button => {
    const selected = button.dataset.open === currentSection;
    button.classList.toggle('is-current', selected);
    if (selected) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('.desktop-item').forEach(item => item.classList.toggle('is-open', item.dataset.open === key));
  win.hidden = false;
  document.querySelector('.close').focus();
}

function closeWindow() {
  win.hidden = true;
  document.querySelectorAll('.desktop-item.is-open').forEach(item => item.classList.remove('is-open'));
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
  const weekday = now.toLocaleDateString('pt-BR', {weekday:'short'});
  document.querySelector('#widget-weekday').textContent = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  document.querySelector('#widget-day').textContent = now.getDate();
  document.querySelector('#widget-month').textContent = now.toLocaleDateString('pt-BR', {month:'short'});
  projects.calendario.description = now.toLocaleDateString('pt-BR', {weekday:'long',day:'numeric',month:'long',year:'numeric'});
  projects.calendario.year = String(now.getFullYear());
  projects.calendario.skills = 'Data local';
}
tick();
setInterval(tick, 30000);

const workspace = document.querySelector('.workspace');
const movableItems = [...workspace.querySelectorAll('.desktop-item, .desktop-widget')];
const widgets = movableItems.filter(item => item.classList.contains('desktop-widget'));
const desktopLayout = window.matchMedia('(min-width: 701px)');
const layoutStorageKey = 'portfolio.desktop.positions.v3';
const defaultWidgetCells = {
  calendar: [0, 0], about: [1, 0], archive: [0, 1], motion: [1, 1], feature: [0, 2]
};

function itemId(item) {
  return item.classList.contains('desktop-widget') ? `widget:${item.dataset.dragId}` : `project:${item.dataset.open}`;
}

function readPositions() {
  try { return JSON.parse(localStorage.getItem(layoutStorageKey)) || {}; }
  catch { return {}; }
}

function savePosition(item) {
  const positions = readPositions();
  if (item.classList.contains('desktop-widget')) {
    positions[itemId(item)] = {col: Number(item.dataset.gridCol), row: Number(item.dataset.gridRow)};
    try { localStorage.setItem(layoutStorageKey, JSON.stringify(positions)); }
    catch { /* The desktop still works when browser storage is unavailable. */ }
    return;
  }
  const maxX = Math.max(0, workspace.clientWidth - item.offsetWidth);
  const maxY = Math.max(0, workspace.clientHeight - item.offsetHeight);
  positions[itemId(item)] = {
    x: maxX ? Math.min(1, Math.max(0, parseFloat(item.style.left) / maxX)) : 0,
    y: maxY ? Math.min(1, Math.max(0, parseFloat(item.style.top) / maxY)) : 0
  };
  try { localStorage.setItem(layoutStorageKey, JSON.stringify(positions)); }
  catch { /* The desktop still works when browser storage is unavailable. */ }
}

function widgetGrid() {
  const cell = widgets[0].offsetWidth;
  return {left: 16, top: 8, stepX: cell + (cell < 140 ? 11 : 15), stepY: widgets[0].offsetHeight + 15};
}

function placeWidget(item, wantedX, wantedY, occupied) {
  const grid = widgetGrid();
  const maxCol = Math.max(0, Math.floor((workspace.clientWidth - grid.left - item.offsetWidth) / grid.stepX));
  const maxRow = Math.max(0, Math.floor((workspace.clientHeight - grid.top - item.offsetHeight) / grid.stepY));
  const slots = [];
  for (let row = 0; row <= maxRow; row++) {
    for (let col = 0; col <= maxCol; col++) {
      const x = grid.left + col * grid.stepX;
      const y = grid.top + row * grid.stepY;
      const overlaps = occupied.some(other => {
        const ox = parseFloat(other.style.left);
        const oy = parseFloat(other.style.top);
        return x < ox + other.offsetWidth + 7 && x + item.offsetWidth + 7 > ox &&
          y < oy + other.offsetHeight + 7 && y + item.offsetHeight + 7 > oy;
      });
      if (!overlaps) slots.push({col, row, x, y});
    }
  }
  slots.sort((a, b) => (a.x - wantedX) ** 2 + (a.y - wantedY) ** 2 -
    ((b.x - wantedX) ** 2 + (b.y - wantedY) ** 2));
  const slot = slots[0];
  if (!slot) return;
  item.style.left = `${slot.x}px`;
  item.style.top = `${slot.y}px`;
  item.style.right = 'auto';
  item.dataset.gridCol = slot.col;
  item.dataset.gridRow = slot.row;
}

function applyPositions() {
  const positions = readPositions();
  movableItems.filter(item => !item.classList.contains('desktop-widget')).forEach(item => {
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
  if (!desktopLayout.matches) {
    widgets.forEach(item => {
      item.style.left = '';
      item.style.top = '';
      item.style.right = '';
    });
    return;
  }
  const grid = widgetGrid();
  const occupied = [];
  widgets.forEach(item => {
    const position = positions[itemId(item)];
    const [defaultCol, defaultRow] = defaultWidgetCells[item.dataset.dragId];
    const wantedX = Number.isInteger(position?.col) ? grid.left + position.col * grid.stepX :
      typeof position?.x === 'number' ? position.x * Math.max(0, workspace.clientWidth - item.offsetWidth) :
      grid.left + defaultCol * grid.stepX;
    const wantedY = Number.isInteger(position?.row) ? grid.top + position.row * grid.stepY :
      typeof position?.y === 'number' ? position.y * Math.max(0, workspace.clientHeight - item.offsetHeight) :
      grid.top + defaultRow * grid.stepY;
    placeWidget(item, wantedX, wantedY, occupied);
    occupied.push(item);
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
    item.classList.remove('dragging');
    if (drag.moved) {
      if (item.classList.contains('desktop-widget')) {
        placeWidget(item, parseFloat(item.style.left), parseFloat(item.style.top), widgets.filter(other => other !== item));
      }
      savePosition(item);
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 500);
    }
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

const dock = document.querySelector('.dock');
const dockApps = [...dock.querySelectorAll('button, a')];
const canMagnifyDock = window.matchMedia('(hover: hover) and (pointer: fine)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function resetDockWave() {
  dockApps.forEach(app => {
    app.style.removeProperty('--dock-lift');
    app.style.removeProperty('--dock-scale');
  });
}

dock.addEventListener('pointermove', event => {
  if (!canMagnifyDock.matches || reduceMotion.matches || event.pointerType === 'touch') return;
  dockApps.forEach(app => {
    const rect = app.getBoundingClientRect();
    const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));
    const wave = Math.exp(-0.5 * (distance / 52) ** 2);
    app.style.setProperty('--dock-lift', `${(-12 * wave).toFixed(2)}px`);
    app.style.setProperty('--dock-scale', (1 + 0.19 * wave).toFixed(3));
  });
});

dock.addEventListener('pointerleave', resetDockWave);
canMagnifyDock.addEventListener('change', resetDockWave);
reduceMotion.addEventListener('change', resetDockWave);
