// ========== CONFIGURAÇÃO ==========
// ATENÇÃO: Substitua pelas URLs reais dos JSONs no OneDrive
const URL_EQUIPAMENTOS = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://nextstreambr-my.sharepoint.com/:u:/g/personal/cbezerra_engemon_nextstream_com/IQCVDe8aVGa0TIkWQRc2Mn4CAUJhhnczegHMu4ExGrmLdpo?download=1');
const URL_LAUDOS = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://nextstreambr-my.sharepoint.com/:u:/g/personal/cbezerra_engemon_nextstream_com/IQDa5vG4PgAvQ5YTYD2fB4cPAR6WPvI8eYHainVa8reMDqY?download=1');

let equipamentosData = [];
let laudosData = [];
let activeTab = 'equipamentos';

// ========== FUNÇÕES AUXILIARES ==========
function getStatus(dataVenc) {
    const hoje = new Date();
    const vencimento = new Date(dataVenc + 'T00:00:00');
    const diasRestantes = Math.floor((vencimento - hoje) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) return { status: 'vencido', label: '❌ Vencido', class: 'badge vencido' };
    if (diasRestantes <= 30) return { status: 'proximo', label: `⏳ ${diasRestantes} dias`, class: 'badge proximo' };
    return { status: 'seguro', label: '✓ Seguro', class: 'badge seguro' };
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function getFilterValues() {
    const status = document.getElementById('statusFilter').value;
    return { status };
}

// ========== RENDERIZAÇÃO ==========
function renderTable(data, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum registro encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => {
        const statusInfo = getStatus(item.data_venc);
        return `
            <tr>
                <td>${item.descricao || '-'}</td>
                <td>${item.fabricante || '-'}</td>
                <td>${item.patrimonio || '-'}</td>
                <td>${item.empresa || '-'}</td>
                <td>${formatDate(item.data_inic)}</td>
                <td><strong>${formatDate(item.data_venc)}</strong></td>
                <td><span class="${statusInfo.class}">${statusInfo.label}</span></td>
            </tr>
        `;
    }).join('');
}

function updateSummary(equipamentos, laudos) {
    const todos = [...equipamentos, ...laudos];
    let vencidos = 0, proximos = 0, seguros = 0;

    todos.forEach(item => {
        const statusInfo = getStatus(item.data_venc);
        if (statusInfo.status === 'vencido') vencidos++;
        else if (statusInfo.status === 'proximo') proximos++;
        else seguros++;
    });

    document.getElementById('totalVencidos').textContent = vencidos;
    document.getElementById('totalProximos').textContent = proximos;
    document.getElementById('totalSeguros').textContent = seguros;
    document.getElementById('totalItens').textContent = todos.length;
}

function updateLastUpdate() {
    const now = new Date().toLocaleString('pt-BR');
    document.getElementById('last-update').textContent = `Última atualização: ${now}`;
}

// ========== FILTROS ==========
function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.switch-label').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tab);
    });
    applyFilters();
}

function applyFilters() {
    const { status } = getFilterValues();

    let equipFiltrados = [];
    let laudosFiltrados = [];

    // Filtra equipamentos
    if (activeTab === 'equipamentos' || activeTab === 'todos') {
        equipFiltrados = equipamentosData.filter(item => {
            const s = getStatus(item.data_venc).status;
            return status === 'todos' || s === status;
        });
    }

    // Filtra laudos
    if (activeTab === 'laudos' || activeTab === 'todos') {
        laudosFiltrados = laudosData.filter(item => {
            const s = getStatus(item.data_venc).status;
            return status === 'todos' || s === status;
        });
    }

    renderTable(equipFiltrados, 'equipamentosBody');
    renderTable(laudosFiltrados, 'laudosBody');
}

// ========== CARREGAR DADOS ==========
async function carregarDados() {
    try {
        document.getElementById('equipamentosBody').innerHTML = '<tr><td colspan="7" class="loading">🔄 Carregando equipamentos...</td></tr>';
        document.getElementById('laudosBody').innerHTML = '<tr><td colspan="7" class="loading">🔄 Carregando laudos...</td></tr>';

        const [respEquip, respLaudos] = await Promise.all([
            fetch(URL_EQUIPAMENTOS),
            fetch(URL_LAUDOS)
        ]);

        if (!respEquip.ok || !respLaudos.ok) {
            throw new Error('Erro ao carregar dados. Verifique as URLs.');
        }

        equipamentosData = await respEquip.json();
        laudosData = await respLaudos.json();

        if (!Array.isArray(equipamentosData)) equipamentosData = [];
        if (!Array.isArray(laudosData)) laudosData = [];

        updateSummary(equipamentosData, laudosData);
        updateLastUpdate();
        applyFilters();

        document.getElementById('status-indicator').textContent = '● Online';
        document.getElementById('status-indicator').style.color = '#70AD47';

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        document.getElementById('equipamentosBody').innerHTML = `<tr><td colspan="7" class="empty-state">❌ Erro: ${error.message}</td></tr>`;
        document.getElementById('laudosBody').innerHTML = `<tr><td colspan="7" class="empty-state">❌ Erro: ${error.message}</td></tr>`;
        document.getElementById('status-indicator').textContent = '● Offline';
        document.getElementById('status-indicator').style.color = '#FF6B6B';
    }
}

// ========== EVENTOS ==========
document.getElementById('statusFilter').addEventListener('change', applyFilters);
document.getElementById('refreshBtn').addEventListener('click', carregarDados);

document.querySelectorAll('.switch-label').forEach(el => {
    el.addEventListener('click', () => switchTab(el.dataset.tab));
});

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', carregarDados);