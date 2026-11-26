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
}
tick();
setInterval(tick, 30000);
