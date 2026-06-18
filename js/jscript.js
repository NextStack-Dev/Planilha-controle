const URL_PLANILHA = "https://corsproxy.io/?https://nextstreambr-my.sharepoint.com/personal/cbezerra_engemon_nextstream_com/_layouts/15/download.aspx?UniqueId=a2194094%2D0671%2D4949%2Db0cc%2De765ddfecc38";

async function carregarCalibracoes() {
  try {
    console.log("Buscando dados...");
    
    // Mudança importante: usamos 'mode: cors' ou buscamos como blob se necessário
    const resposta = await fetch(URL_PLANILHA);
    
    if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);

    const textoCsv = await resposta.text();
    const dados = csvParaObjeto(textoCsv);
    renderizarTabela(dados);
    
  } catch (erro) {
    console.error("Erro no carregamento:", erro);
    // Caso o erro de CORS persista, o site ficará sem dados.
  }
}

function csvParaObjeto(textoCsv) {
  // 1. Remove o caractere invisível BOM que o Excel costuma colocar no início do arquivo
  const csvLimpo = textoCsv.replace(/^\uFEFF/, "");
  
  const linhas = csvLimpo.split("\n");
  
  // 2. Mudado de "," para ";" porque o Excel/SharePoint nacional usa ponto e vírgula
  const cabecalhos = linhas[0].split(";");
  
  return linhas.slice(1).map(linha => {
    if (!linha.trim()) return null; // Ignora linhas vazias no final do arquivo
    
    // 3. Mudado de "," para ";" também na separação dos valores da linha
    const valores = linha.split(";");
    let obj = {};
    
    cabecalhos.forEach((cabecalho, index) => {
      // Remove espaços, quebras de linha (\r) e aspas ocultas dos cabeçalhos
      const chave = cabecalho.trim().replace(/\r/g, "").replace(/^"|"$/g, "");
      let valor = valores[index] ? valores[index].trim().replace(/\r/g, "") : "";
      
      // Limpa aspas geradas devido a espaços invisíveis
      valor = valor.replace(/^"|"$/g, "").trim();
      
      obj[chave] = valor;
    });
    return obj;
  }).filter(item => item !== null); // Remove os registros nulos das linhas vazias
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