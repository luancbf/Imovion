# 🚀 Cenários de Cron Jobs - Projeto Imobiliário

## 📊 Configuração Atual (Plano Hobby)
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-apis",
      "schedule": "0 1 * * *"
    }
  ]
}
```

## 🎯 Cenários Futuros (Para Plano Pro/Enterprise)

### 📋 OPÇÃO 1: Sincronização a cada 6 horas (original)
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-apis",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### 📋 OPÇÃO 2: Múltiplas sincronizações (alto volume)
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-apis",
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/sync-prices",
      "schedule": "0 */4 * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

### 📋 OPÇÃO 3: Horários específicos otimizados
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-apis",
      "schedule": "0 1,7,13,19 * * *"
    }
  ]
}
```

### 📋 OPÇÃO 4: Diferentes frequências por tipo
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-all",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/sync-urgent",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/cron/cleanup-old",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

## 📚 Guia de Schedules (Cron Syntax)

| Schedule | Descrição |
|----------|-----------|
| `"0 1 * * *"` | 1h AM todos os dias |
| `"0 */6 * * *"` | A cada 6 horas |
| `"0 */4 * * *"` | A cada 4 horas |
| `"0 */2 * * *"` | A cada 2 horas |
| `"0 1,7,13,19 * * *"` | 1h, 7h, 13h, 19h |
| `"0 2 * * 0"` | 2h AM só domingos |
| `"0 3 1 * *"` | 3h AM dia 1 do mês |

## 🔄 Como Alterar

1. **Edite** o arquivo `vercel.json`
2. **Copie** uma das configurações acima
3. **Cole** substituindo o conteúdo atual
4. **Commit** e push para deploy

## 📈 Recomendações por Fase

### 🏠 **Pequeno** (até 1000 imóveis)
- Configuração atual: `0 1 * * *`

### 🏢 **Médio** (1000-10000 imóveis)  
- Use OPÇÃO 1: `0 */6 * * *`

### 🏬 **Grande** (10000+ imóveis)
- Use OPÇÃO 2 ou 4 com múltiplos crons