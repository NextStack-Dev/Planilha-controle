# Guia de Implementação - Fluxo Power Automate PCM

## Descrição Geral
Fluxo automatizado que:
1. Lê dados de equipamentos, laudos e contatos no Excel Online
2. Filtra itens com vencimento próximo (30 dias)
3. Envia email de alerta formatado em HTML para todos os contatos
4. Executa diariamente às 07:00 AM (horário de Brasília)

---

## Pré-requisitos
- ✅ Microsoft 365 com Power Automate
- ✅ OneDrive ou SharePoint com arquivo Excel configurado
- ✅ Licença de Office 365 Outlook
- ✅ Arquivo Excel com as abas: `equipamentos`, `laudos`, `contatos`

---

## Componentes do Fluxo

### 1. **Gatilho (Trigger)**
- **Tipo**: Recorrência (Recurrence)
- **Frequência**: Diária
- **Horário**: 07:00 AM (Hora de Brasília)
- **Fuso Horário**: E. South America Standard Time

### 2. **Leituras Paralelas (3 ações)**

#### 2.1 Listar_linhas_equipamentos
- Conecta ao Excel Online
- Tabela: `equipamentos`
- Colunas esperadas: descricao, fabricante, patrimonio, empresa, data_inic, data_venc

#### 2.2 Listar_linhas_laudos
- Conecta ao Excel Online
- Tabela: `laudos`
- Mesmo padrão de colunas da tabela equipamentos

#### 2.3 Listar_linhas_contatos
- Conecta ao Excel Online
- Tabela: `contatos`
- Colunas esperadas: nome, email, telefone

### 3. **Combinação e Filtro**

#### 3.1 Combinar_equipamentos_e_laudos
- Função: `union()` para mesclar as duas listas
- Resultado: lista única com todos os itens

#### 3.2 Filtrar_itens_com_vencimento_proximo
- Critério: `data_venc <= data_atual + 30 dias`
- Formato de data: ISO 8601 (YYYY-MM-DD)
- Expressão: `lessOrEquals(item()?['data_venc'], addDays(utcNow(), 30))`

### 4. **Verificação Condicional**
- **Condição**: Se existem itens filtrados
- **Ação**: Continuar apenas se há itens (evita spam)

### 5. **Formatação de Tabela HTML**
- Cria tabela com 6 colunas:
  1. Descrição
  2. Fabricante
  3. Patrimônio
  4. Empresa
  5. Data de Início (formatada: DD/MM/YYYY)
  6. Data de Vencimento (formatada: DD/MM/YYYY)

### 6. **Composição do Email**
- HTML estruturado com estilos
- Corpo principal com tabela de itens
- Botão de ação com link para o painel Excel/SharePoint
- Rodapé identificando o sistema

### 7. **Envio para Cada Contato**
- Loop: `Para cada contato` (For Each)
- Ação: Office 365 Outlook - Enviar Email V2
- Destinatário: dinâmico da tabela contatos
- Assunto: `[ALERTA] Equipamentos com Vencimento Próximo`
- Corpo: HTML formatado
- isHtml: true

---

## Variáveis Necessárias (Substitua)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{OneDrive_Location_Id}` | ID da localização OneDrive no Power Automate | `/sites/PCM` |
| `{Excel_Document_Id}` | ID do arquivo Excel | `/drives/xxx/items/yyy` |
| `{OneDrive_Excel_Link}` | URL pública/compartilhada do Excel | `https://onedrive.live.com/...` |

---

## Configuração Passo a Passo

### Passo 1: Importar Fluxo no Power Automate
1. Acesse [Power Automate](https://make.powerautomate.com)
2. Clique em "Meus fluxos"
3. Selecione "Importar" → "Importar pacote" ou crie manualmente
4. Cole o conteúdo do JSON ou configure manualmente cada ação

### Passo 2: Conectar ao Excel Online
1. Em "Listar_linhas_equipamentos", configure:
   - Localização (Location): seu OneDrive ou SharePoint
   - Documento (Document): o arquivo Excel
   - Tabela: `equipamentos`

2. Repita para `laudos` e `contatos`

### Passo 3: Configurar Conexão Outlook
1. Na ação "Enviar_email_para_contato"
2. Selecione a conta do Office 365 a ser usada para envios

### Passo 4: Ajustar Filtro (Opcional)
1. Na ação "Filtrar_itens_com_vencimento_proximo"
2. Para mudar de 30 dias: altere `addDays(utcNow(), 30)` → `addDays(utcNow(), 45)`

### Passo 5: Testar o Fluxo
1. Clique em "Testar" (Test)
2. Selecione "Gatilho manualmente"
3. Verifique:
   - ✅ Dados são lidos corretamente
   - ✅ Filtro funciona
   - ✅ Email é enviado com formatação correta

### Passo 6: Publicar
1. Clique em "Salvar" (Save)
2. Ative o fluxo (toggle "Ligado/Desligado")

---

## Tratamento de Erros

| Problema | Causa | Solução |
|----------|-------|--------|
| "Excel não encontrado" | ID do documento incorreto | Copie novamente do OneDrive/SharePoint |
| "Nenhum item retornado" | Tabelas vazias ou nomes errados | Verifique nomes das abas no Excel |
| "Email não enviado" | Falta de permissão Outlook | Configure conexão Office 365 corretamente |
| "Formato de data inválido" | Datas em formato não ISO | Edite o Excel para ISO 8601 (YYYY-MM-DD) |

---

## Logs e Monitoramento
- Histórico de execução: Power Automate → Fluxo → "Análise"
- Último executado: Verificar status em tempo real
- Diagnóstico: Expandir ações em caso de falha para ver detalhes

---

## Configurações Recomendadas
- **Frequência**: Manter diária (1x por dia)
- **Horário**: Ajustar conforme rotina do time PCM
- **Margem de dias**: 30 dias (padrão) ou 45 dias (cobertura de feriados/finais de semana)
- **Retry automático**: Ativado por padrão no Power Automate

---

## Próximas Melhorias (Future Scope)
- ⏳ Adicionar MS Teams notification como canal alternativo
- ⏳ Criar dashboard Power BI integrado
- ⏳ Implementar reporte PDF com histórico mensal
- ⏳ Notificação SMS para itens críticos
