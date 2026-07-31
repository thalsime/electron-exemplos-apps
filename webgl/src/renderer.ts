import './main.css'
// O modelo 3D é buscado por requisição em tempo de execução pelo JSONLoader. O
// import com ?url entrega a URL que o Vite gera, tanto no servidor de
// desenvolvimento quanto no build, no lugar do caminho fixo do original.
//
// A extensão mudou de .js para .json, que é o que o conteúdo sempre foi: com .js
// o servidor de desenvolvimento aplicava a transformação de JavaScript ao arquivo
// e o JSON chegava corrompido ao parser.
import modeloUrl from './html5rocks.json?url'

// 3D code partially grabbed from http://dev.opera.com/articles/view/porting-3d-graphics-to-the-web-webgl-intro-part-2/

document.addEventListener('DOMContentLoaded', function () {
  if (!Detector.webgl) Detector.addGetWebGLMessage()

  const SCREEN_WIDTH = window.innerWidth
  const SCREEN_HEIGHT = window.innerHeight

  let container: HTMLDivElement
  let camera: THREE.PerspectiveCamera
  let scene: THREE.Scene
  let webglRenderer: THREE.WebGLRenderer
  let zmesh: THREE.Mesh | null = null

  let mouseX = 0, mouseY = 0
  let mousemoveX = 0, mousemoveY = 0

  const windowHalfX = window.innerWidth / 2
  const windowHalfY = window.innerHeight / 2

  document.addEventListener('mousedown', onDocumentMouseDown, false)
  document.addEventListener('mouseup', onDocumentMouseUp, false)
  document.addEventListener('mousemove', onDocumentMouseMove, false)
  // O evento mousewheel e a propriedade wheelDelta foram substituídos pelo evento
  // wheel padronizado, cujo deltaY tem o sinal invertido em relação ao antigo.
  document.addEventListener('wheel', onDocumentMouseWheel, false)

  const closeEl = initCloseBtn()

  init()
  animate()

  function init() {
    container = document.createElement('div')
    document.body.appendChild(container)

    // camera
    camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 100000)
    camera.position.z = 75

    //scene
    scene = new THREE.Scene()

    // lights
    const ambient = new THREE.AmbientLight(0xffffff)
    scene.add(ambient)

    // more lights
    const directionalLight = new THREE.DirectionalLight(0xffeedd)
    directionalLight.position.set(0, -70, 100).normalize()
    scene.add(directionalLight)

    // renderer
    webglRenderer = new THREE.WebGLRenderer()
    webglRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
    webglRenderer.domElement.style.position = 'relative'
    container.appendChild(webglRenderer.domElement)

    // load ascii model
    const jsonLoader = new THREE.JSONLoader()
    jsonLoader.load(modeloUrl, function (geometry) { createScene(geometry) })
  }

  function initCloseBtn(): Element | null {
    const closeEl = document.querySelector('.close')
    if (closeEl) {
      closeEl.addEventListener('click', function () {
        window.close()
      })
    }
    return closeEl
  }

  function createScene(geometry: unknown) {
    zmesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial())
    zmesh.position.set(-10, -10, 0)
    zmesh.scale.set(1, 1, 1)
    scene.add(zmesh)
  }

  function onDocumentMouseDown(event: MouseEvent) {
    if (event.target === closeEl) return // it should deliver click to close button

    // Os prefixos de fornecedor do requestPointerLock deixaram de ser necessários.
    document.body.requestPointerLock()
  }

  function onDocumentMouseUp() {
    document.exitPointerLock()
  }

  function onDocumentMouseWheel(event: WheelEvent) {
    camera.position.z += event.deltaY / 120 * 3
  }

  function onDocumentMouseMove(event: MouseEvent) {
    mouseX = (event.clientX - windowHalfX)
    mouseY = (event.clientY - windowHalfY)
    if (document.pointerLockElement) {
      mousemoveX += event.movementX || 0
      mousemoveY += event.movementY || 0
    }
  }

  function animate() {
    requestAnimationFrame(animate)
    render()
  }

  function render() {
    if (zmesh) {
      zmesh.rotation.set(-(mouseY + mousemoveY) / windowHalfY + 0,
                         -(mouseX + mousemoveX) / windowHalfX, 0)
    }
    webglRenderer.render(scene, camera)
  }
})
