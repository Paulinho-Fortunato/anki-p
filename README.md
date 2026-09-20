# Study Mobile App 📚

Aplicativo mobile de estudos offline-first com métodos cientificamente fundamentados para aprendizagem e memorização.

## 🎯 Funcionalidades

- **Recuperação Ativa**: Teste seu conhecimento antes de verificar a resposta
- **Revisão Espaçada (SRS)**: Algoritmo adaptativo baseado em SM-2
- **Método Feynman**: Explique conceitos para identificar lacunas
- **Conexões e Analogias**: Elabore associações pessoais
- **Flashcards**: Crie e revise cartões de memória
- **Timer de Estudo**: Sessões Pomodoro personalizáveis
- **Estatísticas**: Acompanhe seu progresso com gráficos
- **Calendário**: Visualize revisões agendadas
- **Notificações Locais**: Lembretes sem internet
- **Backup/Restore**: Exporte e importe dados em JSON

## 🔒 Privacidade

- **100% Offline**: Nenhum dado sai do  dispositivo
- **Sem conta**: Use imediatamente, sem cadastro
- **Sem analytics**: Zero rastreamento
- **Dados locais**: SQLite + MMKV

## 🛠️ Stack Tecnológico

- **Expo SDK 52** + React Native 0.76
- **TypeScript** - Tipagem estática
- **Expo Router** - Navegação por arquivos
- **SQLite** (expo-sqlite) - Banco de dados principal
- **MMKV** (react-native-mmkv) - Preferências rápidas
- **Lucide Icons** - Ícones consistentes
- **React Native SVG** - Gráficos leves

## 📁 Estrutura do Projeto

```
/workspace
├── app/                      # Rotas (Expo Router)
│   ├── (tabs)/               # Tab navigation
│   │   ├── index.tsx         # Início
│   │   ├── estudar.tsx       # Estudar
│   │   ├── revisoes.tsx      # Revisões
│   │   ├── biblioteca.tsx    # Biblioteca
│   │   └── perfil.tsx        # Perfil
│   ├── biblioteca/           # Detalhes da disciplina
│   ├── conceitos/            # Lista de conceitos
│   ├── modal/                # Modais (CRUD)
│   └── _layout.tsx           # Layout root
├── src/
│   ├── components/           # Componentes UI reutilizáveis
│   ├── db/                   # Schema, migrações, repositórios
│   ├── services/             # Lógica de negócio (SRS, Timer, etc.)
│   ├── theme/                # Design system, cores, tipografia
│   └── hooks/                # Hooks customizados
├── __tests__/                # Testes automatizados
├── .github/workflows/        # CI/CD (GitHub Actions)
├── eas.json                  # Configuração EAS Build
└── package.json
```

## 🚀 Execução Local

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (iOS/Android) para teste

### Instalação

```bash
cd /workspace
npm install
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios

# Web
npx expo start --web
```

### Type Check

```bash
npx tsc --noEmit
```

### Testes

```bash
npm test
```

## 🏗️ Build via GitHub Actions

O projeto inclui CI/CD completo configurado em `.github/workflows/build.yml`.

### Configurar Secrets no GitHub

No repositório GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

| Secret | Descrição |
|--------|-----------|
| `EAS_ACCESS_TOKEN` | Token do Expo EAS (obtenha em https://expo.dev/settings/access-tokens) |

### Perfis de Build (eas.json)

- **development**: Build interno com cliente de desenvolvimento
- **preview**: APK interno para testes (Android) / IPA para TestFlight (iOS)
- **production**: Build para lojas (App Store / Google Play)

### Trigger Manual

```bash
# Android Preview
eas build --platform android --profile preview

# iOS Preview
eas build --platform ios --profile preview

# Production
eas build --platform all --profile production
```

## 📊 Schema do Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `subjects` | Disciplinas (Matemática, História, etc.) |
| `topics` | Matérias dentro de disciplinas |
| `concepts` | Conceitos individuais para estudo |
| `flashcards` | Cartões de memória |
| `study_sessions` | Histórico de sessões de estudo |
| `reviews` | Registro de revisões (SRS) |
| `feynman_notes` | Versões de explicações Feynman |
| `connections` | Analogias, associações, curiosidades |
| `reminders` | Lembretes agendados |
| `settings` | Preferências do utilizador |

### Migrações

As migrações são versionadas em `src/db/schema.ts`. Nunca apague o banco para corrigir erros — use migrações incrementais.

## 🎨 Design System

Inspirado nos princípios de design da Apple:

- **Cores**: Tokens centralizados em `src/theme/tokens.ts`
- **Tipografia**: Inter (carregada offline via expo-font)
- **Ícones**: Lucide (nunca emojis como ícones de UI)
- **Espaçamento**: Sistema consistente (4, 8, 12, 16, 20, 24, 32)
- **Dark Mode**: Suporte completo claro/escuro/automático

## ⚠️ Avisos Importantes

1. **Backup regular**: Desinstalar o app pode apagar todos os dados
2. **Exportar dados**: Use a função de backup no menu Perfil
3. **Sem sincronização**: Dados são apenas neste dispositivo
4. **Build iOS**: Requer macOS ou EAS Build remoto

## 📝 Roadmap

### ✅ Implementado
- Scaffold Expo + TypeScript + Expo Router
- SQLite com schema completo e migrações
- Repositórios CRUD
- Design system (cores, tipografia, tokens)
- ThemeProvider com light/dark mode
- Componentes UI básicos
- SRS Service (algoritmo de revisão espaçada)
- Tabs: Início, Estudar, Revisões, Biblioteca, Perfil
- CRUD de Disciplinas, Matérias, Conceitos
- CI/CD GitHub Actions + EAS Build

### 🚧 Em Progresso
- Timer de estudo funcional
- Flashcards CRUD e revisão
- Método Feynman completo
- Conexões/Elaboração
- Estatísticas com gráficos
- Calendário de revisões
- Notificações locais agendadas
- Backup/Restore JSON
- Pesquisa global FTS5
- Onboarding

### 📋 Pendente
- Intercalação de disciplinas
- Sono e consolidação
- Personalização avançada (fontes, densidade, etc.)
- Widgets (iOS/Android)
- Acessibilidade completa (VoiceOver/TalkBack)

## 📄 Licença

MIT License — use livremente para estudos ou projetos pessoais.

---

**Desenvolvido com ❤️ para estudantes que valorizam privacidade e aprendizagem eficaz.**
