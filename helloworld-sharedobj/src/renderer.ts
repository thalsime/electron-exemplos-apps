declare global {
  interface Window {
    sharedObjApi: {
      getMyvar: () => Promise<string>
    }
  }
}

// O original usava document.write, incompatível com módulos ES, e lia o valor de
// forma síncrona pelo remote. Agora a leitura é uma promessa, então o parágrafo
// é criado quando a resposta do processo principal chega.
window.sharedObjApi.getMyvar().then((myvar) => {
  const paragraph = document.createElement('p')
  paragraph.textContent = 'myvar: ' + myvar
  document.body.appendChild(paragraph)
})

export {}
