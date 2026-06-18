# Sistema de Controle de Vencimento de Calibrações — PCM
Este sistema é uma solução automatizada desenvolvida para o Planejamento e Controle de Manutenção (PCM), projetada para centralizar, monitorar e emitir alertas proativos sobre o vencimento de calibrações de ferramentas e equipamentos do contrato.

O principal objetivo é mitigar o risco de utilização de instrumentos descalibrados, assegurando a integridade dos serviços executados e a total conformidade com os requisitos de auditoria.

## 📊 Arquitetura do Sistema e Fluxo de Dados
O ecossistema foi desenhado seguindo preceitos modernos de acoplamento flexível, dividindo-se em três camadas principais:

Camada de Dados (Engine): Baseada em uma planilha do Google Sheets gerenciada sob governança estrita do setor.

Camada de Notificação Ativa: Motor automatizado executado via Google Apps Script que monitora as datas em segundo plano e realiza disparos diários de alertas por e-mail.

Camada de Visualização (Front-end): Interface web responsiva construída em JavaScript nativo (Vanilla JS), que consome os dados exportados via protocolo HTTPS seguro (output=csv).

## 🛡️ Qualidade de Software e Governança Corporativa (Padrões ISO)
Este projeto foi concebido sob rigorosas diretrizes de qualidade que atendem a critérios internacionais de segurança, estabilidade e auditoria técnica.

### 1. Continuidade de Negócios e Desvinculação Pessoal
Visando a total independência de indivíduos e mitigando riscos de interrupção operacional (alinhado aos planos de contingência da ISO 9001):

Conta Funcional Dedicada: Toda a infraestrutura de dados (Google Sheets) e processamento (Apps Script) foi transferida e implantada em uma conta Google de natureza exclusivamente corporativa e de propriedade do setor técnico.

Perenidade do Ativo: Nenhuma credencial ou caixa postal de natureza pessoal/física possui a posse ou custódia dos scripts e bancos de dados. Em caso de transição de equipes ou colaboradores, o ativo permanece sob controle do contrato e acessível à liderança e auditoria.

### 2. Segurança da Informação e Gestão de Acessos
Comunicação Encriptada: O tráfego e intercâmbio de dados operacionais ocorrem estritamente sob protocolo seguro HTTPS.

Segregação de Funções: A edição dos dados de calibração fica restrita aos operadores da conta corporativa proprietária da planilha, enquanto o painel web atua de forma passiva, eliminando superfícies de ataque para injeção ou modificação indevida de dados.

### 3. Confiabilidade e Rastreabilidade
Evidência Documental Automática: O acionador (Trigger) do Apps Script é configurado nativamente no servidor do Google por meio de um Temporizador Diário (Controlado por Relógio) executado nas primeiras horas da madrugada. Isso garante alta tolerância a falhas locais de infraestrutura física.

Rastreabilidade de Código: O repositório centralizado no GitHub garante o histórico cronológico de todas as revisões e evoluções da ferramenta, provendo transparência técnica imediata durante ciclos de fiscalização e auditorias internas ou externas.

Arquivo gerado automaticamente: documentação resumida do projeto.
[Acesse a planilha de controle](https://nextstack-dev.github.io/Planilha-controle/)