import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@theme/ThemeProvider';
import { typography, spacing, borderRadius, shadows, accentColorOptions } from '@theme/tokens';
import { Palette, Moon, Sun, Monitor, ChevronRight, Database, Info } from 'lucide-react-native';
import { BackupService } from '@services/backupService';

export default function PerfilScreen() {
  const { colors, colorScheme, themeMode, setColorScheme, accentColor, setAccentColor } = useTheme();
  const [backupBusy, setBackupBusy] = useState(false);

  const handleExport = async () => {
    setBackupBusy(true);
    const filepath = await BackupService.exportToFile();
    setBackupBusy(false);
    Alert.alert(
      filepath ? 'Backup exportado' : 'Exportação falhou',
      filepath ? 'O ficheiro foi criado e está pronto para partilhar.' : 'Não foi possível criar o backup.'
    );
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;

    setBackupBusy(true);
    const importResult = await BackupService.importFromFile(result.assets[0].uri);
    setBackupBusy(false);
    Alert.alert(
      importResult.success ? 'Backup importado' : 'Importação falhou',
      importResult.success ? 'Os seus dados foram restaurados.' : importResult.error || 'O ficheiro não é válido.'
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Perfil</Text>
      </View>

      {/* User Info Card */}
      <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>U</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>Utilizador</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            Dados armazenados localmente
          </Text>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Aparência</Text>

        <View style={[styles.settingItem, { borderBottomColor: colors.borderSubtle }]}>
          <View style={styles.settingLeft}>
            {colorScheme === 'dark' ? (
              <Moon size={22} color={colors.textPrimary} strokeWidth={2} />
            ) : (
              <Sun size={22} color={colors.textPrimary} strokeWidth={2} />
            )}
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Tema</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {colorScheme === 'dark' ? 'Escuro' : 'Claro'}
              </Text>
            </View>
          </View>
          <View style={styles.themeSelector}>
            <TouchableOpacity
              onPress={() => setColorScheme('light')}
              style={[styles.themeOption, { backgroundColor: '#F5F5F7', opacity: colorScheme === 'light' ? 1 : 0.5 }]}
            >
              <Sun size={16} color="#1D1D1F" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setColorScheme('dark')}
              style={[styles.themeOption, { backgroundColor: '#1C1C1E', opacity: colorScheme === 'dark' ? 1 : 0.5 }]}
            >
              <Moon size={16} color="#F5F5F7" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setColorScheme('auto')}
              style={[styles.themeOption, { backgroundColor: '#8E8E93', opacity: themeMode === 'auto' ? 1 : 0.5 }]}
            >
              <Monitor size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.borderSubtle }]}>
          <View style={styles.settingLeft}>
            <Palette size={22} color={colors.textPrimary} strokeWidth={2} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Cor de destaque</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {accentColor}
              </Text>
            </View>
          </View>
          <View style={[styles.colorDot, { backgroundColor: accentColor }]} />
        </TouchableOpacity>
        <View style={styles.colorOptions} accessibilityLabel="Cores de destaque">
          {accentColorOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setAccentColor(option.value)}
              style={[styles.colorOption, { backgroundColor: option.value, opacity: accentColor === option.value ? 1 : 0.45 }]}
              accessibilityRole="button"
              accessibilityLabel={`Usar cor ${option.name}`}
              accessibilityState={{ selected: accentColor === option.value }}
            />
          ))}
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Dados</Text>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.borderSubtle, opacity: backupBusy ? 0.5 : 1 }]}
          onPress={handleExport}
          disabled={backupBusy}
          accessibilityRole="button"
          accessibilityLabel="Exportar dados"
        >
          <View style={styles.settingLeft}>
            <Database size={22} color={colors.textPrimary} strokeWidth={2} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Exportar dados</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                Backup em JSON
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.borderSubtle, opacity: backupBusy ? 0.5 : 1 }]}
          onPress={handleImport}
          disabled={backupBusy}
          accessibilityRole="button"
          accessibilityLabel="Importar dados"
        >
          <View style={styles.settingLeft}>
            <Database size={22} color={colors.textPrimary} strokeWidth={2} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Importar dados</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                Restaurar backup
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Sobre</Text>

        <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.borderSubtle }]}>
          <View style={styles.settingLeft}>
            <Info size={22} color={colors.textPrimary} strokeWidth={2} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Versão</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                1.0.0
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>
            Privacidade e Dados Locais
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Todos os seus dados são armazenados apenas neste dispositivo. Não há conta, servidores ou sincronização na nuvem.
            {'\n\n'}
            ⚠️ Desinstalar o aplicativo pode apagar todos os seus dados. Faça backups regularmente.
          </Text>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.footnote,
  },
  section: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.subheadline,
    fontWeight: '600',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    fontWeight: '500',
  },
  settingValue: {
    ...typography.footnote,
    marginTop: spacing.xs,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.sm,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingLeft: 52,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  infoTitle: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    lineHeight: 24,
  },
});
