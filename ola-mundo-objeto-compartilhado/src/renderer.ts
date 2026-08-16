declare global {
  interface Window {
    apiObjetoCompartilhado: {
      obterMinhaVariavel: () => Promise<string>
    }
  }
}

// O original usava document.write, incompatível com módulos ES, e lia o valor de
// forma síncrona pelo remote. Agora a leitura é uma promessa, então o parágrafo
// é criado quando a resposta do processo principal chega.
window.apiObjetoCompartilhado.obterMinhaVariavel().then((minhaVariavel) => {
  const paragrafo = document.createElement('p')
  paragrafo.textContent = 'minhaVariavel: ' + minhaVariavel
  document.body.appendChild(paragrafo)
})

export {}
