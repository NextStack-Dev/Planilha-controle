// ========== CONFIGURAÇÃO ==========
// Agora apontando para os arquivos locais na pasta 'data'
const URL_EQUIPAMENTOS = 'data/equipamentos.json';
const URL_LAUDOS = 'data/laudos.json';

let equipamentosData = [];
let laudosData = [];
let activeTab = 'equipamentos';

// ========== FUNÇÕES AUXILIARES ==========
function getStatus(dataVenc) {
    if (!dataVenc) return { status: 'seguro', label: 'Sem data', class: 'badge seguro' };
    
    const hoje = new Date();
    const vencimento = new Date(dataVenc + 'T00:00:00');
    const diasRestantes = Math.floor((vencimento - hoje) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) return { status: 'vencido', label: '❌ Vencido', class: 'badge vencido' };
    if (diasRestantes <= 30) return { status: 'proximo', label: `⏳ ${diasRestantes} dias`, class: 'badge proximo' };
    return { status: 'seguro', label: '✓ Seguro', class: 'badge seguro' };
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR');
}

function getFilterValues() {
    const status = document.getElementById('statusFilter').value;
    const empresa = document.getElementById('empresaFilter').value;
    return { status, empresa };
}

// ========== FUNÇÕES PARA EMPRESAS ==========
function getUniqueEmpresas(data) {
    const empresas = data
        .map(item => item.empresa)
        .filter(emp => emp && emp.trim() !== '');
    return ['todas', ...new Set(empresas)];
}

function populateEmpresaFilter(empresas) {
    const select = document.getElementById('empresaFilter');
    const currentValue = select.value;
    select.innerHTML = '';
    
    empresas.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp;
        option.textContent = emp === 'todas' ? 'Todas' : emp;
        select.appendChild(option);
    });
    
    if (empresas.includes(currentValue)) {
        select.value = currentValue;
    }
}

// ========== RENDERIZAÇÃO ==========
// Função para renderizar Equipamentos (6 colunas - sem Data de Início)
function renderEquipamentos(data) {
    const tbody = document.getElementById('equipamentosBody');
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum registro encontrado</td></tr>';
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
                <td><strong>${formatDate(item.data_venc)}</strong></td>
                <td><span class="${statusInfo.class}">${statusInfo.label}</span></td>
            </tr>
        `;
    }).join('');
}

// Função para renderizar Laudos (4 colunas - limpo, com Empresa)
function renderLaudos(data) {
    const tbody = document.getElementById('laudosBody');
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum registro encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => {
        const statusInfo = getStatus(item.data_venc);
        return `
            <tr>
                <td><strong>${item.descricao || '-'}</strong></td>
                <td>${item.empresa || '-'}</td>
                <td>${formatDate(item.data_venc)}</td>
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

// ========== CONTROLE DE VISIBILIDADE (Tabela + Cabeçalho) ==========
function updateTableVisibility() {
    const sectionTitle = document.getElementById('sectionTitle');
    const theadEquip = document.getElementById('thead-equipamentos');
    const theadLaudos = document.getElementById('thead-laudos');
    const equipBody = document.getElementById('equipamentosBody');
    const laudosBody = document.getElementById('laudosBody');

    if (activeTab === 'equipamentos') {
        sectionTitle.innerHTML = '🏭 Equipamentos';
        theadEquip.style.display = '';
        theadLaudos.style.display = 'none';
        equipBody.style.display = '';
        laudosBody.style.display = 'none';
    } else if (activeTab === 'laudos') {
        sectionTitle.innerHTML = '📄 Laudos e Certificados';
        theadEquip.style.display = 'none';
        theadLaudos.style.display = '';
        equipBody.style.display = 'none';
        laudosBody.style.display = '';
    }
}

// ========== FILTROS ==========
function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.switch-label').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tab);
    });

    // Atualiza opções do select de empresa
    if (tab === 'equipamentos') {
        const empresas = getUniqueEmpresas(equipamentosData);
        populateEmpresaFilter(empresas);
    } else if (tab === 'laudos') {
        const empresas = getUniqueEmpresas(laudosData);
        populateEmpresaFilter(empresas);
    }

    updateTableVisibility();
    applyFilters();
}

function applyFilters() {
    const { status, empresa } = getFilterValues();

    let equipFiltrados = [];
    let laudosFiltrados = [];

    // Filtra equipamentos
    if (activeTab === 'equipamentos') {
        equipFiltrados = equipamentosData.filter(item => {
            const s = getStatus(item.data_venc).status;
            const e = empresa === 'todas' || item.empresa === empresa;
            return (status === 'todos' || s === status) && e;
        });
        renderEquipamentos(equipFiltrados);
    }

    // Filtra laudos
    if (activeTab === 'laudos') {
        laudosFiltrados = laudosData.filter(item => {
            const s = getStatus(item.data_venc).status;
            const e = empresa === 'todas' || item.empresa === empresa;
            return (status === 'todos' || s === status) && e;
        });
        renderLaudos(laudosFiltrados);
    }
}

// ========== CARREGAR DADOS ==========
async function carregarDados() {
    try {
        document.getElementById('equipamentosBody').innerHTML = '<tr><td colspan="6" class="loading">🔄 Carregando equipamentos...</td></tr>';
        document.getElementById('laudosBody').innerHTML = '<tr><td colspan="4" class="loading">🔄 Carregando laudos...</td></tr>';

        const [respEquip, respLaudos] = await Promise.all([
            fetch(URL_EQUIPAMENTOS),
            fetch(URL_LAUDOS)
        ]);

        if (!respEquip.ok) throw new Error('Arquivo equipamentos.json não encontrado na pasta data/');
        if (!respLaudos.ok) throw new Error('Arquivo laudos.json não encontrado na pasta data/');

        equipamentosData = await respEquip.json();
        laudosData = await respLaudos.json();

        if (!Array.isArray(equipamentosData)) equipamentosData = [];
        if (!Array.isArray(laudosData)) laudosData = [];

        updateSummary(equipamentosData, laudosData);
        updateLastUpdate();
        updateTableVisibility();
        
        // Popula o select de empresas (inicialmente com equipamentos)
        const empresas = getUniqueEmpresas(equipamentosData);
        populateEmpresaFilter(empresas);
        
        applyFilters();

        document.getElementById('status-indicator').textContent = '● Online';
        document.getElementById('status-indicator').style.color = '#70AD47';

    } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
        document.getElementById('equipamentosBody').innerHTML = `<tr><td colspan="6" class="empty-state">❌ Erro: ${error.message}</td></tr>`;
        document.getElementById('laudosBody').innerHTML = `<tr><td colspan="4" class="empty-state">❌ Erro: ${error.message}</td></tr>`;
        document.getElementById('status-indicator').textContent = '● Offline';
        document.getElementById('status-indicator').style.color = '#FF6B6B';
    }
}

// ========== EVENTOS ==========
document.getElementById('statusFilter').addEventListener('change', applyFilters);
document.getElementById('empresaFilter').addEventListener('change', applyFilters);
document.getElementById('refreshBtn').addEventListener('click', carregarDados);

document.querySelectorAll('.switch-label').forEach(el => {
    el.addEventListener('click', () => switchTab(el.dataset.tab));
});

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', carregarDados);