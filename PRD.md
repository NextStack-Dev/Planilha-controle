# Documento de Requisitos de Produto (PRD)

**Nome do Projeto:** Sistema de Gestão e Alerta Automático de Vencimentos (PCM)  
**Status:** Aprovado / Pronto para SPEC Técnica  
**Autor:** Setor de Planejamento e Controle de Manutenção (PCM)  

---

## 1. Visão Geral e Problema

* **Descrição do Problema:** Falta de centralização e automação no controle de datas de vencimento operacionais (calibração de instrumentos como termovisores e multímetros, laudos operacionais, AVCB, linhas de vida e contratos). A dependência do acompanhamento manual gera riscos de operação com itens vencidos e contratação emergencial de serviços, comprometendo auditorias ISO e normas de conformidade legal no data center.
* **Urgência e Oportunidade:** Notificar proativamente os responsáveis sem depender da memória humana, eliminando reuniões manuais de cobrança e garantindo 100% de conformidade operacional.
* **Decisão Arquitetural Consolidada:** O motor de backend será **100% nativo no ecossistema Microsoft 365 (Power Automate + OneDrive/SharePoint Excel)**. Esta escolha elimina a necessidade de infraestrutura externa (como Firebase/SQL), reduzindo a complexidade de manutenção, aumentando a segurança de dados e garantindo integração direta com o Outlook corporativo.

---

## 2. Modelagem de Dados

O repositório de dados consistirá em uma tabela padronizada no Excel Online (armazenada no OneDrive/SharePoint), organizada com a seguinte estrutura de colunas:

### 2.1. Tabela de Equipamentos, Laudos e Contratos
* **`descricao`**: Descrição do equipamento, laudo ou contrato (Ex: *Analisador de Qualidade de Energia*).
* **`fabricante`**: Marca, modelo ou fornecedor associado (Ex: *FLUKE*, *Heating Cooling*).
* **`patrimonio`**: Número de tombo, patrimônio ou identificador único (Ex: *16409*).
* **`empresa`**: Identificação do contrato, site de atendimento ou empresa associada.
* **`data_inic`**: Data da última calibração, emissão ou início do contrato.
* **`data_venc`**: Data limite de validade para o próximo vencimento.

---

## 3. Arquitetura da Solução

```
+------------------------------------------------------------------------+
|                      CAMADA DE DADOS (OneDrive/Excel)                  |
|  - Tabela formatada contendo: descricao, fabricante, patrimonio,       |
|    empresa, data_inic, data_venc                                       |
+------------------------------------------------------------------------+
                                   |
                                   | (Leitura diária via conector Excel)
                                   v
+------------------------------------------------------------------------+
|                  CAMADA DE PROCESSAMENTO (Power Automate)               |
|  1. Gatilho de Recorrência (Diário)                                    |
|  2. Leitura de Linhas (DateTime Format: ISO 8601)                      |
|  3. Matriz do Filtro (Comparação: item()?['data_venc'] <= addDays)     |
|  4. Formatação de Saída (Criar Tabela HTML Personalizada)              |
+------------------------------------------------------------------------+
                                   |
                                   | (Disparo automatizado)
                                   v
+------------------------------------------------------------------------+
|                  CAMADA DE NOTIFICAÇÃO (Office 365 Outlook)            |
|  - E-mail formatado enviado para a lista de distribuição do PCM        |
|  - Tabela HTML dinamicamente populada com itens a vencer               |
|  - Call to Action (Botão estilizado para abertura do painel)           |
+------------------------------------------------------------------------+
```

---

## 4. Regras de Negócio do Fluxo de Automação

1. **Gatilho Agendado (Recorrência):** O fluxo executa diariamente em horário pré-definido (ex: 07:00 AM).
2. **Janela de Alerta Flexível:** Disparo ativado quando a `data_venc` for menor ou igual à data atual acrescida da margem configurada (ex: `addDays(utcNow(), 30, 'yyyy-MM-dd')` ou margem estendida para 45 dias para cobrir fusos e finais de semana).
3. **Mapeamento Dinâmico por Item:** O filtro percorre linha a linha a tabela usando a expressão `item()?['data_venc']`.
4. **Formatação Sanitizada de Data:** Conversão da string padrão ISO (`YYYY-MM-DDThh:mm:ss.000Z`) para o padrão brasileiro (`DD/MM/YYYY`) na exibição da tabela do e-mail através da função `formatDateTime`.
5. **Comportamento para Tabela Vazia:** Se nenhum item atender ao critério do filtro na data da execução, o fluxo finaliza sem disparar e-mails para evitar spam na caixa de entrada.

---

## 5. Layout e Template da Notificação (E-mail)

A notificação disparada pelo conector **Office 365 Outlook (Enviar um email V2)** deve seguir a estrutura padrão aprovada:

* **Assunto:** `[ALERTA] Equipamentos com Vencimento Próximo`
* **Corpo do E-mail (HTML):**

> Olá,
> 
> O seguinte equipamento está com o vencimento de calibração agendado para os próximos dias:
> 
> **[Tabela HTML gerada automaticamente pelo bloco Criar Tabela HTML]**
> 
> Favor verificar as pendências e abrir o chamado para renovação.
> 
> Para visualizar o status completo e a interação visual de todos os equipamentos, acesse:
> 
> **[Abrir Painel de Controle de Calibração]** *(Botão estilizado com link para o OneDrive/SharePoint)*
> 
> Atenciosamente,  
> **Sistema de Controle Automático PCM.**

---

## 6. Escopo do Projeto

### Dentro do Escopo (In-Scope)
* Automação de leitura de tabelas Excel no OneDrive/SharePoint via Power Automate.
* Tratamento de campos de data e conversão obrigatória para o formato ISO 8601 no conector do Excel.
* Filtro de urgência dinâmico via **Matriz do Filtro** (*Filter Array*).
* Geração e envio automatizado de tabela HTML padronizada por e-mail no Outlook.
* Inclusão de botão estilizado de ação rápida (CTA) no corpo do e-mail direcionando para o repositório de dados.

### Fora do Escopo (Out of Scope)
* Banco de dados Firebase, SQL ou hospedagens externas de terceiros.
* Integradores pagos de API do WhatsApp Business.
* Telas customizadas de login e autenticação de usuários fora da governança da Microsoft.

---

## 7. Requisitos Não Funcionais

* **Segurança e Conformidade:** Dados mantidos integralmente dentro do ambiente corporativo e sob as políticas de segurança da empresa (Microsoft 365).
* **Zero Código / Baixa Manutenção:** Solução sustentável via Low-Code (Power Automate), permitindo facilidade de passagem de bastão e manutenção por qualquer membro da equipe de planejamento.
* **Rastreabilidade e Auditabilidade:** Histórico de execuções totalmente auditável pela tela nativa de histórico de execuções do Power Automate.
