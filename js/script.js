const dados = [
    { descricao: "Teste e Integridade EPC", vencimento: "2026-07" },
    { descricao: "AVCB", vencimento: "2026-11" },
    { descricao: "Portabilidade de Água", vencimento: "2025-10" },
    { descricao: "Limpesa Caixa H<sub>2</sub>O Potável", vencimento: "2026-06" },
    { descricao: "Bombas de Combate", vencimento: "2025-12"},
    { descricao: "Extintores", vencimento: "2025-02"},
    { descricao: "Laudo Fumaça Preta", vencimento: "2026-06"},
    { descricao: "Estanqueidade Tanques", vencimento: "2026-09"},
    { descricao: "SPDA", vencimento: "2026-10"},
    { descricao: "RIA - Elevadores", vencimento: "2026-09"},
    { descricao: "Teste Mangueira Hidrante", vencimento: "2025-07"},
    { descricao: "Laudo Linha de Vida", vencimento: "2026-07"},
    { descricao: "Prontuário Instalações NR10", vencimento: "2025-03"},
    { descricao: "Análise do AR", vencimento: "2026-01"}
];

const table = document.querySelector('.main-table');
const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function renderizarTabela() {
    // Limpa o conteúdo anterior (exceto o header)
    while (table.children.length > 1) {
        table.removeChild(table.lastChild);
    }

    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    dados.forEach(item => {
        // Validação do formato da data
        if (!item.vencimento || !item.vencimento.includes('-')) {
            console.warn(`Formato de data inválido para: ${item.descricao}`);
            return;
        }

        const [anoStr, mesStr] = item.vencimento.split('-');
        const anoVenc = parseInt(anoStr);
        const mesVenc = parseInt(mesStr);

        // Validação dos números
        if (isNaN(anoVenc) || isNaN(mesVenc) || mesVenc < 1 || mesVenc > 12) {
            console.warn(`Data inválida para: ${item.descricao}`, item.vencimento);
            return;
        }

        // Determina status
        let classeStatus = "em-dia";
        let iconeAlerta = "";

        if (anoVenc < anoAtual || (anoVenc === anoAtual && mesVenc < mesAtual)) {
            classeStatus = "vencido";
            iconeAlerta = '<span class="alerta-icone">⚠️</span>';
        } else if (anoVenc === anoAtual && mesVenc === mesAtual) {
            classeStatus = "no-mes";
        }

        // Formata a data
        const dataFormatada = `${meses[mesVenc - 1]} - ${anoStr.slice(-2)}`;

        // Cria a linha
        const row = document.createElement('div');
        row.className = `row ${classeStatus}`;
        
        row.innerHTML = `
            <div class="col">${iconeAlerta}${item.descricao}</div>
            <div class="col">${dataFormatada}</div>
        `;

        table.appendChild(row);
    });
}

// Ordenar dados por vencimento (opcional)
function ordenarPorVencimento() {
    return dados.sort((a, b) => {
        const [anoA, mesA] = a.vencimento.split('-').map(Number);
        const [anoB, mesB] = b.vencimento.split('-').map(Number);
        
        if (anoA !== anoB) return anoA - anoB;
        return mesA - mesB;
    });
}

// Opcional: ordenar antes de renderizar
// dados = ordenarPorVencimento();

// Renderiza a tabela inicialmente
renderizarTabela();

// Atualiza automaticamente a cada hora (3600000ms)
setInterval(renderizarTabela, 3600000); // 1 hora

// Também pode verificar a cada dia à meia-noite
function verificarMeiaNoite() {
    const agora = new Date();
    if (agora.getHours() === 0 && agora.getMinutes() === 0) {
        renderizarTabela();
    }
}

setInterval(verificarMeiaNoite, 60000); // Verifica a cada minuto se é meia-noite