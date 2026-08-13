# Guia de Configuração - Template Excel PCM

## 📋 Visão Geral

Este guia explica como criar o arquivo Excel `PCM_Controle_Vencimentos.xlsx` usando os templates fornecidos.

---

## Opção 1: Importar CSVs Diretos no Excel (Recomendado)

### Passo 1: Criar Novo Workbook
1. Abra Excel
2. Crie um novo arquivo em branco
3. Salve como `PCM_Controle_Vencimentos.xlsx` no OneDrive ou SharePoint

### Passo 2: Criar Aba "Equipamentos"
1. Renomeie a primeira aba para `equipamentos`
2. Menu: `Dados` → `De Arquivo de Texto`
3. Selecione `equipamentos-template.csv`
4. Configurar importação:
   - Delimitador: Vírgula (,)
   - Encoding: UTF-8
5. Clique em `Carregar`

### Passo 3: Formatar como Tabela
1. Selecione todos os dados (incluindo cabeçalho)
2. Menu: `Inserir` → `Tabela` ou Atalho: `Ctrl+L`
3. Na caixa de diálogo, configure:
   - ✅ Minha tabela tem cabeçalhos: SIM
   - Nome: `equipamentos`
4. Clique em OK

### Passo 4: Validar Formato de Datas
1. Selecione a coluna `data_inic`
2. Menu: `Página Inicial` → `Formato de Número` → `Data`
3. Escolha formato: `YYYY-MM-DD`
4. Repita para coluna `data_venc`

### Passo 5: Criar Aba "Laudos"
1. Clique em `+` para adicionar nova aba
2. Renomeie para `laudos`
3. Repita Passos 2-4 com arquivo `laudos-template.csv`

### Passo 6: Criar Aba "Contatos"
1. Clique em `+` para adicionar nova aba
2. Renomeie para `contatos`
3. Repita Passos 2-4 com arquivo `contatos-template.csv`

### Passo 7: Salvar e Sincronizar
1. Salve o arquivo: `Ctrl+S`
2. Aguarde sincronização com OneDrive/SharePoint (icone sincronização)
3. ✅ Arquivo pronto para usar!

---

## Opção 2: Cópia Manual (Alternativa)

### Se você não conseguir importar via CSV:

1. Abra `equipamentos-template.csv` com Excel
2. Selecione e copie os dados
3. Crie uma nova aba `equipamentos` no workbook principal
4. Cole os dados
5. Formate como tabela (ver Passo 3 acima)
6. Repita para `laudos` e `contatos`

---

## Estrutura Final do Arquivo

```
PCM_Controle_Vencimentos.xlsx
│
├── aba: equipamentos
│   ├─ descricao
│   ├─ fabricante
│   ├─ patrimonio
│   ├─ empresa
│   ├─ data_inic (formato: YYYY-MM-DD)
│   └─ data_venc (formato: YYYY-MM-DD)
│   └─ [5 linhas de dados de exemplo]
│
├── aba: laudos
│   ├─ descricao
│   ├─ fabricante
│   ├─ patrimonio
│   ├─ empresa
│   ├─ data_inic (formato: YYYY-MM-DD)
│   └─ data_venc (formato: YYYY-MM-DD)
│   └─ [5 linhas de dados de exemplo]
│
└── aba: contatos
    ├─ nome
    ├─ email
    ├─ telefone
    └─ [5 linhas de dados de exemplo]
```

---

## ✅ Checklist de Validação

Antes de usar com Power Automate, valide:

- [ ] Arquivo está em OneDrive ou SharePoint
- [ ] Arquivo é nomeado: `PCM_Controle_Vencimentos.xlsx`
- [ ] 3 abas existem: `equipamentos`, `laudos`, `contatos`
- [ ] Todas as abas estão formatadas como **Tabelas Nomeadas**
- [ ] Nomes das tabelas correspondem aos nomes das abas
- [ ] Colunas estão nomeadas corretamente (sem espaços)
- [ ] Datas estão em formato ISO 8601 (YYYY-MM-DD)
- [ ] Emails estão validados (formato correto)
- [ ] Pelo menos 1 item em cada tabela existe
- [ ] Arquivo está salvo e sincronizado

---

## Estrutura de Dados Detalhada

### Tabela: EQUIPAMENTOS

| Campo | Tipo | Obrigatório | Exemplo | Observação |
|-------|------|------------|---------|-----------|
| descricao | Texto | Sim | "Analisador de Qualidade" | Máximo 200 caracteres |
| fabricante | Texto | Sim | "FLUKE" | Máximo 100 caracteres |
| patrimonio | Texto | Sim (PK) | "16409" | Deve ser único |
| empresa | Texto | Sim | "Data Center" | Máximo 100 caracteres |
| data_inic | Data | Sim | "2024-01-15" | Formato ISO |
| data_venc | Data | Sim | "2026-08-15" | Formato ISO |

### Tabela: LAUDOS

Mesma estrutura da tabela EQUIPAMENTOS

| Campo | Tipo | Obrigatório | Exemplo |
|-------|------|------------|---------|
| descricao | Texto | Sim | "AVCB" |
| fabricante | Texto | Sim | "CB-SP" |
| patrimonio | Texto | Sim (PK) | "AVCB-001" |
| empresa | Texto | Sim | "Segurança" |
| data_inic | Data | Sim | "2024-06-01" |
| data_venc | Data | Sim | "2026-06-01" |

### Tabela: CONTATOS

| Campo | Tipo | Obrigatório | Exemplo | Observação |
|-------|------|------------|---------|-----------|
| nome | Texto | Sim | "João Silva" | Máximo 100 caracteres |
| email | Email | Sim (PK) | "joao@empresa.com" | Deve ser válido |
| telefone | Texto | Não | "(11) 98765-4321" | Para referência apenas |

---

## Dados de Exemplo Fornecidos

### Equipamentos Inclusos
1. Analisador de Qualidade de Energia (FLUKE)
2. Termovisora Infravermelha (FLIR)
3. Multímetro Digital (HIKOKI)
4. Manômetro Digital (WIKA)
5. Osciloscópio Digital (TEKTRONIX)

### Laudos Inclusos
1. AVCB - Auto de Vistoria
2. Certificado de Linhas de Vida
3. Laudo de Inspeção Elétrica
4. Certificado Manutenção HVAC
5. Relatório ISO 27001

### Contatos Inclusos
1. João Silva (joao.silva@empresa.com)
2. Maria Santos (maria.santos@empresa.com)
3. Pedro Oliveira (pedro.oliveira@empresa.com)
4. Ana Costa (ana.costa@empresa.com)
5. Carlos Ferreira (carlos.ferreira@empresa.com)

---

## Adicionar Novos Registros

### Após importar os dados de exemplo:

1. **Para equipamentos**:
   - Posicione cursor na última linha
   - Pressione `Ctrl+Enter` ou clique em nova linha
   - Preencha os dados
   - Datas: use formato YYYY-MM-DD

2. **Para laudos**:
   - Mesmo procedimento da tabela equipamentos

3. **Para contatos**:
   - Mesmo procedimento, mas email é obrigatório

### ⚠️ Importante:
- **Não** delete o cabeçalho (primeira linha)
- **Não** adicione colunas sem atualizar Power Automate
- **Sempre** use formato de data ISO 8601 (YYYY-MM-DD)
- Valide emails antes de adicionar novos contatos

---

## Editar Dados Existentes

1. Abra o arquivo em Excel
2. Clique na célula a editar
3. Altere o valor
4. Pressione `Enter`
5. Aguarde sincronização no OneDrive/SharePoint
6. Próxima execução do fluxo usará dados atualizados

---

## Excluir Registros

1. Clique no número da linha (seletor de linha)
2. Menu: `Página Inicial` → `Deletar` → `Deletar Linhas de Tabela`
3. Confirme
4. Dados serão removidos na próxima execução do fluxo

---

## Troubleshooting

### Problema: "Tabela não reconhecida por Power Automate"
**Solução**: 
1. Verifique se tabela está formatada corretamente
2. Verifique nome exato (sem espaços)
3. Tente renomear a tabela via Menu: `Fórmulas` → `Gerenciador de Nomes`

### Problema: "Formato de data inválido"
**Solução**: 
1. Selecione coluna data
2. Menu: `Página Inicial` → `Formato de Número`
3. Procure por formato personalizado
4. Digite: `YYYY-MM-DD`

### Problema: "Arquivo não sincroniza"
**Solução**: 
1. Verifique conexão internet
2. Confirme que arquivo está em OneDrive/SharePoint
3. Feche e reabra o arquivo

### Problema: "Power Automate não consegue ler dados"
**Solução**: 
1. Volte ao Power Automate
2. Clique em "Testar manualmente"
3. Verifique mensagem de erro
4. Recarregue conexão Excel

---

## Performance

### Dicas para manter performance:

1. **Não armazene mais de 10.000 linhas** (limite Excel Online)
2. **Archive dados antigos** anualmente
3. **Use filtros** ao trabalhar com muitos registros
4. **Não adicione colunas desnecessárias**

---

## Backup e Recuperação

### Backup Automático
- OneDrive/SharePoint mantém histórico de versões
- Clique em arquivo → "Histórico de versão"
- Restaure versão anterior se necessário

### Backup Manual
- Download periódico do arquivo
- Armazene em local seguro
- Recomendado: Mensal

---

## Integração com Power Automate

Após criar o arquivo Excel com os templates:

1. Acesse https://make.powerautomate.com
2. Crie novo fluxo agendado
3. Conecte ao Excel Online
4. Selecione documento: `PCM_Controle_Vencimentos.xlsx`
5. Selecione tabelas: `equipamentos`, `laudos`, `contatos`
6. Configure como descrito em `DOCUMENTACAO-TECNICA-COMPLETA.md`

---

## Suporte

- **Dúvidas sobre Excel**: https://support.microsoft.com/pt-br/excel
- **Dúvidas sobre OneDrive**: https://support.microsoft.com/pt-br/onedrive
- **Dúvidas sobre formato de data**: Consulte `DOCUMENTACAO-TECNICA-COMPLETA.md`

**Arquivo template criado em**: 2026-08-12
**Última atualização**: 2026-08-12
