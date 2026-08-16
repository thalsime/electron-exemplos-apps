import './main.css';
// O modelo 3D é buscado por requisição em tempo de execução pelo JSONLoader. O
// import com ?url entrega a URL que o Vite gera, tanto no servidor de
// desenvolvimento quanto no build, no lugar do caminho fixo do original.
//
// A extensão mudou de .js para .json, que é o que o conteúdo sempre foi: com .js
// o servidor de desenvolvimento aplicava a transformação de JavaScript ao arquivo
// e o JSON chegava corrompido ao parser.
import modeloUrl from './html5rocks.json?url';

// 3D code partially grabbed from http://dev.opera.com/articles/view/porting-3d-graphics-to-the-web-webgl-intro-part-2/

document.addEventListener('DOMContentLoaded', function () {
  if (!Detector.webgl) Detector.addGetWebGLMessage();

  const LARGURA_DA_TELA = window.innerWidth;
  const ALTURA_DA_TELA = window.innerHeight;

  let recipiente: HTMLDivElement;
  let camera: THREE.PerspectiveCamera;
  let cena: THREE.Scene;
  let renderizadorWebGL: THREE.WebGLRenderer;
  let malha: THREE.Mesh | null = null;

  let mouseX = 0, mouseY = 0;
  let movimentoX = 0, movimentoY = 0;

  const metadeDaJanelaX = window.innerWidth / 2;
  const metadeDaJanelaY = window.innerHeight / 2;

  document.addEventListener('mousedown', aoPressionarMouse, false);
  document.addEventListener('mouseup', aoSoltarMouse, false);
  document.addEventListener('mousemove', aoMoverMouse, false);
  // O evento mousewheel e a propriedade wheelDelta foram substituídos pelo evento
  // wheel padronizado, cujo deltaY tem o sinal invertido em relação ao antigo.
  document.addEventListener('wheel', aoGirarRoda, false);

  const elementoFechar = iniciarBotaoFechar();

  iniciar();
  animar();

  // As oito funções abaixo declaram o retorno, embora todas devolvam `void` e o
  // compilador já soubesse disso. O ganho é de leitura: `iniciarBotaoFechar` devolve um
  // elemento, e num arquivo em que tudo o mais é efeito colateral, a única função com
  // valor de retorno precisa se distinguir das outras à primeira vista.
  function iniciar(): void {
    recipiente = document.createElement('div');
    document.body.appendChild(recipiente);

    // câmera
    camera = new THREE.PerspectiveCamera(75, LARGURA_DA_TELA / ALTURA_DA_TELA, 1, 100000);
    camera.position.z = 75;

    // cena
    cena = new THREE.Scene();

    // luz ambiente
    const luzAmbiente = new THREE.AmbientLight(0xffffff);
    cena.add(luzAmbiente);

    // luz direcional
    const luzDirecional = new THREE.DirectionalLight(0xffeedd);
    luzDirecional.position.set(0, -70, 100).normalize();
    cena.add(luzDirecional);

    // renderizador
    renderizadorWebGL = new THREE.WebGLRenderer();
    renderizadorWebGL.setSize(LARGURA_DA_TELA, ALTURA_DA_TELA);
    renderizadorWebGL.domElement.style.position = 'relative';
    recipiente.appendChild(renderizadorWebGL.domElement);

    // carrega o modelo em texto
    const carregadorJSON = new THREE.JSONLoader();
    carregadorJSON.load(modeloUrl, function (geometria) { criarCena(geometria) });
  }

  function iniciarBotaoFechar(): Element | null {
    const elementoFechar = document.querySelector('.fechar');
    if (elementoFechar) {
      elementoFechar.addEventListener('click', function () {
        window.close();
      });
    }
    return elementoFechar;
  }

  function criarCena(geometria: unknown): void {
    malha = new THREE.Mesh(geometria, new THREE.MeshFaceMaterial());
    malha.position.set(-10, -10, 0);
    malha.scale.set(1, 1, 1);
    cena.add(malha);
  }

  function aoPressionarMouse(evento: MouseEvent): void {
    // o clique precisa continuar chegando ao botão de fechar
    if (evento.target === elementoFechar) return;

    // Os prefixos de fornecedor do requestPointerLock deixaram de ser necessários.
    document.body.requestPointerLock();
  }

  function aoSoltarMouse(): void {
    document.exitPointerLock();
  }

  function aoGirarRoda(evento: WheelEvent): void {
    camera.position.z += evento.deltaY / 120 * 3;
  }

  function aoMoverMouse(evento: MouseEvent): void {
    mouseX = (evento.clientX - metadeDaJanelaX);
    mouseY = (evento.clientY - metadeDaJanelaY);
    if (document.pointerLockElement) {
      movimentoX += evento.movementX || 0;
      movimentoY += evento.movementY || 0;
    }
  }

  function animar(): void {
    requestAnimationFrame(animar);
    renderizar();
  }

  function renderizar(): void {
    if (malha) {
      malha.rotation.set(-(mouseY + movimentoY) / metadeDaJanelaY + 0,
                         -(mouseX + movimentoX) / metadeDaJanelaX, 0);
    }
    renderizadorWebGL.render(cena, camera);
  }
});
