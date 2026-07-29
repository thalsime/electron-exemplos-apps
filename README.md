**Português (Brasil)** | [English](README.en.md)

# Exemplos de aplicativos Electron

> **Trabalho em andamento.** Este repositório está sendo traduzido para o português do Brasil,
> atualizado para o Electron mais recente e convertido para TypeScript, para servir de material
> didático. Enquanto o trabalho não termina, parte dos exemplos ainda está no estado original,
> em inglês e escrita para versões antigas do Electron.
>
> Repositório original: [hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps).

Este repositório reúne aplicativos de exemplo do Electron que ilustram o uso das
[APIs do Electron](https://www.electronjs.org/docs/latest/api/app).

Os exemplos foram migrados de [nw-sample-apps](https://github.com/zcbenz/nw-sample-apps),
[chrome-app-samples](https://github.com/GoogleChrome/chrome-app-samples) e dos
[exemplos de extensões do Chrome](https://github.com/GoogleChrome/chrome-extensions-samples).

No repositório original, os exemplos foram testados no Electron v1.6.11. Neste fork, cada exemplo
já convertido é testado no Electron 43.

## Como executar os exemplos

O Electron e o TypeScript são declarados uma única vez, na raiz do repositório, e atendem a todos
os exemplos. Não é preciso instalar nada globalmente nem instalar dependências pasta por pasta.

1. Instale as dependências uma vez, na raiz do repositório:

   ```bash
   npm install
   ```

2. Entre na pasta do exemplo e execute:

   ```bash
   cd helloworld
   npm start
   ```

O comando `npm start` compila o TypeScript do exemplo e abre a janela do aplicativo.

> **Atenção:** use sempre `npm start`. Digitar `electron .` direto no terminal não funciona, porque
> o binário está instalado na raiz do repositório e apenas o `npm` o localiza, subindo pelas pastas.

Para aprender mais sobre o desenvolvimento de aplicativos Electron, consulte a
[documentação oficial](https://www.electronjs.org/docs/latest). Vale começar pelo
[modelo de processos](https://www.electronjs.org/docs/latest/tutorial/process-model), que explica a
separação entre processo principal e processo renderizador - a base para entender os exemplos.

## Licença

O `electron-sample-apps` é publicado sob a licença Apache v2. Veja o arquivo `LICENSE` para os
detalhes. Este fork preserva a licença e os créditos do projeto original.

## Doação

Os créditos deste trabalho pertencem ao autor do repositório original. Se o projeto foi útil para
você, considere pagar um café para ele:

[![paypal](https://img.shields.io/badge/donate-paypal-brightgreen.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZVNVLSK6P6JRG)
