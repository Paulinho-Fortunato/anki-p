# 🚀 Guia de Build Automático via GitHub Actions

## Visão Geral

O projeto está configurado para gerar **automaticamente** builds de produção (Android APK/AAB e iOS IPA) sempre que você fizer push na branch `main`.

---

## ✅ Pré-requisitos (Configuração Única)

### 1. Criar Conta EAS (Expo Application Services)

```bash
npm install -g eas-cli
eas login
```

### 2. Configurar Projeto no EAS

```bash
eas build:configure
```

Isso criará/atualizará o `eas.json` com as configurações corretas.

### 3. Obter Token de Acesso do EAS

1. Acesse https://expo.dev/settings/access-tokens
2. Clique em "Create Access Token"
3. Dê um nome (ex: "GitHub Actions CI")
4. Copie o token gerado (começa com `u_`)

### 4. Adicionar Secret no GitHub

1. Vá até seu repositório no GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Nome: `EAS_ACCESS_TOKEN`
5. Valor: cole o token copiado do EAS
6. Salvar

### 5. (Opcional) Configurar EXPO_TOKEN

Para alguns cenários avançados, pode precisar também do `EXPO_TOKEN`:

1. Acesse https://expo.dev/settings/access-tokens
2. Crie outro token
3. Adicione como secret `EXPO_TOKEN` no GitHub

---

## 🔔 O Que Acontece Automaticamente

Quando você faz **push na branch `main`**:

### Pipeline Completo:

1. **Lint & Type Check** (Ubuntu)
   - Instala dependências
   - Roda TypeScript (`npx tsc --noEmit`)
   - ❌ Falha se houver erros de tipo

2. **Testes Automatizados** (Ubuntu)
   - Roda todos os testes Jest com coverage
   - ❌ Falha se algum teste falhar

3. **Build Android Production** (Ubuntu)
   - Gera **AAB (Android App Bundle)** assinado
   - Pronto para Google Play Store
   - Artifact disponível por 30 dias

4. **Build iOS Production** (Ubuntu → EAS Cloud)
   - Gera **IPA** assinado
   - Pronto para TestFlight/App Store
   - ⚠️ Requer credenciais Apple configuradas no EAS Console

5. **Relatório Final**
   - Summary detalhado no GitHub Actions
   - Links para downloads dos artifacts

---

## 📱 Resposta: "Se eu salvar no GitHub, o APK é gerado automaticamente?"

### ✅ SIM! MAS com condições:

| Condição | Resultado |
|----------|-----------|
| ✅ `EAS_ACCESS_TOKEN` configurado nos secrets | Build Android **FUNCIONA** automaticamente |
| ✅ Código sem erros TypeScript | Build prossegue |
| ✅ Todos os testes passando | Build prossegue |
| ✅ Credenciais EAS configuradas (keystore, bundle ID) | Build **assinado** e pronto para loja |
| ❌ Sem token ou credenciais | Build **FALHA** ou gera unsigned |

### Importante:
- O **primeiro build** pode falhar se você não configurou as credenciais no EAS Console
- Use `eas build:configure` localmente uma vez para setup inicial
- O EAS gerencia automaticamente keystores e certificados na nuvem

---

## 🧪 Validação da Busca FTS5

### Passo a Passo para Testar:

1. **Rodar o app em desenvolvimento:**
   ```bash
   npx expo start
   ```

2. **Criar conceito antigo manualmente:**
   - Vá em Biblioteca → Nova Disciplina → "História"
   - Adicione Conceito: "Revolução Francesa"
   - Explicação: "Movimento revolucionário de 1789 que derrubou a monarquia..."
   - Salve

3. **Fechar e reabrir o app** (simular restart):
   ```bash
   # No Expo Go, apenas recarregue
   ```

4. **Testar busca:**
   - Toque na lupa (pesquisa)
   - Digite: "revolução" ou "francesa" ou "1789"
   - **Resultado esperado:** Conceito aparece com destaque no snippet

5. **Se não aparecer:**
   - Verifique console por erros
   - Execute manualmente o backfill:
   ```typescript
   import { runFTS5Backfill } from './src/db/fts5-backfill';
   runFTS5Backfill();
   ```

### Script de Teste Automatizado (opcional):

```bash
# Criar arquivo test-fts5.ts
npx ts-node test-fts5.ts
```

---

## 🎨 Ajuste Fino de Cores do Heatmap (Dark Mode)

O heatmap já está configurado com cores adaptativas:

### Localização:
`app/(tabs)/calendario.tsx` - Linhas ~200-250

### Cores Atuais:

```typescript
// Light Mode
level 0: '#ebedf0' (cinza claro)
level 1: '#9be9a8' (verde claro)
level 2: '#40c463' (verde médio)
level 3: '#30a14e' (verde escuro)
level 4: '#216e39' (verde muito escuro)

// Dark Mode (automático via useColorScheme)
level 0: '#161b22' (quase preto)
level 1: '#0e4429' (verde muito escuro)
level 2: '#006d32' (verde escuro)
level 3: '#26a641' (verde médio)
level 4: '#39d353' (verde claro brilhante)
```

### Para Ajustar:

Edite o objeto `getHeatmapColors()` em `app/(tabs)/calendario.tsx`:

```typescript
const getHeatmapColors = (isDark: boolean) => ({
  level0: isDark ? '#SEU_CODIGO' : '#SEU_CODIGO',
  level1: isDark ? '#SEU_CODIGO' : '#SEU_CODIGO',
  // ...
});
```

### Dica de Design:
- Dark Mode: Use verdes mais saturados para melhor contraste
- Light Mode: Use verdes mais suaves para não cansar a vista

---

## 🏗️ Build de Produção Local (Alternativa ao GitHub Actions)

Se quiser buildar localmente antes de push:

### Android:

```bash
eas build --platform android --profile production --non-interactive
```

### iOS:

```bash
eas build --platform ios --profile production --non-interactive
```

### Ambos:

```bash
eas build --platform all --profile production --non-interactive
```

### Com Output Específico:

```bash
eas build --platform android --profile production --output ./meu-app.aab
```

---

## 📊 Monitorando o Build no GitHub

1. Vá até a aba **Actions** do repositório
2. Clique no workflow em execução ("Build")
3. Acompanhe em tempo real:
   - ✅ Lint/Type Check (30s)
   - ✅ Tests (2-5 min)
   - 🔄 Build Android (10-20 min)
   - 🔄 Build iOS (15-30 min)
4. Ao final:
   - Download APK/AAB em "Artifacts"
   - Resumo na seção "Summary"

---

## 🐛 Troubleshooting Comum

### "Error: Please login to EAS"
```bash
# Adicione EAS_ACCESS_TOKEN nos secrets do GitHub
```

### "iOS build failed: Credentials not found"
```bash
# Configure no EAS Console:
# 1. Acesse https://expo.dev
# 2. Selecione seu projeto
# 3. Build → Credentials → iOS
# 4. Setup automatic credentials
```

### "Android build failed: Keystore not found"
```bash
# Na primeira vez, o EAS cria automaticamente
# Ou configure manualmente em:
# Project Settings → Build → Android Keystore
```

### "TypeScript errors blocking build"
```bash
# Corrija localmente:
npx tsc --noEmit
npm run lint
# Commit e push novamente
```

### "Tests failing"
```bash
# Rode localmente para debug:
npm test -- --verbose
# Corrija os testes ou código
```

---

## 📦 Onde Encontrar os Builds Gerados

### GitHub Actions:
1. Aba **Actions** → Workflow concluído
2. Role até **"Artifacts"**
3. Clique em:
   - `android-apk-production` (baixa .aab ou .apk)
   - `ios-build-production` (baixa .ipa)
4. Válido por **30 dias**

### EAS Dashboard:
1. https://expo.dev
2. Seu projeto → Build
3. Histórico completo de todos os builds
4. Disponível indefinidamente

---

## ✅ Checklist Final Antes do Primeiro Push

- [ ] `EAS_ACCESS_TOKEN` adicionado nos secrets do GitHub
- [ ] Projeto configurado no EAS (`eas build:configure`)
- [ ] Bundle ID único definido (ex: `com.seunome.estudos`)
- [ ] Versão do app definida em `app.json` (ex: `"version": "1.0.0"`)
- [ ] Ícone e splash screen configurados
- [ ] Permissões necessárias declaradas em `app.json`
- [ ] Testes passando localmente (`npm test`)
- [ ] TypeScript sem erros (`npx tsc --noEmit`)

---

## 🎉 Pós-Build: Próximos Passos

### Android:
1. Baixe o `.aab` dos artifacts
2. Suba no [Google Play Console](https://play.google.com/console)
3. Preencha informações da loja
4. Envie para revisão

### iOS:
1. Baixe o `.ipa` dos artifacts
2. Suba no [App Store Connect](https://appstoreconnect.apple.com)
3. Use o Transporter ou Xcode
4. Configure TestFlight para beta testers
5. Envie para revisão

---

**📞 Precisa de ajuda?**
- Docs EAS: https://docs.expo.dev/eas/
- Docs GitHub Actions: https://docs.github.com/actions
- Suporte Expo: https://expo.dev/support
