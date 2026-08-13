# Especificação Técnica (SPEC)

## 1. Objetivo

Definir a implementação da solução de gestão e alerta automático de vencimentos usando o ecossistema Microsoft 365, com foco em Power Automate, OneDrive/SharePoint Excel e Outlook.

## 2. Escopo

### 2.1 In-Scope

- Leitura diária das tabelas Excel hospedadas em OneDrive ou SharePoint.
- Edição manual exclusiva no Excel; não haverá atualização de dados via interface HTML.
- Processamento de colunas de dados e comparação de vencimentos.
- Geração de página HTML responsiva para consulta avulsa, em modo somente leitura.
- Envio de e-mail automatizado via Office 365 Outlook com tabela HTML de itens críticos.
- Botão CTA no corpo do e-mail apontando para o painel/dashboard em OneDrive/SharePoint.
- Fluxo de execução diária com log de histórico nativo do Power Automate.

### 2.2 Out of Scope

- Bases de dados externas como Firebase, SQL ou serviços de terceiros.
- Integração com WhatsApp Business ou outros canais pagos de comunicação.
- Desenvolvimento de telas customizadas fora do ecossistema Microsoft 365.

## 3. Modelo de Dados

A fonte de dados será um único arquivo Excel Online (`.xlsx`) hospedado em OneDrive ou SharePoint.
Cada aba do workbook será formatada como tabela nomeada.

### Abas/tabelas existentes

- `equipamentos`: itens de equipamentos com vencimentos.
- `laudos`: itens de laudos com vencimentos.
- `contatos`: lista de contatos para notificações.

> Observação: os nomes das tabelas devem ser de fácil entendimento no fluxo, para manter a manutenção simples.

### Colunas obrigatórias em `equipamentos` e `laudos`

- `descricao`: descrição do equipamento, laudo ou contrato.
- `fabricante`: marca, modelo ou fornecedor.
- `patrimonio`: número de tombo, patrimônio ou identificador único.
- `empresa`: nome do contrato, site de atendimento ou empresa associada.
- `data_inic`: data da última calibração, emissão ou início do contrato.
- `data_venc`: data do próximo vencimento.

### Colunas obrigatórias em `contatos`

- `nome`: nome do responsável ou contato.
- `email`: endereço de e-mail para notificação.
- `telefone`: telefone para referência, opcional para disparo de e-mail.

> Observação: as datas devem estar em formato compatível com ISO 8601 para leitura correta pelo conector Excel do Power Automate.

## 4. Arquitetura da Solução

### 4.1 Camada de Dados

- Excel Online hospedado em OneDrive ou SharePoint.
- Tabela nomeada com as colunas definidas em `3. Modelo de Dados`.

### 4.2 Camada de Processamento

- Power Automate com fluxo agendado.
- Gatilho de Recorrência configurado para execução diária em horário definido (ex. 07:00).
- Conector `Excel Online (Business)` para ler as tabelas.
- Leitura das tabelas `equipamentos` e `laudos`.
- Acionamento do filtro via `Filter Array` sobre cada linha lida.
- Leitura da tabela `contatos` para obter destinatários de e-mail.
- A lista de destinatários deve ser dinâmica: o fluxo envia apenas para os contatos presentes na tabela `contatos`.
- Fluxo já testado com envio de e-mail de aviso.

### 4.3 Camada de Consulta HTML

- Página HTML responsiva para consulta somente leitura.
- A página deve apresentar os dados de vencimentos em visualização, sem possibilidade de edição.
- A página deve ser estática e independente da regra de alarmes do fluxo.
- Se houver necessidade de frontend adicional, os dados podem ser expostos em JSON apenas para consumo de visualização, não para decisão de envio de alerta.
- A página pode ser publicada como SharePoint Online page ou exportada automaticamente por Power Automate, desde que mantenha a disponibilidade em modo de consulta.

### 4.4 Camada de Notificação

- Conector `Office 365 Outlook` usando a ação `Enviar um email V2`.
- Corpo do e-mail em HTML com tabela dinamicamente montada.
- Botão de ação que leva ao painel do Excel/SharePoint.

## 5. Regras de Negócio

1. O fluxo executa diariamente sem intervenção manual.
2. Item é elegível para alerta quando `data_venc` for menor ou igual à data atual acrescida da margem configurada.
3. A margem inicial deve ser configurável, sugerida em 30 dias, com possibilidade de ajuste para 45 dias para cobertura de fusos horários e finais de semana.
4. A comparação deve ser feita na forma de data, usando `utcNow()` combinado com `addDays` no Power Automate.
5. Se não houver itens dentro do critério, o fluxo encerra sem enviar e-mail.
6. As datas exibidas no e-mail devem ser formatadas para `DD/MM/YYYY`.
7. A página HTML de consulta deve ser somente leitura e não deve permitir alterações de dados.

## 6. Processo do Fluxo

1. Disparo diário por `Recurrence`.
2. Leitura da tabela Excel usando `Listar linhas presentes em uma tabela`.
3. Aplicação da `Matriz do filtro` (`Filter Array`):
   - Condição: `item()?['data_venc'] <= addDays(utcNow(), margemDias, 'yyyy-MM-dd')`
4. Criação de tabela HTML com `Criar Tabela HTML`.
5. Envio de e-mail com `Enviar um email (V2)`.
6. Se o resultado do filtro retornar linhas:
   - Converter datas para formato brasileiro usando `formatDateTime(item()?['data_venc'], 'dd/MM/yyyy')`.
   - Montar tabela HTML personalizada.
   - Enviar e-mail a lista de distribuição aprovada.
7. Se não houver linhas, encerrar sem email.

> Observação: o fluxo está validado em teste com envio de aviso por e-mail.

## 7. Template de Notificação

### Assunto

`[ALERTA] Equipamentos com Vencimento Próximo`

### Corpo do e-mail

- Saudação inicial: `Olá,`
- Texto explicativo: `O seguinte equipamento está com o vencimento de calibração agendado para os próximos dias:`
- Tabela HTML gerada automaticamente.
- Call to action: link com botão estilizado texto `Abrir Painel de Controle de Calibração`.
- Fechamento com assinatura: `Sistema de Controle Automático PCM.`

### Elementos do e-mail

- Tabela com colunas mínimas: `descricao`, `fabricante`, `patrimonio`, `empresa`, `data_inic`, `data_venc`.
- Botão ou link visível que aponta para o documento Excel/SharePoint.

## 8. Requisitos Não Funcionais

- Manter todos os dados e fluxos dentro do Microsoft 365 corporativo.
- Priorizar solução de baixo código no Power Automate.
- Garantir auditabilidade pelo histórico nativo de execuções do Power Automate.
- Reduzir manutenção operacional e permitir transferência de propriedade para a equipe PCM.

## 9. Critérios de Aceitação

- O fluxo deve executar diariamente e ler corretamente a tabela Excel.
- Alertas devem ser enviados apenas quando existirem itens com vencimento na janela configurada.
- O e-mail deve incluir a tabela de itens e botão de acesso ao painel.
- Se a tabela filtrada estiver vazia, nenhum e-mail deve ser disparado.
- O histórico de execução deve ficar disponível no Power Automate.
- O fluxo deve usar as ações testadas: `Recurrence`, `Listar linhas presentes em uma tabela`, `Matriz do filtro`, `Criar Tabela HTML`, `Enviar um email (V2)`.

## 10. Considerações Operacionais

- Configurar permissões de acesso ao arquivo Excel para o serviço do Power Automate e usuários da lista de distribuição.
- Validar o nome da tabela e os headers no Excel para consistência com o fluxo.
- Documentar a variável de margem de dias (`margemDias`) para ajustes futuros.
- Garantir que a página HTML de consulta seja publicada em um local acessível e somente leitura.
- Confirmar se a aba `contatos` deve servir como fonte única de destinatários ou se haverá lista de distribuição externa adicional.
- Confirmar se o feed JSON será usado apenas pelo frontend para consulta e não para o cálculo do alerta.

## 11. Entregáveis e Próximos Passos

- Documento final de SPEC revisado e aprovado.
- Workshop de revisão com o time PCM para validar as tabelas e o fluxo atual.
- Ajuste dos nomes exatos de tabela no Excel e no Power Automate, se necessário.
- Publicação da página HTML estática de consulta e definição do endpoint/URL.
- Atualização da documentação de operação para inclusão/exclusão de contatos.

## 12. Dependências

- Arquivo Excel hospedado no OneDrive ou SharePoint com abas/tabelas nomeadas.
- Permissões do Power Automate para ler o Excel e enviar e-mails via Office 365 Outlook.
- Lista de contatos mantida atualizada na aba `contatos`.
- Power Automate configurado com o fluxo de notificação existente.
- Ambiente Microsoft 365 disponível para publicação e consulta da página HTML.
