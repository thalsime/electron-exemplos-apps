[Português (Brasil)](README.md) | **English**

# Electron Sample Apps

> **Work in progress.** This repository is being translated into Brazilian Portuguese, updated to
> the latest Electron and converted to TypeScript, so it can be used as teaching material. Until
> that work is finished, some samples remain in their original state, written in English and
> targeting older Electron versions.
>
> Original repository: [hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps).

This repository contains Electron sample apps that illustrate the usage of the
[Electron APIs](https://www.electronjs.org/docs/latest/api/app).

These sample apps were migrated from [nw-sample-apps](https://github.com/zcbenz/nw-sample-apps),
[chrome-app-samples](https://github.com/GoogleChrome/chrome-app-samples) and the
[Chrome extensions samples](https://github.com/GoogleChrome/chrome-extensions-samples).

In the original repository the samples were tested on Electron v1.6.11. In this fork, every sample
already converted is tested on Electron 43.

## How to run the samples

Electron and TypeScript are declared only once, at the repository root, and serve every sample.
There is no need to install anything globally, nor to install dependencies folder by folder.

1. Install the dependencies once, at the repository root:

   ```bash
   npm install
   ```

2. Enter the sample folder and run it:

   ```bash
   cd helloworld
   npm start
   ```

The `npm start` command compiles the sample's TypeScript and opens the application window.

> **Note:** always use `npm start`. Typing `electron .` directly in the terminal does not work,
> because the binary lives at the repository root and only `npm` finds it by walking up the folders.

To learn more about Electron application development, see the
[official documentation](https://www.electronjs.org/docs/latest). A good starting point is the
[process model](https://www.electronjs.org/docs/latest/tutorial/process-model), which explains the
split between the main process and the renderer process - the basis for understanding the samples.

## License

`electron-sample-apps` is published under the Apache v2 license. See the `LICENSE` file for details.
This fork preserves the license and the credits of the original project.

## Donation

Credit for this work belongs to the author of the original repository. If the project helped you
out, consider buying them a cup of coffee:

[![paypal](https://img.shields.io/badge/donate-paypal-brightgreen.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZVNVLSK6P6JRG)
