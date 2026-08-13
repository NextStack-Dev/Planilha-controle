# Sistema de Controle de Vencimentos PCM

## Visão Geral

Este projeto documenta a solução de gestão e alerta automático de vencimentos implementada no ecossistema Microsoft 365. O sistema utiliza Power Automate e um arquivo Excel hospedado no OneDrive/SharePoint para controlar os vencimentos de equipamentos, laudos e contratos, enviar notificações por e-mail e fornecer uma página de consulta somente leitura.

## Objetivo

Garantir a centralização, automação e visibilidade dos vencimentos operacionais, reduzindo riscos de operação com itens vencidos e facilitando a conformidade com auditorias ISO e normas legais.

## Arquitetura

- **Dados**: arquivo Excel Online (`.xlsx`) hospedado no OneDrive ou SharePoint.
- **Processamento**: Power Automate com fluxo agendado.
- **Notificação**: Office 365 Outlook envia e-mail com tabela HTML.
- **Consulta**: página HTML estática somente leitura para visualização dos dados.

## Modelo de Dados

O Excel contém abas tabeladas com os seguintes nomes e funções:

- `equipamentos`: lista de equipamentos com dados de vencimento.
- `laudos`: lista de laudos com dados de vencimento.
- `contatos`: lista de contatos que recebem as notificações.

### Colunas obrigatórias em `equipamentos` e `laudos`

- `descricao`
- `fabricante`
- `patrimonio`
- `empresa`
- `data_inic`
- `data_venc`

### Colunas obrigatórias em `contatos`

- `nome`
- `email`
- `telefone`

## Fluxo de Automação

O fluxo Power Automate já está configurado e testado. Ele executa os seguintes passos:

1. Disparo diário por `Recurrence`.
2. Leitura da tabela com `Listar linhas presentes em uma tabela`.
3. Filtro com `Matriz do filtro` para identificar itens com vencimento dentro da janela configurada.
4. Criação de tabela HTML com `Criar Tabela HTML`.
5. Envio de e-mail com `Enviar um email (V2)`.

## Regras de Negócio

- A edição de dados ocorre somente no Excel.
- A página HTML é apenas para consulta e não altera dados.
- A lista de destinatários é dinâmica e depende da aba `contatos`.
- Alertas são disparados apenas quando existem itens dentro da janela de vencimento.
- O fluxo roda normalmente em feriados e finais de semana.

## Notificação por E-mail

O e-mail de alerta deve conter:

- Assunto: `[ALERTA] Equipamentos com Vencimento Próximo`
- Texto explicativo
- Tabela HTML com os itens críticos
- Botão de ação com link para o painel de controle em OneDrive/SharePoint

## Próximos Passos

- Revisar e aprovar a SPEC final.
- Confirmar os nomes exatos das tabelas no Excel e no Power Automate.
- Publicar a página HTML de consulta em um local acessível e somente leitura.
- Manter a aba `contatos` atualizada para enviar notificações corretamente.

## Dependências

- Microsoft 365 com OneDrive/SharePoint e Power Automate.
- Permissões de leitura do Excel e envio de e-mails via Office 365 Outlook.
- Arquivo Excel corretamente estruturado e nomeado.

---

> Este README serve como documentação de alto nível para o projeto e pode ser usado como página inicial no GitHub Pages.
