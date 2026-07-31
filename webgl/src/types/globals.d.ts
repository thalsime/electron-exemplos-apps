// Declarações mínimas para as duas bibliotecas de 2012 que este exemplo congela.
// Elas são carregadas por tag <script> a partir de public/, e não por import: o
// three.js r50 declara `var THREE` e o Detector.js faz atribuição implícita, duas
// formas que só produzem variável global em script clássico, nunca em módulo ES.
// A r50 também não existe no npm - o pacote começou a ser publicado na r54.

declare const Detector: {
  webgl: boolean
  addGetWebGLMessage(): void
}

declare namespace THREE {
  class PerspectiveCamera {
    constructor(fov: number, aspect: number, near: number, far: number)
    position: { x: number; y: number; z: number }
  }

  class Scene {
    add(objeto: unknown): void
  }

  class AmbientLight {
    constructor(cor: number)
  }

  class DirectionalLight {
    constructor(cor: number)
    position: {
      set(x: number, y: number, z: number): { normalize(): void }
    }
  }

  class WebGLRenderer {
    domElement: HTMLCanvasElement
    setSize(largura: number, altura: number): void
    render(cena: Scene, camera: PerspectiveCamera): void
  }

  class JSONLoader {
    load(url: string, aoCarregar: (geometria: unknown) => void): void
  }

  class MeshFaceMaterial {}

  class Mesh {
    constructor(geometria: unknown, material: unknown)
    position: { set(x: number, y: number, z: number): void }
    scale: { set(x: number, y: number, z: number): void }
    rotation: { set(x: number, y: number, z: number): void }
  }
}
