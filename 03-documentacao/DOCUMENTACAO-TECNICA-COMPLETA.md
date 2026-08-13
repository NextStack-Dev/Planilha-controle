# Documentação Técnica Completa - Sistema PCM

## 📌 Índice
1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Arquitetura Técnica](#arquitetura-técnica)
4. [Implementação Passo a Passo](#implementação-passo-a-passo)
5. [Configuração do Excel](#configuração-do-excel)
6. [Configuração do Power Automate](#configuração-do-power-automate)
7. [Implantação da Página HTML](#implantação-da-página-html)
8. [Testes e Validação](#testes-e-validação)
9. [Troubleshooting](#troubleshooting)
10. [Manutenção](#manutenção)

---

## Visão Geral

O **Sistema PCM de Controle de Vencimentos** é uma solução 100% nativa do Microsoft 365 que automatiza o monitoramento de equipamentos, laudos e contratos, evitando vencimentos operacionais não controlados.

### Fluxo Técnico
```
Excel (OneDrive/SharePoint)
    ↓ [Conector Excel Online]
Power Automate (Fluxo agendado)
    ↓ [Processamento e Filtro]
Outlook (Email de alerta)
    ↓ 
HTML Painel (Consulta somente leitura)
```

### Tecnologias Utilizadas
- **Plataforma**: Microsoft 365
- **Banco de Dados**: Excel Online (OneDrive/SharePoint)
- **Processamento**: Power Automate
- **Notificação**: Office 365 Outlook
- **Interface**: HTML5 + CSS3 + JavaScript
- **Hospedagem**: SharePoint Online ou OneDrive

---

## Pré-requisitos

### Licenças Microsoft 365
- ✅ Microsoft 365 Business Standard ou superior
- ✅ Power Automate (incluído na licença)
- ✅ Office 365 (Outlook)
- ✅ OneDrive ou SharePoint Online

### Conhecimentos Necessários
- Conceitos básicos de Excel Online
- Navegação em Power Automate
- HTML/CSS básico (para customização da página)
- Noções de formato de data ISO 8601

### Acesso Necessário
- ✅ Acesso ao Power Automate (https://make.powerautomate.com)
- ✅ Acesso ao OneDrive/SharePoint
- ✅ Permissões de edição no Excel
- ✅ Acesso ao Outlook

---

## Arquitetura Técnica

### Componentes do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                       CAMADA DE DADOS                           │
│                     (OneDrive/SharePoint)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Equipamentos │  │   Laudos     │  │  Contatos    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ↑ ↓
                    Conector Excel Online
                            ↑ ↓
┌─────────────────────────────────────────────────────────────────┐
│                 CAMADA DE PROCESSAMENTO                          │
│                   (Power Automate)                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Gatilho Recorrência (Diário 07:00)                   │   │
│  │ 2. Leitura de Tabelas                                   │   │
│  │ 3. Combinação de Dados                                  │   │
│  │ 4. Filtro: data_venc ≤ hoje + 30 dias                  │   │
│  │ 5. Verificação Condicional                              │   │
│  │ 6. Formatação HTML                                      │   │
│  │ 7. Loop: Para cada contato                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                  Office 365 Outlook
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                 CAMADA DE NOTIFICAÇÃO                            │
│                      (Email HTML)                               │
│  Destinatários: Lista dinâmica de contatos                      │
│  Assunto: [ALERTA] Equipamentos com Vencimento Próximo          │
│  Corpo: Tabela formatada + Botão de ação                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                CAMADA DE CONSULTA (INTERFACE)                    │
│                   (HTML Responsivo)                             │
│  URL: {SharePoint/OneDrive}/painel-controle-pcm.html            │
│  Tipo: Somente Leitura                                          │
│  Dados: Carregados via JSON (Power Automate ou estático)        │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
Diariamente às 07:00 AM:
├── Power Automate lê Excel
├── Filtra itens com vencimento próximo
├── Monta tabela HTML
├── Envia email para cada contato
└── Usuário pode acessar painel HTML para consulta detalhada
```

---

## Implementação Passo a Passo

### FASE 1: Preparação do Excel

#### Passo 1.1: Criar/Organizar Arquivo Excel
1. Acesse OneDrive ou SharePoint
2. Crie um novo arquivo Excel: `PCM_Controle_Vencimentos.xlsx`
3. Crie 3 abas com os nomes exatos:
   - `equipamentos`
   - `laudos`
   - `contatos`

#### Passo 1.2: Estruturar a Aba "equipamentos"
```
| descricao | fabricante | patrimonio | empresa | data_inic | data_venc |
|-----------|-----------|-----------|---------|-----------|-----------|
| Analisador de Qualidade... | FLUKE | 16409 | Data Center | 2024-01-15 | 2026-08-15 |
```

**Tipos de Dados:**
- `descricao`: Texto (máx 200 caracteres)
- `fabricante`: Texto (máx 100 caracteres)
- `patrimonio`: Texto (máx 50 caracteres)
- `empresa`: Texto (máx 100 caracteres)
- `data_inic`: Data (formato: YYYY-MM-DD)
- `data_venc`: Data (formato: YYYY-MM-DD)

#### Passo 1.3: Estruturar a Aba "laudos"
Mesma estrutura de "equipamentos" (descricao, fabricante, patrimonio, empresa, data_inic, data_venc)

#### Passo 1.4: Estruturar a Aba "contatos"
```
| nome | email | telefone |
|------|-------|----------|
| João Silva | joao@empresa.com | (11) 98765-4321 |
| Maria Santos | maria@empresa.com | (11) 98765-4322 |
```

**Tipos de Dados:**
- `nome`: Texto (máx 100 caracteres)
- `email`: Texto (formato válido de email)
- `telefone`: Texto (opcional)

#### Passo 1.5: Formatar como Tabelas Nomeadas
1. Selecione os dados da aba `equipamentos`
2. Menu: `Inserir` → `Tabela` ou `Formatar como Tabela`
3. Configure o intervalo e nomeie a tabela como `equipamentos`
4. Repita para `laudos` e `contatos`

**Por que?** Power Automate funciona melhor com tabelas nomeadas, facilitando referências

#### Passo 1.6: Validar Datas
- Todas as datas devem estar em formato ISO 8601 (YYYY-MM-DD)
- Se Excel mostrar como `15/08/2026`, exporte como CSV e reimporte em ISO

---

### FASE 2: Configurar Power Automate

#### Passo 2.1: Acessar Power Automate
1. Acesse https://make.powerautomate.com
2. Faça login com sua conta Microsoft 365

#### Passo 2.2: Criar Novo Fluxo
1. Clique em "Meus fluxos"
2. Clique em "Novo fluxo"
3. Selecione "Fluxo em nuvem agendado"
4. Configure:
   - **Nome**: "PCM - Alerta Automático de Vencimentos"
   - **Frequência**: Dia
   - **Intervalo**: 1
   - **Hora**: 07:00 (7 da manhã)
   - **Fuso**: (UTC-03:00) Brasília

#### Passo 2.3: Adicionar Ação - Listar Linhas (Equipamentos)
1. Clique em "Próxima etapa"
2. Procure por "Excel Online" → "Listar linhas presentes em uma tabela"
3. Configure:
   - **Localização**: Selecione OneDrive ou SharePoint
   - **Documento**: Selecione `PCM_Controle_Vencimentos.xlsx`
   - **Tabela**: `equipamentos`

#### Passo 2.4: Adicionar Ação - Listar Linhas (Laudos)
Repita o Passo 2.3 mas com tabela `laudos`

#### Passo 2.5: Adicionar Ação - Listar Linhas (Contatos)
Repita o Passo 2.3 mas com tabela `contatos`

#### Passo 2.6: Combinar Listas
1. Clique em "Adicionar ação" → "Compor"
2. No campo "Entradas", insira expressão:
```
union(body('Listar_linhas_equipamentos')?['value'], body('Listar_linhas_laudos')?['value'])
```

#### Passo 2.7: Filtrar Itens com Vencimento Próximo
1. Clique em "Adicionar ação" → "Filtrar matriz"
2. Configure:
   - **De**: Saída da ação Compor anterior
   - **Filtro**: 
     - Campo: `data_venc`
     - Condição: é menor que ou igual a
     - Valor: `addDays(utcNow(), 30, 'yyyy-MM-dd')`

#### Passo 2.8: Verificação Condicional
1. Clique em "Adicionar ação" → "Condição"
2. Configure:
   - **Escolha um valor**: `length(body('Filtrar_matriz'))`
   - **Condição**: é maior que
   - **Valor**: `0`

#### Passo 2.9: Criar Tabela HTML
Dentro da condição (Se sim):
1. Clique em "Adicionar ação" → "Criar tabela HTML"
2. Configure:
   - **De**: Saída do filtro
   - **Colunas**: 
     - Descrição
     - Fabricante
     - Patrimônio
     - Empresa
     - Data de Início
     - Data de Vencimento

#### Passo 2.10: Compor Corpo Email
1. Clique em "Adicionar ação" → "Compor"
2. No campo "Entradas", cole o HTML (ver arquivo: fluxo-pcm-alerta-vencimentos.json)

#### Passo 2.11: Loop - Para cada contato
1. Clique em "Adicionar ação" → "Para cada"
2. Configure:
   - **Selecionar saída das etapas anteriores**: `value` de Listar linhas contatos

#### Passo 2.12: Enviar Email
Dentro do loop:
1. Clique em "Adicionar ação" → "Office 365 Outlook" → "Enviar um email (V2)"
2. Configure:
   - **Para**: `items('Para_cada_contato')?['email']`
   - **Assunto**: `[ALERTA] Equipamentos com Vencimento Próximo`
   - **Corpo**: Saída da ação Compor
   - **É HTML**: Sim

#### Passo 2.13: Testar Fluxo
1. Clique em "Testar" (Test)
2. Selecione "Gatilho manualmente"
3. Verifique:
   - ✅ Dados são lidos
   - ✅ Filtro funciona
   - ✅ Email é enviado

#### Passo 2.14: Publicar Fluxo
1. Clique em "Salvar"
2. Ative o toggle "Ligado/Desligado" para ativar o fluxo agendado

---

### FASE 3: Implantação da Página HTML

#### Passo 3.1: Preparar Arquivo HTML
1. Edite o arquivo `painel-controle-pcm.html`
2. Substitua dados de exemplo pelos reais (quando necessário)

#### Passo 3.2: Publicar em SharePoint
1. Acesse seu site SharePoint
2. Crie uma biblioteca ou use biblioteca existente
3. Faça upload do arquivo HTML
4. Clique com botão direito → "Propriedades"
5. Anote a URL pública

#### Passo 3.3: Compartilhar com Time
1. Clique em "Compartilhar"
2. Conceda acesso de "Visualização" aos usuários PCM
3. Copie o link compartilhado

#### Passo 3.4: Adicionar Link ao Email (Opcional)
1. Volte ao Power Automate
2. Na ação "Compor", atualize a URL do botão:
```html
<a href="https://seu-sharepoint/sites/PCM/painel-controle-pcm.html" class="button">
  Abrir Painel de Controle
</a>
```

---

## Configuração do Excel

### Estrutura Completa do Workbook

```
PCM_Controle_Vencimentos.xlsx
├── equipamentos (Tabela nomeada)
│   ├── descricao (Texto)
│   ├── fabricante (Texto)
│   ├── patrimonio (Texto)
│   ├── empresa (Texto)
│   ├── data_inic (Data)
│   └── data_venc (Data)
├── laudos (Tabela nomeada)
│   ├── descricao (Texto)
│   ├── fabricante (Texto)
│   ├── patrimonio (Texto)
│   ├── empresa (Texto)
│   ├── data_inic (Data)
│   └── data_venc (Data)
└── contatos (Tabela nomeada)
    ├── nome (Texto)
    ├── email (Email)
    └── telefone (Texto, opcional)
```

### Validação de Dados

#### Validar Datas
```
Formato Aceito: YYYY-MM-DD
Exemplo: 2026-08-15
Timezone: UTC (Power Automate converte para fuso local)
```

#### Validar Emails
```
Formato Aceito: usuario@dominio.com
Exemplo: joao.silva@empresa.com
Power Automate rejeita emails inválidos
```

---

## Configuração do Power Automate

### Variáveis Chave

| Variável | Padrão | Ajustável |
|----------|--------|-----------|
| Frequência | Diariamente | Sim |
| Horário | 07:00 | Sim |
| Margem de dias | 30 | Sim (altere `addDays`) |
| Tabela Equipamentos | `equipamentos` | Sim |
| Tabela Laudos | `laudos` | Sim |
| Tabela Contatos | `contatos` | Sim |

### Expressões Importantes

#### Filtro de Vencimento
```
lessOrEquals(
  item()?['data_venc'], 
  addDays(utcNow(), 30, 'yyyy-MM-dd')
)
```

#### Formatação de Data
```
formatDateTime(item()?['data_venc'], 'dd/MM/yyyy')
```

#### Verificação de Items
```
length(body('Filtrar_matriz')) > 0
```

---

## Implantação da Página HTML

### Opções de Hospedagem

#### Opção 1: SharePoint Online
- ✅ Integrado com Microsoft 365
- ✅ Controle de permissões
- ✅ Fácil atualização
- ⚠️ Requer acesso SharePoint

#### Opção 2: OneDrive
- ✅ Acesso direto para usuários
- ✅ Fácil compartilhamento
- ⚠️ Menos segurança

#### Opção 3: HTML Estático + JSON
- ✅ Máxima portabilidade
- ✅ Sem dependências
- ⚠️ Requer JSON separado

### Customização da Página

#### Alterar Logo/Título
Localize a tag `<h1>` e modifique:
```html
<h1>🏢 Meu Logo - Controle de Vencimentos</h1>
```

#### Alterar Cores
Modifique `:root` no CSS:
```css
:root {
    --primary-color: #002060;  /* Azul corporativo */
    --accent-color: #4472C4;   /* Azul secundário */
}
```

#### Adicionar Links Personalizados
No footer ou no botão de ação, atualize URLs:
```html
<a href="https://seu-url.com">Abrir Dashboard</a>
```

---

## Testes e Validação

### Teste 1: Validação de Dados Excel
- [ ] Verificar se todas as tabelas foram criadas
- [ ] Confirmar nomes exatos das tabelas
- [ ] Validar formato de datas (ISO 8601)
- [ ] Testar com dados de exemplo

### Teste 2: Execução Manual do Fluxo
- [ ] Abrir Power Automate
- [ ] Clicar em "Testar" → "Gatilho manualmente"
- [ ] Verificar se leitura de dados funciona
- [ ] Confirmar filtro correto
- [ ] Validar formatação do email

### Teste 3: Envio de Email
- [ ] Verificar se email foi recebido
- [ ] Validar formatação da tabela HTML
- [ ] Testar links e botões
- [ ] Confirmar destinatários corretos

### Teste 4: Visualização da Página HTML
- [ ] Abrir página no navegador
- [ ] Validar responsividade (mobile, tablet, desktop)
- [ ] Testar filtros (se implementados)
- [ ] Verificar exibição de dados

### Teste 5: Agendamento
- [ ] Validar que fluxo está ativo
- [ ] Monitorar histórico de execuções
- [ ] Confirmar execução diária

---

## Troubleshooting

### Problema: "Tabela não encontrada"
**Causa**: Nome da tabela digitado incorretamente
**Solução**: 
1. Abra o Excel
2. Clique em "Fórmulas" → "Gerenciador de Nomes"
3. Copie o nome exato da tabela
4. Cole no Power Automate

### Problema: "Nenhum item retornado"
**Causa**: Dados não foram lidos corretamente
**Solução**:
1. Verifique se Excel está atualizado
2. Confirme que tabelas têm dados
3. Teste leitura manualmente no Power Automate

### Problema: "Formato de data inválido"
**Causa**: Datas não estão em ISO 8601
**Solução**:
1. Edite coluna data_venc no Excel
2. Formate como "Data" → "YYYY-MM-DD"
3. Salve e reimporte no Power Automate

### Problema: "Email não foi enviado"
**Causa**: Falta de permissão ou email inválido
**Solução**:
1. Verifique endereço de email na tabela contatos
2. Confirme permissões Outlook
3. Teste envio manual

### Problema: "Página HTML branca/vazia"
**Causa**: Erro de carregamento de dados
**Solução**:
1. Abra console (F12)
2. Verifique se há erros
3. Confirme dados de exemplo em `mockData`

---

## Manutenção

### Diárias
- ✅ Verificar se emails de alerta foram enviados
- ✅ Monitorar histórico do fluxo

### Semanais
- ✅ Atualizar planilha Excel com novos itens
- ✅ Verificar status de vencimentos

### Mensais
- ✅ Revisar relatório de vencimentos
- ✅ Atualizar lista de contatos se necessário
- ✅ Validar formatação de dados

### Semestrais
- ✅ Revisar arquitetura
- ✅ Atualizar margem de dias (se necessário)
- ✅ Fazer backup de dados

### Anuais
- ✅ Revisar conformidade com auditorias ISO
- ✅ Atualizar documentação
- ✅ Treinar novo pessoal PCM

---

## Checklist de Implementação Final

- [ ] Excel criado e estruturado com dados
- [ ] Todas as 3 tabelas nomeadas corretamente
- [ ] Dados de exemplo inseridos (mínimo 5 itens)
- [ ] Power Automate configurado e testado
- [ ] Fluxo executado manualmente com sucesso
- [ ] Emails enviados e recebidos
- [ ] Página HTML hospedada
- [ ] Link compartilhado com time PCM
- [ ] Fluxo agendado ativado
- [ ] Documentação entregue
- [ ] Treinamento realizado

---

## Contatos de Suporte

Para dúvidas ou problemas técnicos:
- **Power Automate**: https://support.microsoft.com/pt-br/power-automate
- **Excel Online**: https://support.microsoft.com/pt-br/office
- **Outlook**: https://support.microsoft.com/pt-br/outlook

**Documento de Referência**: Consulte `GUIA-IMPLEMENTACAO-FLUXO.md` e `REFERENCIA-PAINEL.md`
