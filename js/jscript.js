const URL_PLANILHA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS4Fh2OPqHI7zzbS568XAmdOAvLIrUhWSZHLumwUD_s4SKCv9fDcSQWBLnZPub-XRvt_fEe6MxdC7c9/pub?gid=0&single=true&output=csv";

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
  const linhas = textoCsv.split("\n");
  const cabecalhos = linhas[0].split(",");
  
  return linhas.slice(1).map(linha => {
    const valores = linha.split(",");
    let obj = {};
    cabecalhos.forEach((cabecalho, index) => {
      // Remove espaços e aspas ocultas dos cabeçalhos
      const chave = cabecalho.trim().replace(/\r/g, "").replace(/^"|"$/g, "");
      let valor = valores[index] ? valores[index].trim().replace(/\r/g, "") : "";
      
      // Limpa aspas geradas pelo Sheets devido a espaços invisíveis
      valor = valor.replace(/^"|"$/g, "").trim();
      
      obj[chave] = valor;
    });
    return obj;
  });
}

function renderizarTabela(equipamentos) {
  const tabela = document.querySelector(".main-table");
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

    // Monta as 4 colunas injetando os dados limpos das aspas
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