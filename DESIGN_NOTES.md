# Direção visual do portfólio

- O retrato é o conteúdo principal do desktop. Widgets e documentos ficam nas laterais para manter o rosto visível.
- A barra superior, o dock e a navegação da janela usam superfícies translúcidas e bordas suaves. O conteúdo da janela usa uma superfície clara para preservar contraste. Isso segue a separação entre camada de controles e camada de conteúdo descrita pela Apple em [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) e [Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/).
- Os cinco widgets usam cantos arredondados, informação curta e variações discretas de cor. A aparência translúcida e a legibilidade seguem [Widgets](https://developer.apple.com/design/human-interface-guidelines/widgets).
- No desktop, os widgets ficam em qualquer posição, alinham-se às bordas e aos outros widgets só quando soltos perto deles e nunca se sobrepõem; os arquivos de projetos também são livres e saem do caminho de um widget. SF Pro é usado automaticamente no Mac por meio da fonte do sistema. No Windows, Inter é a alternativa incorporada sob a licença OFL, com pesos e espaçamento ajustados para se aproximarem da [tipografia de interface da Apple](https://developer.apple.com/design/human-interface-guidelines/typography). O dock foi reduzido em aproximadamente 30% no desktop.
- O dock usa uma variante mais transparente sobre a foto escura, com um contorno fino e blur leve para deixar a imagem visível. A Apple recomenda a variante Clear sobre fundos visuais, mantendo contraste para os controles em [Materials](https://developer.apple.com/design/human-interface-guidelines/materials).
- A lixeira agora aparece como objeto translúcido, sem um quadrado de aplicativo. Sua arte foi criada para este portfólio a partir de uma referência visual do Dock do macOS; não é um arquivo oficial da Apple. No desktop, a ampliação dos apps acompanha a distância horizontal do ponteiro e também levanta suavemente os vizinhos. A animação é desativada quando a pessoa prefere movimento reduzido.
- Apps no dock usam sua própria arte, com dimensões ópticas consistentes e sem reflexos adicionados sobre o desenho do ícone. A forma arredondada e a redução de efeitos embutidos seguem [App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons) e a [sessão de ícones da WWDC25](https://developer.apple.com/videos/play/wwdc2025/220/).
- Os oito trabalhos aparecem como documentos de projeto, separados visualmente dos aplicativos. Até receber as capas e descrições reais, as janelas identificam o conteúdo como prévia.
- Arquivos e widgets podem ser arrastados no desktop. Clicar com o botão direito na mesa abre o menu com “Restaurar posições”, que recupera a composição padrão; no celular, o conteúdo segue uma ordem de leitura sem arraste.

## Refinamentos da pesquisa de 26/11/2026

- O Apple Support descreve o posicionamento de widgets no Mac como "qualquer posição" e relatos independentes citam só alinhamento perto de vizinhos e bordas; o site segue isso. O widget largo (305 x 145) corresponde ao tamanho médio das famílias da Apple.
- Tracking: números grandes e títulos de widgets agora usam valores entre a tabela oficial da SF Pro e a fórmula Dynamic Metrics da Inter (-0,02em a -0,022em), em vez de -0,035em a -0,065em. Rótulos de widget têm pelo menos 11 px.
- Acessibilidade: o botão de fechar da janela mantém 13 px visuais, com área clicável de cerca de 25 px; o rótulo do Dock aparece também no foco por teclado; as setas movem o widget ou o arquivo focado em 16 px. Falta uma alternativa de ponteiro único ao arraste (WCAG 2.5.7).
- Telas de até 700 px usam uma versão recortada da foto (cerca de 0,5 MB em vez de 4,1 MB), com o mesmo enquadramento central.
- O símbolo do widget Motion é um SVG próprio, pois a fonte Inter do site não inclui o triângulo.
- Decisões ainda abertas: ícones de terceiros, estado da lixeira, Dock no celular e opção própria de transparência reduzida para o Safari.

## Barra superior, widgets e janelas (26/11/2026)

- A barra de menus foi removida. Sobre abre pelo widget Portfólio e pela barra lateral da janela; Contato abre pelo e-mail do Dock e pela barra lateral. O relógio fica no widget de calendário.
- Widgets: o encaixe aparece só quando o widget é solto a até 18 px das bordas (margem de 16 px) ou de outro widget. A Apple não publica essa distância; é escolha de design. Se um widget é solto sobre outro, vai para o vão livre mais próximo; se não há espaço, volta ao ponto de origem. Arquivos sobrepostos por um widget são empurrados para o espaço livre mais próximo, e um arquivo solto sobre um widget também.
- Com uma janela aberta, os widgets perdem cor, como a opção "Esmaecer widgets na mesa" do macOS.
- Botões da janela: vermelho fecha; amarelo minimiza para o Dock com o efeito de escala (uma miniatura da janela fica no Dock; clicar nela restaura); verde entra em tela cheia, esconde o Dock e a barra de título (que reaparece ao encostar o ponteiro no topo; Esc sai); Option-clique no verde dá zoom, preenchendo a mesa e mantendo o Dock. O duplo clique na barra de título também dá zoom. Os símbolos aparecem ao passar o ponteiro sobre os três botões; janela inativa fica com botões cinza. Cores e símbolos vêm de observação do visual do macOS, não de medida da Apple. O efeito genie e o menu de ladrilhos ao passar sobre o verde não foram reproduzidos.
- No celular o botão verde fica desativado e não há menu de contexto.
