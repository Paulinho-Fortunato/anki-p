/**
 * Tela de Pesquisa Global - FTS5
 * Busca offline em todos os conteúdos com destaques e filtros
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Clock, X, Filter } from 'lucide-react-native';
import { search, getSuggestions, type SearchResult } from '../src/db/searchRepository';
import { useTheme } from '../src/theme/ThemeProvider';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { EmptyState } from '../src/components/EmptyState';
import { selection } from '../src/services/feedbackService';

type ResultType = 'concept' | 'flashcard' | 'connection' | 'feynman';

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ResultType[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedTypes]);

  // Carregar buscas recentes ao montar
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = () => {
    try {
      const stored = require('../../services/storage').getRecentSearches?.() || [];
      setRecentSearches(stored.slice(0, 5));
    } catch {
      // Ignora se não existir
    }
  };

  const performSearch = useCallback((searchQuery: string) => {
    setIsLoading(true);
    try {
      const filters = selectedTypes.length > 0 ? { types: selectedTypes } : undefined;
      const searchResults = search(searchQuery, filters);
      setResults(searchResults);
      
      // Salvar nas recentes se for uma nova busca
      if (searchQuery.trim().length >= 2 && !recentSearches.includes(searchQuery.trim())) {
        saveRecentSearch(searchQuery.trim());
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTypes, recentSearches]);

  const saveRecentSearch = (searchQuery: string) => {
    try {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
      setRecentSearches(updated);
      require('../../services/storage').saveRecentSearches?.(updated);
    } catch {
      // Ignora
    }
  };

  const handleSelectRecent = (searchQuery: string) => {
    selection();
    setQuery(searchQuery);
    Keyboard.dismiss();
  };

  const clearRecentSearches = () => {
    selection();
    setRecentSearches([]);
    try {
      require('../../services/storage').saveRecentSearches?.([]);
    } catch {
      // Ignora
    }
  };

  const toggleType = (type: ResultType) => {
    selection();
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const getTypeIcon = (type: ResultType) => {
    switch (type) {
      case 'concept': return '📚';
      case 'flashcard': return '🃏';
      case 'connection': return '🔗';
      case 'feynman': return '🎯';
    }
  };

  const getTypeLabel = (type: ResultType) => {
    switch (type) {
      case 'concept': return 'Conceitos';
      case 'flashcard': return 'Flashcards';
      case 'connection': return 'Conexões';
      case 'feynman': return 'Feynman';
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      onPress={() => {
        selection();
        router.push(`/conceitos/${item.id}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${item.type}: ${item.title}`}
    >
      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 20, marginRight: 12, marginTop: 2 }}>{getTypeIcon(item.type)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: 18, fontWeight: "600" }, { color: colors.textPrimary, marginBottom: 4 }]}>
              {item.title}
            </Text>
            {item.subjectName && (
              <Text style={[{ fontSize: 13, fontWeight: "400" }, { color: colors.textSecondary, marginBottom: 6 }]}>
                {item.subjectName} {item.topicName ? `• ${item.topicName}` : ''}
              </Text>
            )}
            <Text style={[{ fontSize: 16, fontWeight: "400" }, { color: colors.textSecondary, lineHeight: 20 }]}>
              {item.highlightedSnippet || item.snippet}
            </Text>
            <View style={{
              flexDirection: 'row',
              marginTop: 8,
              gap: 8,
            }}>
              <View style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
                backgroundColor: colors.surfaceSecondary,
              }}>
                <Text style={[{ fontSize: 13, fontWeight: "400" }, { color: colors.textSecondary }]}>
                  {getTypeLabel(item.type)}
                </Text>
              </View>
              {item.matchScore !== undefined && item.matchScore > 0 && (
                <View style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12,
                  backgroundColor: colors.accent + '20',
                }}>
                  <Text style={[{ fontSize: 13, fontWeight: "400" }, { color: colors.accent }]}>
                    {(item.matchScore * 10).toFixed(0)}% relevante
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[{ fontSize: 16, fontWeight: "400" }, { color: colors.textSecondary, marginTop: 16 }]}>
            Buscando...
          </Text>
        </View>
      );
    }

    if (query.trim().length === 0) {
      return (
        <EmptyState
          icon={Search}
          title="Pesquisar Conteúdo"
          description="Digite para buscar em conceitos, flashcards, conexões e notas Feynman."
        />
      );
    }

    if (results.length === 0) {
      const suggestions = getSuggestions(query, 3);
      return (
        <EmptyState
          icon={Search}
          title="Nenhum resultado encontrado"
          description={`Não encontramos nada para "${query}".`}
          action={suggestions.length > 0 ? (
            <View style={{ marginTop: 16 }}>
              <Text style={[{ fontSize: 13, fontWeight: "400" }, { color: colors.textSecondary, marginBottom: 8 }]}>
                Você quis dizer?
              </Text>
              {suggestions.map((suggestion: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectRecent(suggestion)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    marginVertical: 4,
                    borderRadius: 8,
                    backgroundColor: colors.surfaceSecondary,
                  }}
                >
                  <Text style={[{ fontSize: 16, fontWeight: "400" }, { color: colors.accent }]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : undefined}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header com Barra de Busca */}
      <View style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surfaceSecondary,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar conceitos, flashcards..."
            placeholderTextColor={colors.textSecondary}
            style={[
              { fontSize: 16, fontWeight: "400" },
              {
                flex: 1,
                marginLeft: 8,
                color: colors.textPrimary,
                paddingVertical: 4,
              }
            ]}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Campo de busca"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Limpar busca">
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)}
            accessibilityLabel="Filtros"
            style={{ marginLeft: 8 }}
          >
            <Filter 
              size={20} 
              color={selectedTypes.length > 0 ? colors.accent : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        {showFilters && (
          <View style={{
            marginTop: 12,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {(['concept', 'flashcard', 'connection', 'feynman'] as ResultType[]).map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => toggleType(type)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: selectedTypes.includes(type) ? colors.accent : colors.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: selectedTypes.includes(type) ? colors.accent : colors.border,
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selectedTypes.includes(type) }}
                accessibilityLabel={`Filtrar por ${getTypeLabel(type)}`}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>{getTypeIcon(type)}</Text>
                <Text style={[
                  { fontSize: 13, fontWeight: "400" },
                  { color: selectedTypes.includes(type) ? '#FFFFFF' : colors.textPrimary }
                ]}>
                  {getTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Buscas Recentes */}
        {!query && recentSearches.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={[{ fontSize: 13, fontWeight: "400" }, { color: colors.textSecondary, marginLeft: 6 }]}>
                  Recentes
                </Text>
              </View>
              <TouchableOpacity onPress={clearRecentSearches} accessibilityLabel="Limpar recentes">
                <Text style={[{ fontSize: 13, fontWeight: "400" }, { color: colors.accent }]}>
                  Limpar
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectRecent(search)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: colors.surfaceSecondary,
                  }}
                  accessibilityLabel={`Buscar novamente: ${search}`}
                >
                  <Text style={[{ fontSize: 13, fontWeight: "400" }, { color: colors.textPrimary }]}>
                    {search}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Lista de Resultados */}
      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={renderEmpty()}
        keyboardShouldPersistTaps="handled"
      />

      {/* Contador de Resultados */}
      {results.length > 0 && (
        <View style={{
          padding: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          alignItems: 'center',
        }}>
          <Text style={[{ fontSize: 13, fontWeight: "400" }, { color: colors.textSecondary }]}>
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
