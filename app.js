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
  const wasHidden = win.hidden;
  if (minimizedThumb) clearMinimized();
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
  win.classList.remove('is-inactive');
  desktopEl.classList.add('window-open');
  if (wasHidden && !reduceMotion.matches) playOpenAnimation();
  document.querySelector('.close').focus();
}

function closeWindow() {
  if (closing) return;
  const finish = () => {
    closing = false;
    win.hidden = true;
    resetWindowState();
    document.querySelectorAll('.desktop-item.is-open').forEach(item => item.classList.remove('is-open'));
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  };
  if (minimizedThumb) clearMinimized();
  if (win.hidden || reduceMotion.matches) { finish(); return; }
  closing = true;
  // The timer guarantees the window closes even if the browser skips the animation frames.
  let finished = false;
  const finishOnce = () => { if (!finished) { finished = true; finish(); } };
  win.animate([{opacity: 1, scale: 1}, {opacity: 0, scale: 0.94}], {duration: 140, easing: 'ease-out'}).onfinish = finishOnce;
  setTimeout(finishOnce, 220);
}

document.querySelectorAll('[data-open]:not(.desktop-item)').forEach(button => button.addEventListener('click', () => openProject(button.dataset.open, button)));
document.querySelector('.close').addEventListener('click', closeWindow);
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || win.hidden) return;
  if (windowMode === 'fullscreen') collapseWindow(); else closeWindow();
});
document.querySelector('#instagram').addEventListener('click', event => { event.preventDefault(); openProject('contato', event.currentTarget); });

function tick() {
  const now = new Date();
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
const projectFileItems = movableItems.filter(item => !item.classList.contains('desktop-widget'));
const desktopLayout = window.matchMedia('(min-width: 701px)');
const layoutStorageKey = 'portfolio.desktop.positions.v4';
const legacyLayoutStorageKey = 'portfolio.desktop.positions.v3';
const defaultWidgetCells = {
  calendar: [0, 0], about: [1, 0], archive: [0, 1], motion: [1, 1], feature: [0, 2]
};
// Desktop behavior modeled on the Mac: widgets can sit anywhere, line up with the edges and with each
// other when dropped close to them, never overlap each other, and files move out of a widget's way.
// Apple publishes no snapping distance; SNAP_DISTANCE is a design choice.
const EDGE_MARGIN = 16;
const SNAP_DISTANCE = 18;
const MIN_GAP = 8;
const FILE_GAP = 4;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function itemId(item) {
  return item.classList.contains('desktop-widget') ? `widget:${item.dataset.dragId}` : `project:${item.dataset.open}`;
}

function readPositions() {
  for (const key of [layoutStorageKey, legacyLayoutStorageKey]) {
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      if (stored) return stored;
    } catch { /* Fall through to the next key. */ }
  }
  return {};
}

function writePositions(positions) {
  try { localStorage.setItem(layoutStorageKey, JSON.stringify(positions)); }
  catch { /* The desktop still works when browser storage is unavailable. */ }
}

function boxOf(item) {
  const left = parseFloat(item.style.left);
  const top = parseFloat(item.style.top);
  return {
    x: Number.isFinite(left) ? left : item.offsetLeft,
    y: Number.isFinite(top) ? top : item.offsetTop,
    w: item.offsetWidth,
    h: item.offsetHeight
  };
}

function limitsOf(item) {
  return {
    maxX: Math.max(0, workspace.clientWidth - item.offsetWidth),
    maxY: Math.max(0, workspace.clientHeight - item.offsetHeight)
  };
}

function overlaps(a, b, gap) {
  return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;
}

function setPosition(item, x, y) {
  item.style.left = `${Math.round(x)}px`;
  item.style.top = `${Math.round(y)}px`;
  item.style.right = 'auto';
}

function savePosition(item) {
  const positions = readPositions();
  if (item.classList.contains('desktop-widget')) {
    positions[itemId(item)] = {left: Math.round(parseFloat(item.style.left)), top: Math.round(parseFloat(item.style.top))};
  } else {
    const {maxX, maxY} = limitsOf(item);
    positions[itemId(item)] = {
      x: maxX ? clamp(parseFloat(item.style.left) / maxX, 0, 1) : 0,
      y: maxY ? clamp(parseFloat(item.style.top) / maxY, 0, 1) : 0
    };
  }
  writePositions(positions);
}

function widgetGap() {
  return widgets[0].offsetWidth < 140 ? 11 : 15;
}

// Aligns a dropped widget with the desktop edges and with other widgets, but only when it lands close to them.
function snappedPosition(item, x, y, others) {
  const {maxX, maxY} = limitsOf(item);
  const w = item.offsetWidth;
  const h = item.offsetHeight;
  const gap = widgetGap();
  const xTargets = [EDGE_MARGIN, workspace.clientWidth - EDGE_MARGIN - w];
  const yTargets = [EDGE_MARGIN, workspace.clientHeight - EDGE_MARGIN - h];
  others.forEach(o => {
    xTargets.push(o.x, o.x + o.w - w, o.x + o.w + gap, o.x - gap - w);
    yTargets.push(o.y, o.y + o.h - h, o.y + o.h + gap, o.y - gap - h);
  });
  const near = (value, targets) => {
    const best = targets.reduce((a, t) => Math.abs(t - value) < Math.abs(a - value) ? t : a, targets[0]);
    return Math.abs(best - value) <= SNAP_DISTANCE ? best : value;
  };
  return {x: clamp(near(x, xTargets), 0, maxX), y: clamp(near(y, yTargets), 0, maxY)};
}

// Nearest position that does not overlap any other widget; null when there is none.
function freeWidgetSpot(item, x, y, others) {
  const {maxX, maxY} = limitsOf(item);
  const w = item.offsetWidth;
  const h = item.offsetHeight;
  const gap = widgetGap();
  const candidates = [{x, y}];
  others.forEach(o => candidates.push(
    {x: o.x + o.w + gap, y}, {x: o.x - gap - w, y}, {x, y: o.y + o.h + gap}, {x, y: o.y - gap - h},
    {x: o.x + o.w + gap, y: o.y}, {x: o.x - gap - w, y: o.y}, {x: o.x, y: o.y + o.h + gap}, {x: o.x, y: o.y - gap - h}
  ));
  return candidates
    .map(c => ({x: clamp(c.x, 0, maxX), y: clamp(c.y, 0, maxY)}))
    .filter(c => others.every(o => !overlaps({x: c.x, y: c.y, w, h}, o, MIN_GAP)))
    .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0] || null;
}

function placeWidget(item, x, y, {snap = false, exact = false} = {}) {
  const others = widgets.filter(other => other !== item).map(boxOf);
  const {maxX, maxY} = limitsOf(item);
  const target = snap ? snappedPosition(item, x, y, others) : {x: clamp(x, 0, maxX), y: clamp(y, 0, maxY)};
  const spot = freeWidgetSpot(item, target.x, target.y, others);
  if (!spot || (exact && (spot.x !== target.x || spot.y !== target.y))) return false;
  setPosition(item, spot.x, spot.y);
  return true;
}

// Nearest position for a file that overlaps no widget and no other file.
function freeFileSpot(file) {
  const {maxX, maxY} = limitsOf(file);
  const size = boxOf(file);
  const obstacles = [...widgets, ...projectFileItems.filter(other => other !== file)].map(boxOf);
  let best = null;
  let bestDistance = Infinity;
  for (let y = 0; y <= maxY; y += 8) {
    for (let x = 0; x <= maxX; x += 8) {
      const distance = Math.hypot(x - size.x, y - size.y);
      if (distance >= bestDistance) continue;
      const box = {x, y, w: size.w, h: size.h};
      if (obstacles.every(o => !overlaps(box, o, FILE_GAP))) { best = {x, y}; bestDistance = distance; }
    }
  }
  return best;
}

function clearFilesFromWidgets(files = projectFileItems) {
  files.forEach(file => {
    const box = boxOf(file);
    if (!widgets.some(widget => overlaps(box, boxOf(widget), FILE_GAP))) return;
    const spot = freeFileSpot(file);
    if (spot) { setPosition(file, spot.x, spot.y); savePosition(file); }
  });
}

function applyPositions() {
  const positions = readPositions();
  projectFileItems.forEach(item => {
    const position = positions[itemId(item)];
    if (!desktopLayout.matches || !Number.isFinite(position?.x)) {
      item.style.left = '';
      item.style.top = '';
      item.style.right = '';
      return;
    }
    const {maxX, maxY} = limitsOf(item);
    setPosition(item, clamp(position.x, 0, 1) * maxX, clamp(position.y, 0, 1) * maxY);
  });
  if (!desktopLayout.matches) {
    widgets.forEach(item => {
      item.style.left = '';
      item.style.top = '';
      item.style.right = '';
    });
    return;
  }
  const gap = widgetGap();
  const cellWidth = widgets[0].offsetWidth;
  const cellHeight = widgets[0].offsetHeight;
  const placed = [];
  widgets.forEach(item => {
    const saved = positions[itemId(item)];
    const [col, row] = defaultWidgetCells[item.dataset.dragId];
    const {maxX, maxY} = limitsOf(item);
    const x = clamp(Number.isFinite(saved?.left) ? saved.left : EDGE_MARGIN + col * (cellWidth + gap), 0, maxX);
    const y = clamp(Number.isFinite(saved?.top) ? saved.top : EDGE_MARGIN + row * (cellHeight + gap), 0, maxY);
    const spot = freeWidgetSpot(item, x, y, placed) || {x, y};
    setPosition(item, spot.x, spot.y);
    placed.push({x: spot.x, y: spot.y, w: item.offsetWidth, h: item.offsetHeight});
  });
  clearFilesFromWidgets();
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
    const {maxX, maxY} = limitsOf(item);
    setPosition(item, clamp(drag.left + dx, 0, maxX), clamp(drag.top + dy, 0, maxY));
  });

  function finishDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    item.classList.remove('dragging');
    if (drag.moved) {
      if (item.classList.contains('desktop-widget')) {
        // Dropped on a spot with no free room: the widget returns to where the drag began.
        if (!placeWidget(item, parseFloat(item.style.left), parseFloat(item.style.top), {snap: true})) {
          setPosition(item, drag.left, drag.top);
        }
        savePosition(item);
        clearFilesFromWidgets();
      } else {
        clearFilesFromWidgets([item]);
        savePosition(item);
      }
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

// Keyboard alternative to dragging: arrow keys move the focused widget or file by 16 px.
// A single-pointer alternative (WCAG 2.5.7) is still to be designed.
const arrowDirections = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
movableItems.forEach(item => {
  item.addEventListener('keydown', event => {
    const direction = arrowDirections[event.key];
    if (!direction || event.target !== item || !desktopLayout.matches) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    const step = 16;
    const box = boxOf(item);
    const x = box.x + direction[0] * step;
    const y = box.y + direction[1] * step;
    if (item.classList.contains('desktop-widget')) {
      if (placeWidget(item, x, y, {exact: true})) {
        savePosition(item);
        clearFilesFromWidgets();
      }
      return;
    }
    const {maxX, maxY} = limitsOf(item);
    const moved = {x: clamp(x, 0, maxX), y: clamp(y, 0, maxY), w: box.w, h: box.h};
    if (widgets.some(widget => overlaps(moved, boxOf(widget), FILE_GAP))) return;
    setPosition(item, moved.x, moved.y);
    savePosition(item);
  });
});

// Right click on the desktop opens a small menu, as on the Mac. "Restaurar posições" lives here.
const contextMenu = document.querySelector('#context-menu');
let contextOrigin = null;

function hideContextMenu() {
  if (contextMenu.hidden) return;
  contextMenu.hidden = true;
  if (contextOrigin && typeof contextOrigin.focus === 'function') contextOrigin.focus();
  contextOrigin = null;
}

document.addEventListener('contextmenu', event => {
  if (!desktopLayout.matches || event.target.closest('.window, .dock, .context-menu')) return;
  event.preventDefault();
  let x = event.clientX;
  let y = event.clientY;
  if (!x && !y) {
    const rect = event.target.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  }
  contextOrigin = document.activeElement;
  contextMenu.hidden = false;
  contextMenu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - contextMenu.offsetWidth - 8))}px`;
  contextMenu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - contextMenu.offsetHeight - 8))}px`;
  contextMenu.querySelector('button').focus();
});
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.context-menu') && !contextMenu.hidden) { contextOrigin = null; hideContextMenu(); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !contextMenu.hidden) hideContextMenu();
});

document.querySelector('#reset-layout').addEventListener('click', () => {
  try {
    localStorage.removeItem(layoutStorageKey);
    localStorage.removeItem(legacyLayoutStorageKey);
  } catch { /* Ignore disabled storage. */ }
  contextOrigin = null;
  hideContextMenu();
  applyPositions();
});
window.addEventListener('resize', applyPositions);
applyPositions();

// Desktop files behave like Finder: click selects, double click opens.
// Touch, narrow screens and keyboard activation (Enter) still open with one action.
const projectFiles = [...workspace.querySelectorAll('.desktop-item')];
let lastPointerType = 'mouse';

function selectProjectFile(selected) {
  projectFiles.forEach(file => file.classList.toggle('is-selected', file === selected));
}

projectFiles.forEach(item => {
  item.addEventListener('pointerdown', event => {
    lastPointerType = event.pointerType;
    if (desktopLayout.matches && event.button === 0 && event.pointerType !== 'touch') selectProjectFile(item);
  });
  item.addEventListener('click', event => {
    if (!desktopLayout.matches || event.detail === 0 || lastPointerType === 'touch') openProject(item.dataset.open, item);
  });
  item.addEventListener('dblclick', () => {
    if (desktopLayout.matches && lastPointerType !== 'touch') openProject(item.dataset.open, item);
  });
});

document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.desktop-item')) selectProjectFile(null);
});

const dock = document.querySelector('.dock');
const dockApps = () => dock.querySelectorAll('button, a');
const canMagnifyDock = window.matchMedia('(hover: hover) and (pointer: fine)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function resetDockWave() {
  dockApps().forEach(app => {
    app.style.removeProperty('--dock-lift');
    app.style.removeProperty('--dock-scale');
  });
}

dock.addEventListener('pointermove', event => {
  if (!canMagnifyDock.matches || reduceMotion.matches || event.pointerType === 'touch') return;
  dockApps().forEach(app => {
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

// Window controls, as in macOS: red closes, yellow minimizes to the Dock (scale effect), green enters
// full screen and Option-click zooms. Double click on the title bar zooms. Inactive windows turn gray.
const desktopEl = document.querySelector('.desktop');
const minimizeButton = win.querySelector('.minimize');
const zoomButton = win.querySelector('.zoom');
const windowBar = win.querySelector('.window-bar');
const WINDOW_MS = 450;
const WINDOW_EASE = 'cubic-bezier(.2,.8,.2,1)';
const ZOOM_RESERVE = 84; // keeps the Dock visible when zooming
let windowMode = 'normal';
let minimizedThumb = null;
let closing = false;

function syncWindowControls() {
  win.classList.toggle('is-fullscreen', windowMode === 'fullscreen');
  win.classList.toggle('is-zoomed', windowMode === 'zoomed');
  if (windowMode !== 'fullscreen') win.classList.remove('autohide');
  desktopEl.classList.toggle('has-fullscreen', windowMode === 'fullscreen');
  minimizeButton.disabled = windowMode === 'fullscreen';
  zoomButton.disabled = !desktopLayout.matches;
  zoomButton.setAttribute('aria-label', windowMode === 'fullscreen' ? 'Sair da tela cheia' : 'Tela cheia');
}

function pinWindowBox() {
  const rect = win.getBoundingClientRect();
  Object.assign(win.style, {
    left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
    maxHeight: 'none', transform: 'none', borderRadius: getComputedStyle(win).borderRadius
  });
  return rect;
}

function releaseWindowBox() {
  ['left', 'top', 'width', 'height', 'maxHeight', 'transform', 'transformOrigin', 'transition', 'opacity', 'borderRadius']
    .forEach(property => { win.style[property] = ''; });
}

function resetWindowState() {
  windowMode = 'normal';
  releaseWindowBox();
  desktopEl.classList.remove('window-open');
  syncWindowControls();
}

function transitionWindow(target, properties, done) {
  if (reduceMotion.matches) { Object.assign(win.style, target); done(); return; }
  win.style.transition = properties.map(property => `${property} ${WINDOW_MS}ms ${WINDOW_EASE}`).join(', ');
  void win.offsetWidth;
  Object.assign(win.style, target);
  let finished = false;
  const end = () => {
    if (finished) return;
    finished = true;
    win.removeEventListener('transitionend', onEnd);
    done();
  };
  const onEnd = event => { if (event.target === win) end(); };
  win.addEventListener('transitionend', onEnd);
  setTimeout(end, WINDOW_MS + 80);
}

function playOpenAnimation() {
  win.animate(
    [{opacity: 0, scale: 0.94, translate: '0 4%'}, {opacity: 1, scale: 1, translate: '0 0'}],
    {duration: 250, easing: WINDOW_EASE}
  );
}

function expandWindow(mode) {
  if (!desktopLayout.matches || win.hidden || windowMode === mode) return;
  const desk = desktopEl.getBoundingClientRect();
  const target = {
    left: '0px', top: '0px', width: `${desk.width}px`,
    height: `${mode === 'fullscreen' ? desk.height : desk.height - ZOOM_RESERVE}px`,
    borderRadius: mode === 'fullscreen' ? '0px' : getComputedStyle(win).borderRadius
  };
  pinWindowBox();
  windowMode = mode;
  syncWindowControls();
  transitionWindow(target, ['left', 'top', 'width', 'height', 'border-radius'], () => {
    releaseWindowBox();
    if (windowMode === 'fullscreen') win.classList.add('autohide');
  });
}

function collapseWindow() {
  if (windowMode === 'normal' || win.hidden) return;
  const from = win.getBoundingClientRect();
  const fromRadius = getComputedStyle(win).borderRadius;
  releaseWindowBox();
  windowMode = 'normal';
  syncWindowControls();
  const to = win.getBoundingClientRect();
  const toRadius = getComputedStyle(win).borderRadius;
  Object.assign(win.style, {
    left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`,
    maxHeight: 'none', transform: 'none', borderRadius: fromRadius
  });
  transitionWindow(
    {left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: toRadius},
    ['left', 'top', 'width', 'height', 'border-radius'], releaseWindowBox
  );
}

function createDockThumb() {
  const title = document.querySelector('#window-title').textContent;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dock-minimized is-pending';
  button.setAttribute('aria-label', `Restaurar janela: ${title}`);
  button.innerHTML = '<span class="dock-icon dock-thumb"><span class="thumb-bar"></span><span class="thumb-title"></span></span><small></small>';
  button.querySelector('.thumb-title').textContent = title;
  button.querySelector('small').textContent = title;
  button.addEventListener('click', restoreWindow);
  dock.insertBefore(button, dock.querySelector('[data-open="lixeira"]'));
  return button;
}

function minimizeWindow() {
  if (win.hidden || minimizedThumb || windowMode === 'fullscreen') return;
  const thumb = createDockThumb();
  const to = thumb.getBoundingClientRect();
  const from = pinWindowBox();
  win.style.transformOrigin = 'top left';
  minimizedThumb = thumb;
  transitionWindow({
    transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`,
    opacity: '0.25'
  }, ['transform', 'opacity'], () => {
    win.hidden = true;
    releaseWindowBox();
    desktopEl.classList.remove('window-open');
    thumb.classList.remove('is-pending');
  });
}

function restoreWindow() {
  const thumb = minimizedThumb;
  if (!thumb) return;
  win.hidden = false;
  win.classList.remove('is-inactive');
  desktopEl.classList.add('window-open');
  const to = win.getBoundingClientRect();
  const from = thumb.getBoundingClientRect();
  thumb.classList.add('is-pending');
  Object.assign(win.style, {
    left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`,
    maxHeight: 'none', transformOrigin: 'top left', opacity: '0.25',
    transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`
  });
  transitionWindow({transform: 'none', opacity: '1'}, ['transform', 'opacity'], () => {
    releaseWindowBox();
    thumb.remove();
    minimizedThumb = null;
    document.querySelector('.close').focus();
  });
}

function clearMinimized() {
  if (minimizedThumb) minimizedThumb.remove();
  minimizedThumb = null;
  resetWindowState();
}

minimizeButton.addEventListener('click', minimizeWindow);
zoomButton.addEventListener('click', event => {
  if (!desktopLayout.matches) return;
  if (event.altKey) {
    if (windowMode === 'zoomed') collapseWindow(); else expandWindow('zoomed');
  } else if (windowMode === 'fullscreen') {
    collapseWindow();
  } else {
    expandWindow('fullscreen');
  }
});
windowBar.addEventListener('dblclick', event => {
  if (event.target.closest('.traffic, .window-home') || !desktopLayout.matches || windowMode === 'fullscreen') return;
  if (windowMode === 'zoomed') collapseWindow(); else expandWindow('zoomed');
});
document.addEventListener('keydown', event => { if (event.key === 'Alt') win.classList.add('alt-down'); });
document.addEventListener('keyup', event => { if (event.key === 'Alt') win.classList.remove('alt-down'); });
window.addEventListener('blur', () => win.classList.remove('alt-down'));
document.addEventListener('pointerdown', event => {
  if (!win.hidden) win.classList.toggle('is-inactive', !event.target.closest('.window'));
}, true);
window.addEventListener('resize', () => {
  if (!desktopLayout.matches && windowMode !== 'normal') { windowMode = 'normal'; releaseWindowBox(); }
  syncWindowControls();
});
syncWindowControls();
