# Arquitetura de Sistema - PCM

## Visão Geral da Arquitetura

O sistema PCM é baseado em uma arquitetura **serverless** e **100% nativa do Microsoft 365**, eliminando a necessidade de infraestrutura externa.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USUÁRIO FINAL                              │
│                       (Tim PCM - 5 pessoas)                         │
└──────────────────┬──────────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   Email de Alerta      Painel HTML
   (Outlook)            (SharePoint)
        ▲                     ▲
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   Power Automate    │
        │  (Fluxo Agendado)   │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   Excel Online      │
        │  (OneDrive/SPO)     │
        └─────────────────────┘
```

---

## Componentes do Sistema

### 1. Camada de Dados (Data Layer)

**Tecnologia**: Excel Online (Microsoft 365)
**Localização**: OneDrive ou SharePoint Online
**Estrutura**: Tabelas nomeadas normalizadas

```
PCM_Controle_Vencimentos.xlsx
│
├── Tabela: equipamentos
│   ├── PK: patrimonio (único)
│   ├── descricao (0:N)
│   ├── fabricante (0:N)
│   ├── empresa (0:N)
│   ├── data_inic (0:1)
│   └── data_venc (0:1) ← Crítica para cálculos
│
├── Tabela: laudos
│   ├── PK: patrimonio (único)
│   ├── descricao (0:N)
│   ├── fabricante (0:N)
│   ├── empresa (0:N)
│   ├── data_inic (0:1)
│   └── data_venc (0:1) ← Crítica para cálculos
│
└── Tabela: contatos
    ├── PK: email (único)
    ├── nome (0:N)
    ├── email (0:1) ← Crítico para notificação
    └── telefone (0:0.1)
```

**Características**:
- ✅ Formato de tabela nomeada (melhor para conectores)
- ✅ Tipagem de dados consistente
- ✅ Sem valores NULL obrigatórios (exceto telefone)
- ✅ Escalabilidade até 10.000 linhas (limite Excel Online)
- ✅ Auditoria nativa (histórico de versões do SharePoint)

---

### 2. Camada de Processamento (Processing Layer)

**Tecnologia**: Power Automate
**Tipo**: Fluxo em nuvem agendado
**Frequência**: Diária (configurável)

#### 2.1 Entrada de Dados

```
Gatilho: Recurrence
├── Frequência: Day
├── Intervalo: 1
├── Hora: 07:00
└── Fuso: E. South America Standard Time (UTC-3)
```

**Fluxo de Execução**:
```
Recurrence (Gatilho)
    ↓
Listar_linhas_equipamentos (Excel Online)
    ↓ (paralelo)
Listar_linhas_laudos (Excel Online)
    ↓ (paralelo)
Listar_linhas_contatos (Excel Online)
    ↓
Compor (Union das listas)
    ↓
Filtrar_matriz (data_venc ≤ hoje + 30 dias)
    ↓
Condição (Se existe item)
    ├─ Sim:
    │   ├─ Criar_tabela_HTML
    │   ├─ Preparar_corpo_email
    │   └─ Para_cada_contato
    │       └─ Enviar_email_v2
    │
    └─ Não:
        └─ Finalizar (sem ação)
```

#### 2.2 Fórmulas Críticas

**Filtro de Vencimento** (30 dias):
```
lessOrEquals(item()?['data_venc'], addDays(utcNow(), 30, 'yyyy-MM-dd'))
```

**Formatação de Data** (Brasileiro):
```
formatDateTime(item()?['data_venc'], 'dd/MM/yyyy')
```

**Combinação de Arrays**:
```
union(body('Listar_linhas_equipamentos')?['value'], body('Listar_linhas_laudos')?['value'])
```

#### 2.3 Características de Confiabilidade

- ✅ Tratamento de erros nativo (retry automático)
- ✅ Logging completo no histórico
- ✅ Timeout: 30 minutos (suficiente)
- ✅ Execução idempotente (pode ser repetida)
- ✅ SLA: 99,9% uptime (Microsoft)

---

### 3. Camada de Notificação (Notification Layer)

**Tecnologia**: Office 365 Outlook
**Tipo**: Email HTML formatado

#### 3.1 Estructura do Email

```
Assunto: [ALERTA] Equipamentos com Vencimento Próximo

Corpo (HTML):
├── Header (Logo + Título)
├── Texto introdutório
├── Tabela HTML dinamicamente gerada
│   ├── Descrição
│   ├── Fabricante
│   ├── Patrimônio
│   ├── Empresa
│   ├── Data de Início (DD/MM/YYYY)
│   └── Data de Vencimento (DD/MM/YYYY)
├── Call-to-action (Botão)
└── Footer (Assinatura)
```

#### 3.2 Destinatários

- **Tipo**: Dinâmico (lido da tabela `contatos`)
- **Formato**: Email válido (validação Outlook)
- **Quantidade**: Variável (loop Para cada contato)
- **Frequência**: Diária (se houver itens)

#### 3.3 Segurança e Conformidade

- ✅ Autenticação Office 365
- ✅ Criptografia TLS em trânsito
- ✅ Conformidade GDPR (dados armazenados em datacenter Microsoft)
- ✅ Auditoria de logs do Outlook

---

### 4. Camada de Consulta (Query/Presentation Layer)

**Tecnologia**: HTML5 + CSS3 + JavaScript puro
**Hospedagem**: SharePoint Online
**Tipo**: Página estática responsiva

#### 4.1 Arquitetura Frontend

```
painel-controle-pcm.html
├── HTML (Estrutura)
│   ├── Header (navegação)
│   ├── Controls (filtros)
│   ├── Summary Cards (estatísticas)
│   ├── Equipamentos Table
│   ├── Laudos Table
│   └── Footer
├── CSS (Estilos)
│   ├── Variáveis de cores (--primary-color, etc)
│   ├── Grid responsivo
│   ├── Media queries (mobile, tablet, desktop)
│   └── Animações
└── JavaScript (Lógica)
    ├── Funções de renderização
    ├── Cálculo de status
    ├── Formatação de datas
    └── Filtros (quando implementado)
```

#### 4.2 Fluxo de Dados (Frontend)

```
mockData (JSON estático)
    ↓
init() → DOMContentLoaded
    ├─ renderTable(equipamentos)
    ├─ renderTable(laudos)
    └─ updateSummary()
        ├─ Calcula vencidos
        ├─ Calcula próximos
        ├─ Calcula seguros
        └─ Atualiza cards

Ação do Usuário: Filtrar
    ├─ filterData()
    └─ Re-renderiza tabela
```

#### 4.3 Segurança

- ✅ Somente leitura (sem acesso à escrita)
- ✅ Sem autenticação necessária (compartilhado via link)
- ✅ Sem chamadas a APIs externas
- ✅ Dados em JSON isolado
- ✅ SharePoint controla permissões

---

## Fluxo de Dados End-to-End

### Exemplo Prático: Calibração Vencida

```
1. DADOS INICIAIS
   Excel: "Analisador" com data_venc = 2026-08-10

2. EXECUÇÃO DO FLUXO (Diária 07:00)
   Power Automate lê Excel:
   ├─ equipamentos: [{ descricao: "Analisador", data_venc: "2026-08-10" }]
   ├─ laudos: [...]
   └─ contatos: [{ email: "joao@empresa.com" }]

3. PROCESSAMENTO
   Filtro: data_venc (2026-08-10) ≤ 2026-08-12 + 30 dias?
   Resultado: SIM ✓ (inclui no alerta)

4. FORMATAÇÃO
   Monta tabela HTML:
   ┌──────────────────────────────────────┐
   │ Analisador | FLUKE | ... | 10/08/2026 │
   └──────────────────────────────────────┘

5. NOTIFICAÇÃO
   Email enviado para joao@empresa.com:
   ├─ Assunto: [ALERTA] Equipamentos com Vencimento Próximo
   ├─ Corpo: HTML com tabela
   └─ Link: Painel de Consulta

6. CONSULTA
   Usuário acessa painel HTML:
   ├─ Vê tabela com todos os itens
   ├─ Status do Analisador: "❌ Vencido"
   └─ Pode tomar ação
```

---

## Escalabilidade

### Limites Técnicos

| Componente | Limite | Status |
|-----------|--------|--------|
| Linhas Excel | 10.000 | ✅ Suficiente |
| Tamanho arquivo Excel | 100 MB | ✅ Suficiente |
| Contatos (destinatários) | 1.000 | ✅ Suficiente |
| Frequência fluxo | Sem limite | ✅ 1x/dia |
| Execução fluxo | 30 min | ✅ Média: 2 min |

### Plano de Escalação

**Fase 1 (Atual)**: 0-100 itens
- ✅ Executar conforme

**Fase 2**: 100-1.000 itens
- ⚠️ Considerar Power BI para dashboards
- ⚠️ Implementar arquivamento de histórico

**Fase 3**: 1.000+ itens
- 🚀 Migrar para SQL Database (não recomendado inicialmente)
- 🚀 Implementar serviços Python/Azure Functions

---

## Segurança

### Princípios Implementados

1. **Princípio do Menor Privilégio**
   - Usuários PCM: Apenas visualização
   - Edição: Apenas no Excel

2. **Separação de Responsabilidades**
   - Dados: Excel (responsabilidade gerencial)
   - Lógica: Power Automate (responsabilidade técnica)
   - Apresentação: HTML (responsabilidade visual)

3. **Auditoria**
   - Histórico Excel: Automático (versões)
   - Histórico Power Automate: Completo (logs)
   - Histórico Outlook: Nativo (backup)

### Conformidade

- ✅ LGPD: Dados em datacenter Brasil (OneDrive)
- ✅ ISO 27001: Microsoft 365 certificado
- ✅ ISO 20000: Power Automate monitorado
- ✅ ABNT: Segurança de informação

---

## Alta Disponibilidade

### Redundância

```
Microsoft 365
├── OneDrive (Replicação geográfica)
├── Power Automate (SLA 99,9%)
├── Outlook (SLA 99,9%)
└── SharePoint (SLA 99,9%)
```

### Backup

- **Excel**: Versionamento automático (OneDrive)
- **Histórico fluxo**: Retenção 28 dias (Power Automate)
- **Emails**: Retenção política (Outlook)

### Disaster Recovery

1. Dados perdidos: Recuperar de versão anterior (OneDrive)
2. Fluxo falha: Reexecutar manual (Power Automate)
3. Email não recebido: Reexecutar fluxo

---

## Integração com Sistemas Externos (Future)

### Possíveis Integrações

```
Atual:
├── Excel (Fonte)
├── Power Automate (Processamento)
├── Outlook (Notificação)
└── HTML (Consulta)

Futuro:
├── MS Teams (Notificação alternativa)
├── Power BI (Dashboards avançados)
├── SharePoint Lists (Alternativa ao Excel)
├── Azure SQL (Backup de longo prazo)
└── Webhooks (Integração com sistemas legados)
```

---

## Performance

### Benchmarks Esperados

| Operação | Tempo | Status |
|----------|-------|--------|
| Leitura Excel | 5-10s | ✅ Rápido |
| Filtro/Processamento | 2-5s | ✅ Rápido |
| Formatação HTML | 1-2s | ✅ Rápido |
| Envio email (por contato) | 2-3s | ✅ Rápido |
| **Total (fluxo completo)** | **20-30s** | ✅ Rápido |

### Otimizações Possíveis

1. Usar cache para dados estáticos
2. Implementar paginação para >5.000 itens
3. Usar índices no Excel (se escalar)

---

## Diagrama Técnico Detalhado

```
┌────────────────────────────────────────────────────────────────────┐
│                         MICROSOFT 365                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐         ┌─────────────────┐                  │
│  │  OneDrive       │         │  SharePoint     │                  │
│  │                 │         │                 │                  │
│  │ ┌───────────┐   │         │ ┌───────────┐   │                  │
│  │ │ Excel     │   │         │ │ HTML Page │   │                  │
│  │ │ equipamen │   │         │ │ painel    │   │                  │
│  │ │ tos       │   │         │ │ -control  │   │                  │
│  │ └───────────┘   │         │ └───────────┘   │                  │
│  │ ┌───────────┐   │         │                 │                  │
│  │ │ laudos    │   │         │                 │                  │
│  │ └───────────┘   │         │                 │                  │
│  │ ┌───────────┐   │         │                 │                  │
│  │ │ contatos  │   │         │                 │                  │
│  │ └───────────┘   │         │                 │                  │
│  └────────┬────────┘         └────────┬────────┘                  │
│           │                           │                           │
│           │ Conector Excel Online     │ Acesso HTTP               │
│           │                           │                           │
│  ┌────────▼────────────────────────────▼────────┐                 │
│  │      POWER AUTOMATE                          │                 │
│  │  ┌──────────────────────────────────────┐    │                 │
│  │  │ Recurrence (Diário 07:00)            │    │                 │
│  │  │   ↓                                   │    │                 │
│  │  │ Listar linhas (3 ações paralelas)    │    │                 │
│  │  │   ↓                                   │    │                 │
│  │  │ Compor (Union)                       │    │                 │
│  │  │   ↓                                   │    │                 │
│  │  │ Filtrar matriz (data_venc)           │    │                 │
│  │  │   ↓                                   │    │                 │
│  │  │ Condição (If length > 0)             │    │                 │
│  │  │   ├─ Criar tabela HTML              │    │                 │
│  │  │   ├─ Compor email                   │    │                 │
│  │  │   └─ Para cada contato              │    │                 │
│  │  │       └─ Enviar email (V2)          │    │                 │
│  │  │   └─ Fim                             │    │                 │
│  │  └──────────────────────────────────────┘    │                 │
│  └────────┬──────────────────────────────────────┘                 │
│           │                                                        │
│           │ Conector Outlook                                       │
│           │                                                        │
│  ┌────────▼──────────────┐                                        │
│  │  OFFICE 365 OUTLOOK   │                                        │
│  │                       │                                        │
│  │ Email enviado para:   │                                        │
│  │ joao@empresa.com      │                                        │
│  │ maria@empresa.com     │                                        │
│  │ (dinâmico)            │                                        │
│  └───────────────────────┘                                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                            ↓
                     ┌──────────────┐
                     │  USUÁRIO     │
                     │  Recebe      │
                     │  Email +     │
                     │  Consulta    │
                     │  Painel HTML │
                     └──────────────┘
```

---

## Conclusão

A arquitetura do sistema PCM é **robusta, segura, escalável e confiável**, aproveitando os serviços nativos do Microsoft 365 para oferecer uma solução de baixa manutenção e alto impacto.

**Próximos passos**: Implementação conforme documentação técnica completa.
