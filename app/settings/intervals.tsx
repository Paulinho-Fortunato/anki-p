/**
 * Settings Screen - Intervalos de Revisão Customizados (SRS)
 * Permite configurar presets ou personalizar manualmente os intervalos do SRS
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, ChevronRight, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeProvider';
import { lightColors, darkColors, typography } from '../../src/theme/tokens';
import {
  SRS_PRESETS,
  getSRSSettings,
  setSRSSettings,
  applySRSPreset,
  type SRSSettings,
  type SRSIntervals,
} from '../../src/store/settingsStore';

export default function SRSIntervalsSettings() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState<SRSSettings>(getSRSSettings());
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const theme = {
    background: isDark ? darkColors.background : lightColors.background,
    surface: isDark ? darkColors.surface : lightColors.surface,
    surfaceSecondary: isDark ? darkColors.surfaceSecondary : lightColors.surfaceSecondary,
    textPrimary: isDark ? darkColors.textPrimary : lightColors.textPrimary,
    textSecondary: isDark ? darkColors.textSecondary : lightColors.textSecondary,
    border: isDark ? darkColors.border : lightColors.border,
    accent: lightColors.accent,
    success: lightColors.success,
    warning: lightColors.warning,
  };

  const handleIntervalChange = (
    key: keyof SRSIntervals,
    value: number
  ) => {
    const newIntervals = { ...settings.intervals, [key]: value };
    const newSettings = { ...settings, intervals: newIntervals };
    setSettings(newSettings);
    setSRSSettings({ intervals: newIntervals });
    setSelectedPreset(null); // Clear preset when customizing
    setIsCustomMode(true);
  };

  const handleEaseFactorChange = (value: number) => {
    const clampedValue = Math.max(1.5, Math.min(3.5, value));
    const newSettings = { ...settings, easeFactor: clampedValue };
    setSettings(newSettings);
    setSRSSettings({ easeFactor: clampedValue });
    setSelectedPreset(null);
    setIsCustomMode(true);
  };

  const handleMaxIntervalChange = (value: number) => {
    const clampedValue = Math.max(7, Math.min(365, value));
    const newSettings = { ...settings, maxInterval: clampedValue };
    setSettings(newSettings);
    setSRSSettings({ maxInterval: clampedValue });
    setSelectedPreset(null);
    setIsCustomMode(true);
  };

  const applyPreset = (presetKey: keyof typeof SRS_PRESETS) => {
    Alert.alert(
      `Aplicar ${SRS_PRESETS[presetKey].name}`,
      'Isso substituirá suas configurações atuais. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar',
          onPress: () => {
            applySRSPreset(presetKey);
            const newSettings = getSRSSettings();
            setSettings(newSettings);
            setSelectedPreset(presetKey);
            setIsCustomMode(false);
          },
        },
      ]
    );
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Resetar para Padrão',
      'Isso restaurará as configurações originais. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: () => {
            applySRSPreset('STANDARD');
            const newSettings = getSRSSettings();
            setSettings(newSettings);
            setSelectedPreset('STANDARD');
            setIsCustomMode(false);
          },
        },
      ]
    );
  };

  const renderPresetCard = (
    presetKey: keyof typeof SRS_PRESETS,
    preset: typeof SRS_PRESETS[keyof typeof SRS_PRESETS]
  ) => {
    const isSelected = selectedPreset === presetKey;
    
    return (
      <TouchableOpacity
        key={presetKey}
        style={[
          styles.presetCard,
          { backgroundColor: theme.surface, borderColor: isSelected ? theme.accent : theme.border },
          isSelected && styles.presetCardSelected,
        ]}
        onPress={() => applyPreset(presetKey)}
        accessibilityLabel={`Aplicar preset ${preset.name}: ${preset.description}`}
        accessibilityRole="button"
      >
        <View style={styles.presetHeader}>
          <Text style={[styles.presetName, { color: theme.textPrimary }]}>
            {preset.name}
          </Text>
          {isSelected && (
            <Check size={20} color={theme.accent} strokeWidth={2.5} />
          )}
        </View>
        <Text style={[styles.presetDescription, { color: theme.textSecondary }]}>
          {preset.description}
        </Text>
        <View style={styles.presetIntervals}>
          <Text style={[styles.presetIntervalText, { color: theme.textSecondary }]}>
            {preset.intervals.forgot}d → {preset.intervals.partial}d → {preset.intervals.remembered}d → {preset.intervals.easy}d
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSlider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    unit: string,
    onChange: (value: number) => void,
    description?: string
  ) => (
    <View style={[styles.sliderContainer, { backgroundColor: theme.surface }]}>
      <View style={styles.sliderHeader}>
        <Text style={[styles.sliderLabel, { color: theme.textPrimary }]}>{label}</Text>
        <Text style={[styles.sliderValue, { color: theme.accent }]}>
          {value}
          {unit}
        </Text>
      </View>
      {description && (
        <Text style={[styles.sliderDescription, { color: theme.textSecondary }]}>
          {description}
        </Text>
      )}
      <View style={styles.sliderControls}>
        <TouchableOpacity
          style={[styles.sliderButton, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => onChange(Math.max(min, value - step))}
          accessibilityLabel={`Diminuir ${label}`}
          accessibilityRole="button"
        >
          <Text style={[styles.sliderButtonText, { color: theme.textPrimary }]}>−</Text>
        </TouchableOpacity>
        <View style={styles.sliderTrack}>
          <View style={styles.sliderTrackBackground}>
            <View 
              style={[
                styles.sliderTrackFill, 
                { 
                  width: `${((value - min) / (max - min)) * 100}%`,
                  backgroundColor: theme.accent,
                },
              ]} 
            />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.sliderButton, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => onChange(Math.min(max, value + step))}
          accessibilityLabel={`Aumentar ${label}`}
          accessibilityRole="button"
        >
          <Text style={[styles.sliderButtonText, { color: theme.textPrimary }]}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sliderRange}>
        <Text style={[styles.sliderRangeText, { color: theme.textSecondary }]}>{min}{unit}</Text>
        <Text style={[styles.sliderRangeText, { color: theme.textSecondary }]}>{max}{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <ArrowLeft size={24} color={theme.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Intervalos de Revisão
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={resetToDefaults}
          accessibilityLabel="Resetar para padrão"
          accessibilityRole="button"
        >
          <RefreshCw size={20} color={theme.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        {isCustomMode && (
          <View style={[styles.customBadge, { backgroundColor: theme.warning + '20', borderColor: theme.warning }]}>
            <Text style={[styles.customBadgeText, { color: theme.warning }]}>
              Modo Personalizado Ativo
            </Text>
          </View>
        )}

        {/* Presets Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Configuração Rápida
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Escolha um preset pré-configurado baseado em métodos comprovados
          </Text>
          
          <View style={styles.presetsContainer}>
            {(Object.keys(SRS_PRESETS) as Array<keyof typeof SRS_PRESETS>).map((key) =>
              renderPresetCard(key, SRS_PRESETS[key])
            )}
          </View>
        </View>

        {/* Custom Intervals Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Personalizar Intervalos
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Ajuste manualmente os dias para cada nível de domínio
          </Text>

          {renderSlider(
            'Não Lembrei',
            settings.intervals.forgot,
            0,
            7,
            1,
            'd',
            (v) => handleIntervalChange('forgot', v),
            'Revisar no mesmo dia (0) ou após X dias'
          )}

          {renderSlider(
            'Parcialmente',
            settings.intervals.partial,
            1,
            10,
            1,
            'd',
            (v) => handleIntervalChange('partial', v),
            'Intervalo curto para revisão rápida'
          )}

          {renderSlider(
            'Lembrei',
            settings.intervals.remembered,
            3,
            20,
            1,
            'd',
            (v) => handleIntervalChange('remembered', v),
            'Intervalo médio para consolidação'
          )}

          {renderSlider(
            'Facilmente',
            settings.intervals.easy,
            10,
            60,
            5,
            'd',
            (v) => handleIntervalChange('easy', v),
            'Intervalo longo para conteúdo dominado'
          )}
        </View>

        {/* Advanced Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Configurações Avançadas
          </Text>

          {renderSlider(
            'Fator de Facilidade',
            settings.easeFactor,
            1.5,
            3.5,
            0.1,
            '',
            handleEaseFactorChange,
            'Quanto o intervalo cresce a cada acerto (padrão: 2.5)'
          )}

          {renderSlider(
            'Intervalo Máximo',
            settings.maxInterval,
            7,
            365,
            7,
            'd',
            handleMaxIntervalChange,
            'Limite superior para evitar revisões muito distantes'
          )}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>
            Como funciona?
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            O algoritmo SRS adapta os intervalos baseado no seu desempenho. 
            Quando você marca "Facilmente", o intervalo aumenta. Quando marca 
            "Não lembrei", o intervalo reinicia. Personalize esses intervalos 
            conforme sua necessidade de retenção.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    ...typography.title2,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  customBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  customBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: 4,
  },
  sectionDescription: {
    ...typography.body,
    marginBottom: 16,
  },
  presetsContainer: {
    gap: 12,
  },
  presetCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  presetCardSelected: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetName: {
    ...typography.title2,
    fontWeight: '600',
  },
  presetDescription: {
    ...typography.body,
    marginBottom: 8,
  },
  presetIntervals: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetIntervalText: {
    ...typography.footnote,
    fontFamily: 'Inter-Medium',
  },
  sliderContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderLabel: {
    ...typography.body,
    fontWeight: '500',
  },
  sliderValue: {
    ...typography.title1,
    fontWeight: '700',
  },
  sliderDescription: {
    ...typography.footnote,
    marginBottom: 12,
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  sliderTrack: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
  },
  sliderTrackBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderTrackFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderRangeText: {
    ...typography.footnote,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoTitle: {
    ...typography.headline,
    marginBottom: 8,
  },
  infoText: {
    ...typography.body,
    lineHeight: 22,
  },
});
