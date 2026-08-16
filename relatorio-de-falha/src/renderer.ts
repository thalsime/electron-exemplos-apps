// Quem descreve `window.crashReportApi` é o src/ponte.d.ts, o mesmo arquivo contra o
// qual o preload se confere. A página não precisa nem importar `RelatorioDeFalha`: o
// tipo de cada item de `relatorios` vem do contrato, por inferência.

// Monta a tabela dos relatórios já enviados ao coletor. A lista chega pronta do
// processo principal: aqui não há acesso a nenhuma API do Electron.
async function montarTabela(): Promise<void> {
  const destino = document.getElementById('relatorios');
  if (!destino) return;

  const relatorios = await window.crashReportApi.listarRelatorios();

  if (relatorios.length === 0) {
    destino.textContent =
      'Nenhum relatório enviado ainda. Clique em Provocar falha e reabra o aplicativo.';
    return;
  }

  const tabela = document.createElement('table');
  tabela.border = '1';

  const cabecalho = tabela.insertRow();
  cabecalho.insertCell().innerHTML = '<b>Data de envio</b>';
  cabecalho.insertCell().innerHTML = '<b>ID</b>';

  for (const relatorio of relatorios) {
    const linha = tabela.insertRow();
    linha.insertCell().textContent = relatorio.data;
    linha.insertCell().textContent = relatorio.id;
  }

  destino.replaceChildren(tabela);
}

window.addEventListener('DOMContentLoaded', () => {
  void montarTabela();

  document.getElementById('provocar-falha')?.addEventListener('click', () => {
    window.crashReportApi.provocarFalha();
  });
});
