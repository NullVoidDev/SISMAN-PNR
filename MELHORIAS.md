# 🚀 SISMAN-PNR - Roadmap de Melhorias
## Plano de Evolução do Sistema

---

# 📊 VISÃO GERAL

Este documento lista as melhorias planejadas para o SISMAN-PNR, organizadas por prioridade e complexidade.

| Prioridade | Significado |
|------------|-------------|
| 🔴 Alta | Implementar o mais rápido possível |
| 🟡 Média | Implementar quando possível |
| 🟢 Baixa | Implementar no futuro |

| Complexidade | Tempo estimado |
|--------------|----------------|
| ⚡ Simples | 1-2 horas |
| ⚙️ Média | 1-2 dias |
| 🔧 Complexa | 1 semana+ |

---

# 🔴 PRIORIDADE ALTA

## 1. Notificações por Email
**Complexidade:** ⚙️ Média

### Descrição:
Enviar emails automáticos quando houver mudança de status.

### Funcionalidades:
- Email para o morador quando solicitação for aprovada
- Email para o morador quando solicitação for negada (com motivo)
- Email para o fiscal quando nova solicitação urgente chegar

### Benefícios:
- Morador não precisa ficar consultando o sistema
- Fiscal é alertado sobre urgências

---

## 2. Campo de Telefone do Morador
**Complexidade:** ⚡ Simples

### Descrição:
Adicionar campo de telefone/WhatsApp no formulário de solicitação.

### Benefícios:
- Facilita contato direto com o morador
- Agiliza agendamento de visitas

---

## 3. Agendamento de Execução
**Complexidade:** ⚙️ Média

### Descrição:
Após aprovar, permitir agendar data/hora para execução do serviço.

### Funcionalidades:
- Campo de data prevista na aprovação
- Morador vê a data agendada no status
- Calendário visual para o fiscal

### Benefícios:
- Melhor planejamento das manutenções
- Morador sabe quando será atendido

---

## 4. Status "Em Andamento" e "Concluído"
**Complexidade:** ⚡ Simples

### Descrição:
Adicionar mais status além de Pendente/Aprovado/Negado.

### Novos status:
- **Em Andamento** - Serviço sendo executado
- **Concluído** - Serviço finalizado

### Fluxo completo:
```
Pendente → Aprovado → Em Andamento → Concluído
                ↘ Negado
```

### Benefícios:
- Acompanhamento mais detalhado
- Morador sabe exatamente onde está o pedido

---

# 🟡 PRIORIDADE MÉDIA

## 5. Dashboard com Gráficos e Estatísticas
**Complexidade:** ⚙️ Média

### Descrição:
Adicionar gráficos visuais no painel do fiscal.

### Gráficos sugeridos:
- Pizza: Solicitações por categoria
- Barras: Solicitações por mês
- Linha: Evolução ao longo do tempo
- Cards: Tempo médio de resolução

### Benefícios:
- Visão gerencial do sistema
- Dados para relatórios e briefings

---

## 6. Relatório em PDF/Excel
**Complexidade:** ⚙️ Média

### Descrição:
Gerar relatórios exportáveis com filtros.

### Funcionalidades:
- Filtrar por período, status, categoria
- Exportar para PDF
- Exportar para Excel

### Benefícios:
- Facilita prestação de contas
- Dados para análise externa

---

## 7. Histórico de Ações (Log)
**Complexidade:** ⚙️ Média

### Descrição:
Registrar todas as ações realizadas no sistema.

### O que registrar:
- Quem aprovou/negou e quando
- Quem marcou como urgente
- Alterações de status

### Benefícios:
- Rastreabilidade completa
- Auditoria quando necessário

---

## 8. Múltiplos Usuários Fiscais
**Complexidade:** ⚙️ Média

### Descrição:
Permitir criar vários usuários fiscais com diferentes permissões.

### Níveis de acesso:
- **Fiscal**: Aprovar/negar, ver todas solicitações
- **Administrador**: Tudo + gerenciar usuários e PNRs

### Benefícios:
- Divisão de responsabilidades
- Controle de quem fez o quê

---

## 9. Comentários/Observações
**Complexidade:** ⚡ Simples

### Descrição:
Permitir adicionar comentários internos nas solicitações.

### Funcionalidades:
- Fiscal adiciona observações
- Histórico de comentários por solicitação

### Benefícios:
- Comunicação entre fiscais
- Registro de informações adicionais

---

## 10. Impressão de Etiquetas
**Complexidade:** ⚡ Simples

### Descrição:
Gerar etiquetas para identificação de ordens de serviço.

### Conteúdo da etiqueta:
- Número da O.S.
- PNR
- Categoria
- QR Code com link para detalhes

---

# 🟢 PRIORIDADE BAIXA (FUTURO)

## 11. Aplicativo Mobile Nativo
**Complexidade:** 🔧 Complexa

### Descrição:
Criar app para Android/iOS.

### Benefícios:
- Experiência otimizada para celular
- Notificações push
- Funciona offline (sincroniza depois)

---

## 12. Integração com WhatsApp
**Complexidade:** 🔧 Complexa

### Descrição:
Enviar notificações via WhatsApp Business API.

### Funcionalidades:
- Notificação de aprovação/negação
- Link para acompanhar status

---

## 13. Chatbot para Dúvidas
**Complexidade:** 🔧 Complexa

### Descrição:
Bot para responder perguntas frequentes dos moradores.

---

## 14. Assinatura Digital
**Complexidade:** 🔧 Complexa

### Descrição:
Permitir assinatura digital na O.S. pelo celular.

### Benefícios:
- Elimina papel completamente
- Comprovação digital de execução

---

## 15. Avaliação do Serviço
**Complexidade:** ⚙️ Média

### Descrição:
Morador avalia o serviço após conclusão.

### Funcionalidades:
- Nota de 1 a 5 estrelas
- Comentário opcional
- Relatório de satisfação

---

## 16. Mapa das PNRs
**Complexidade:** ⚙️ Média

### Descrição:
Visualizar as casas PNR em um mapa interativo.

### Funcionalidades:
- Localização de cada PNR
- Cores indicando solicitações pendentes
- Clique para ver detalhes

---

## 17. Controle de Materiais
**Complexidade:** 🔧 Complexa

### Descrição:
Registrar materiais utilizados em cada manutenção.

### Funcionalidades:
- Lista de materiais por serviço
- Controle de estoque
- Relatório de consumo

---

## 18. Manutenções Preventivas
**Complexidade:** ⚙️ Média

### Descrição:
Agendar manutenções preventivas periódicas.

### Funcionalidades:
- Cadastrar manutenções recorrentes
- Alertas quando vencer prazo
- Histórico de preventivas

---

# 📅 CRONOGRAMA SUGERIDO

## Fase 1 (1-2 meses)
- [ ] Campo de telefone
- [ ] Status "Em Andamento" e "Concluído"
- [ ] Comentários/Observações

## Fase 2 (2-4 meses)
- [ ] Notificações por email
- [ ] Agendamento de execução
- [ ] Dashboard com gráficos

## Fase 3 (4-6 meses)
- [ ] Relatórios PDF/Excel
- [ ] Múltiplos usuários fiscais
- [ ] Histórico de ações

## Fase 4 (6+ meses)
- [ ] Avaliação do serviço
- [ ] Mapa das PNRs
- [ ] Demais funcionalidades

---

# 💡 COMO PRIORIZAR

Ao decidir qual melhoria implementar primeiro, considere:

1. **Impacto**: Quantos usuários serão beneficiados?
2. **Urgência**: É necessário agora ou pode esperar?
3. **Esforço**: Quanto tempo leva para implementar?
4. **Dependências**: Precisa de algo pronto antes?

---

# 📝 SUGESTÕES DOS USUÁRIOS

Espaço para registrar sugestões que surgirem:

| Data | Sugestão | Quem sugeriu | Status |
|------|----------|--------------|--------|
| | | | |
| | | | |
| | | | |

---

*Documento atualizado em Janeiro/2026*
*SISMAN-PNR - Comando de Fronteira Jauru / 66º BI*
