# Página HTML - Painel de Controle PCM

## Descrição
Página responsiva, estática e somente leitura para consulta centralizada de equipamentos, laudos e contratos com seus vencimentos.

## Características Principais

### ✅ Funcionalidades
- Tabelas organizadas por tipo (equipamentos, laudos)
- Cards de resumo com estatísticas em tempo real
- Status visual para vencimentos (vencido, próximo, seguro)
- Filtros por tipo e status
- Design responsivo (mobile, tablet, desktop)
- Atualização de dados via JavaScript

### 🎨 Design
- Cores corporativas Microsoft (azul #002060)
- Gradientes profissionais
- Ícones visuais para melhor UX
- Animações suaves
- Temas de cores por status (vermelho: vencido, amarelo: próximo, verde: seguro)

### 📱 Responsividade
- Funciona em telas pequenas, médias e grandes
- Tabelas scrolláveis em mobile
- Layout adaptativo

---

## Estrutura de Dados

### Formato JSON Esperado
Quando integrado com Power Automate, os dados devem estar no seguinte formato:

```json
{
  "equipamentos": [
    {
      "descricao": "Analisador de Qualidade de Energia",
      "fabricante": "FLUKE",
      "patrimonio": "16409",
      "empresa": "Data Center Centro",
      "data_inic": "2024-01-15",
      "data_venc": "2026-08-15"
    }
  ],
  "laudos": [
    {
      "descricao": "AVCB - Auto de Vistoria",
      "fabricante": "CB-SP",
      "patrimonio": "AVCB-2026-001",
      "empresa": "Data Center Centro",
      "data_inic": "2024-06-01",
      "data_venc": "2026-06-01"
    }
  ]
}
```

### Colunas
| Campo | Descrição | Formato |
|-------|-----------|---------|
| `descricao` | Nome do item | Texto |
| `fabricante` | Marca/fornecedor | Texto |
| `patrimonio` | ID único | Texto |
| `empresa` | Área/site responsável | Texto |
| `data_inic` | Data de início/calibração | YYYY-MM-DD |
| `data_venc` | Data de vencimento | YYYY-MM-DD |

---

## Como Usar

### Opção 1: Dados Estáticos (Teste)
A página já vem com dados de exemplo no array `mockData`. Para testar:
1. Abra o arquivo no navegador
2. Os dados de exemplo carregarão automaticamente

### Opção 2: Integração com Power Automate
1. Configure uma ação no Power Automate para gerar arquivo JSON
2. Hospedar o JSON em SharePoint/OneDrive
3. Modificar o script JavaScript para chamar a API:

```javascript
// Substituir função init() por:
async function init() {
    try {
        const response = await fetch('{URL_JSON_API}');
        const data = await response.json();
        renderTable(data.equipamentos, 'equipamentosBody');
        renderTable(data.laudos, 'laudosBody');
        updateSummary(data.equipamentos, data.laudos);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}
```

### Opção 3: Publicar em SharePoint
1. Salve o arquivo HTML
2. Faça upload para uma biblioteca do SharePoint
3. Configure as permissões como "Somente Leitura"
4. Compartilhe o link com o time PCM

---

## Componentes Visuais

### Cards de Resumo
- **Vencidos (❌)**: Itens com data_venc < hoje (background vermelho)
- **Próximos (🔔)**: 0 a 30 dias (background amarelo)
- **Seguros (✓)**: > 30 dias (background verde)
- **Total**: Soma de equipamentos + laudos

### Badges de Status
```
❌ Vencido       → Vermelho (#FF6B6B)
⏳ X dias         → Amarelo (#FFC000)
✓ Seguro         → Verde (#70AD47)
```

### Filtros
- **Por Tipo**: Equipamentos / Laudos / Todos
- **Por Status**: Vencido / Próximo / Seguro / Todos

---

## Customização

### Alterar Cores
Procure por `:root` no CSS e modifique as variáveis:
```css
:root {
    --primary-color: #002060;        /* Azul principal */
    --accent-color: #4472C4;          /* Azul secundário */
    --success-color: #70AD47;         /* Verde */
    --warning-color: #FFC000;         /* Amarelo */
    --danger-color: #FF6B6B;          /* Vermelho */
}
```

### Alterar Logotipo
Localize o `<h1>` no header e modifique:
```html
<h1>📋 Sistema PCM - Controle de Vencimentos</h1>
```

### Adicionar Novas Colunas
1. Adicione `<th>` na tabela
2. Adicione campo correspondente no template das linhas

### Recarregar Automático
Descomente a última linha do `<script>`:
```javascript
setInterval(init, 300000); // Recarrega a cada 5 minutos
```

---

## Performance e Segurança

### ✅ Performance
- Página totalmente estática (sem servidor)
- Carregamento rápido
- Sem processamento pesado

### ✅ Segurança
- Somente leitura (sem edição)
- Sem acesso a dados sensíveis via código
- Pode ser hospedado em SharePoint com controle de permissões

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Dados não aparecem | Verifique se o formato JSON está correto |
| Tabelas vazias | Confirme que `mockData` está preenchido ou JSON está acessível |
| Filtros não funcionam | Implemente lógica em `filterData()` |
| Estilo quebrado | Limpe cache do navegador (Ctrl+Shift+Del) |
| Responsividade ruim | Teste com DevTools (F12) em diferentes resoluções |

---

## Próximas Melhorias

- ⏳ Gráficos e dashboards (Chart.js)
- ⏳ Exportação para PDF/Excel
- ⏳ Integração com Power BI
- ⏳ Notificações push
- ⏳ Modo escuro
- ⏳ Multi-idioma
