import type { MensagemRecebida } from './main'

// O contrato da ponte fica num arquivo só dele: o preload implementa, a página consome,
// e é contra esta mesma descrição que o compilador confere os dois. Aqui isso rende o
// dobro, porque as DUAS janelas carregam este mesmo contrato.
//
// Nenhuma das duas operações devolve promessa: `enviar` usa `send`, que não espera
// resposta, e `aoReceber` só registra um ouvinte. É o desenho de quem conversa por
// recado, e não por pergunta.
export interface ApiJanelas {
  enviar: (texto: string) => void
  aoReceber: (ouvinte: (mensagem: MensagemRecebida) => void) => void
}

declare global {
  interface Window {
    apiJanelas: ApiJanelas
  }
}
