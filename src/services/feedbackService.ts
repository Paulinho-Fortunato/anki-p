/**
 * Serviço de Feedback - Haptics e Sons
 * Centraliza vibração e feedback sonoro para consistência em todo o app
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Estado de inicialização
let isInitialized = false;
let hapticsEnabled = true;

/**
 * Inicializa o serviço de feedback
 */
export async function initializeFeedback(): Promise<void> {
  isInitialized = true;
}

/**
 * Ativa/desativa haptics (placeholder para futura implementação com MMKV)
 */
export async function setHapticsEnabled(enabled: boolean): Promise<void> {
  hapticsEnabled = enabled;
}

/**
 * Ativa/desativa sons (placeholder para futura implementação)
 */
export async function setSoundsEnabled(enabled: boolean): Promise<void> {
  // Implementação futura quando expo-av estiver disponível
}

/**
 * Feedback de sucesso - impacto leve
 */
export async function success(): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Ignora erros de haptics
  }
}

/**
 * Feedback de aviso - impacto médio
 */
export async function warning(): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (error) {
    // Ignora
  }
}

/**
 * Feedback de erro - impacto pesado
 */
export async function error(): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch (error) {
    // Ignora
  }
}

/**
 * Feedback de seleção - sutil
 */
export async function selection(): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    // Ignora
  }
}

/**
 * Feedback de impacto customizado
 */
export async function impact(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    const styleMap = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    await Haptics.impactAsync(styleMap[style]);
  } catch (error) {
    // Ignora
  }
}

/**
 * Feedback de conclusão do timer - padrão rítmico
 */
export async function timerComplete(): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    // Padrão: 3 pulsos fortes
    for (let i = 0; i < 3; i++) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  } catch (error) {
    // Ignora
  }
}

/**
 * Feedback de carregamento - pulso único leve
 */
export async function tick(): Promise<void> {
  if (!hapticsEnabled) return;
  
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Ignora
  }
}

/**
 * Limpa recursos (placeholder)
 */
export async function cleanup(): Promise<void> {
  // Nada para limpar no momento
}
