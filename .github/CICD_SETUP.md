# CI/CD - GitHub Actions + EAS Build

## Configuração do Pipeline de Build Automatizado

Este documento descreve a configuração de CI/CD para build automatizado via GitHub Actions e EAS Build.

## 📋 Pré-requisitos

### 1. Conta Expo e Projeto EAS

1. Crie uma conta em [expo.dev](https://expo.dev)
2. Instale o EAS CLI globalmente:
   ```bash
   npm install -g eas-cli
   ```
3. Faça login no EAS:
   ```bash
   eas login
   ```
4. Configure o projeto:
   ```bash
   eas build:configure
   ```

### 2. Segredos do GitHub (GitHub Secrets)

Acesse `Settings > Secrets and variables > Actions` no seu repositório GitHub e adicione:

| Nome do Segredo | Descrição | Como Obter |
|-----------------|-----------|------------|
| `EAS_ACCESS_TOKEN` | Token de acesso ao EAS | [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) |
| `CODECOV_TOKEN` (opcional) | Token para upload de cobertura de testes | [codecov.io](https://codecov.io) |

#### Como criar o EAS_ACCESS_TOKEN:

1. Acesse [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
2. Clique em "Create Access Token"
3. Dê um nome descritivo (ex: "GitHub Actions CI")
4. Copie o token gerado
5. Adicione como segredo no GitHub com o nome `EAS_ACCESS_TOKEN`

### 3. Configurar Credenciais EAS (Opcional para Produção)

Para builds de produção na App Store / Play Store:

1. **Android**: Configure a keystore no EAS Console ou use a gestão automática
2. **iOS**: 
   - Configure certificados e provisioning profiles no [EAS Console](https://expo.dev)
   - Ou use a gestão automática de credenciais do EAS

## 🔧 Arquivos de Configuração

### `.github/workflows/build.yml`

Workflow principal que executa:

1. **Lint & Type Check** - Validação de código e tipos TypeScript
2. **Tests** - Execução de testes unitários com cobertura
3. **Build Android** - Gera APK para distribuição interna
4. **Build iOS** - Gera build para simulador (requer credenciais)
5. **Final Summary** - Resumo completo dos builds

### `eas.json`

Configuração de perfis de build:

| Perfil | Uso | Saída |
|--------|-----|-------|
| `development` | Desenvolvimento local | APK (Android) / Simulator (iOS) |
| `preview` | Testes internos / QA | APK (Android) / Archive (iOS) |
| `production` | Lojas oficiais | AAB (Play Store) / IPA (App Store) |

## 🚀 Executando Builds

### Build Manual (Local)

```bash
# Development
eas build --platform android --profile development
eas build --platform ios --profile development

# Preview (testes internos)
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Production (lojas)
eas build --platform android --profile production
eas build --platform ios --profile production
```

### Build Automático (GitHub Actions)

O build é acionado automaticamente quando:

- Um commit é pushado na branch `main`
- Um pull request é aberto/atualizado na branch `main`

#### Para acionar manualmente:

1. Vá em `Actions > Build > Run workflow`
2. Selecione a branch
3. Clique em "Run workflow"

## 📦 Artefatos Gerados

### Android

- **Formato**: APK (preview) ou AAB (production)
- **Local**: Disponível nos artefatos do workflow por 14 dias
- **Instalação**: Baixe o APK e instale no dispositivo Android

### iOS

- **Formato**: TAR.GZ (simulator) ou IPA (device)
- **Local**: Disponível nos artefatos do workflow por 14 dias
- **Instalação**: 
  - Simulator: Extraia e abra no Xcode Simulator
  - Device: Requer TestFlight ou instalação direta

## ⚠️ Notas Importantes

### iOS Builds

- Builds iOS requerem credenciais Apple Developer configuradas no EAS
- No CI, usamos perfil `development` para simulador por ser mais rápido
- Para builds de dispositivo real, configure:
  - Certificados de desenvolvimento/distribuição
  - Provisioning Profiles
  - Identificadores de app (Bundle ID)

### Android Builds

- APKs de preview não são assinados para produção
- Para Play Store, use perfil `production` que gera AAB assinado
- Configure a keystore no EAS Console para assinatura automática

### Tempo de Build

- Android: ~10-15 minutos
- iOS: ~15-25 minutos (pode variar conforme fila do EAS)

### Custos

- Builds no EAS têm limite gratuito mensal
- Verifique seu plano em [expo.dev/accounts/[account]/settings/billing](https://expo.dev)

## 🔍 Monitorando Builds

### No GitHub

1. Acesse `Actions` no repositório
2. Clique no workflow em execução
3. Veja logs em tempo real de cada job

### No EAS

1. Acesse [expo.dev/accounts/[account]/projects/[project]/builds](https://expo.dev)
2. Veja histórico e status de todos os builds
3. Baixe binaries quando completos

## 🛠️ Troubleshooting

### Build falha com erro de autenticação

- Verifique se `EAS_ACCESS_TOKEN` está configurado corretamente
- Regere o token se necessário
- Confirme que o token tem permissões adequadas

### iOS build falha constantemente

- Verifique credenciais no EAS Console
- Confirme Bundle ID único e registrado na Apple
- Certifique-se de ter dispositivos registrados para builds de desenvolvimento

### Build demora muito

- Isso é normal para primeiros builds (cache sendo criado)
- Builds subsequentes são mais rápidos
- Considere usar `resourceClass: m-medium` ou maior no `eas.json`

### Erro de dependências nativas

- Execute `npx expo-doctor` para verificar configuração
- Limpe cache: `npx expo start -c`
- Reinstale dependências: `rm -rf node_modules && npm ci`

## 📚 Links Úteis

- [Documentação EAS Build](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo GitHub Action](https://github.com/expo/expo-github-action)
- [Configurando Credenciais iOS](https://docs.expo.dev/build-reference/ios-certificates/)
- [Configurando Credenciais Android](https://docs.expo.dev/build-reference/android-signing/)

---

**Nota**: Este pipeline é totalmente automatizado e não requer intervenção humana durante a execução. Builds falham de forma clara se credenciais não estiverem configuradas.
