const URL_PLANILHA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSHTak9N02eId9tWmRzBb33gzKpCnQC6r_9dJNgYJfI_rH4h-AdSM7jwklWqKOXY1XAfON1EfKpBzYQ/pub?gid=0&single=true&output=csv";

async function carregarCalibracoes() {
  try {
    const resposta = await fetch(URL_PLANILHA);
    const textoCsv = await resposta.text();
    const dados = csvParaObjeto(textoCsv);
    renderizarTabela(dados);
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}

function csvParaObjeto(textoCsv) {
  // CORREÇÃO: Remove os \r para evitar quebras invisíveis antes do split
  const limpo = textoCsv.replace(/\r/g, "");
  const linhas = limpo.split("\n");
  const cabecalhos = linhas[0].split(",");
  
  return linhas.slice(1).map(linha => {
    if (!linha.trim()) return null; // Ignora linhas vazias
    const valores = linha.split(",");
    let obj = {};
    
    cabecalhos.forEach((cabecalho, index) => {
      const chave = cabecalho.trim().replace(/^"|"$/g, "");
      let valor = valores[index] ? valores[index].trim().replace(/^"|"$/g, "") : "";
      
      obj[chave] = valor;
    });
    return obj;
  }).filter(item => item !== null);
}

function renderizarTabela(equipamentos) {
  const tabela = document.querySelector(".main-table");
  if (!tabela) return;
  
  tabela.innerHTML = ''; // Limpa a tabela antes de renderizar
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  equipamentos.forEach(equip => {
    // Validação usando as chaves exatas da primeira linha da sua planilha
    if (!equip.Descricao || !equip.Vencimento) return;

    // Trata formato de data DD/MM/AAAA
    const partesData = equip.Vencimento.split("/");
    if (partesData.length !== 3) return;
    const dataVenc = new Date(partesData[2], partesData[1] - 1, partesData[0]);
    dataVenc.setHours(0, 0, 0, 0);

    const diferencaTempo = dataVenc.getTime() - hoje.getTime();
    const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

    let classeStatus = "em-dia";
    let iconeAlerta = "";

    if (diferencaDias < 0) {
      classeStatus = "vencido";
      iconeAlerta = '<span class="alerta-icone">⚠️</span>';
    } else if (diferencaDias <= 30) {
      classeStatus = "no-mes";
      iconeAlerta = '<span class="alerta-icone">⏳</span>';
    }

    const novaLinha = document.createElement("div");
    novaLinha.className = `row ${classeStatus}`;

    novaLinha.innerHTML = `
      <div class="col">${iconeAlerta} ${equip.Descricao}</div>
      <div class="col">${equip.Modelo || "-"}</div>
      <div class="col">${equip.Empresa || "-"}</div>
      <div class="col">${equip.Vencimento}</div>
    `;

    tabela.appendChild(novaLinha);
  });
}

document.addEventListener("DOMContentLoaded", carregarCalibracoes);