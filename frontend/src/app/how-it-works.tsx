import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../ThemeContext';

export default function HowItWorksPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const themeStyles = isDarkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={themeStyles.safeArea} edges={['top', 'left', 'right']}>
      <View style={themeStyles.navbar}>
        <View style={themeStyles.navLogoContainer}>
          <Text style={themeStyles.navLogo}>RecruitIQ</Text>
        </View>
        <View style={themeStyles.navLinks}>
          <TouchableOpacity onPress={() => router.push('/')} style={themeStyles.backBtn}>
            <Text style={themeStyles.navLink}>Back to Workspace</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={themeStyles.themeToggleBtn}>
            <Text style={themeStyles.themeToggleText}>{isDarkMode ? '☀️ Light' : '🌙 Dark'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={themeStyles.content}>
        <Text style={themeStyles.title}>Algorithmic Pipeline</Text>
        
        <Text style={themeStyles.intro}>
          Our Natural Language Processing (NLP) pipeline normalizes text through advanced tokenization and stop-word filtering before deploying three distinct scoring algorithms:
        </Text>

        <View style={themeStyles.card}>
          <View style={themeStyles.iconBox}><Text style={themeStyles.icon}>1</Text></View>
          <View style={themeStyles.cardText}>
            <Text style={themeStyles.cardTitle}>Keyword Coverage (BoW)</Text>
            <Text style={themeStyles.cardDesc}>Measures baseline vocabulary overlap by calculating the exact count of matching terms, strictly looking at Job Description coverage.</Text>
          </View>
        </View>

        <View style={themeStyles.card}>
          <View style={themeStyles.iconBox}><Text style={themeStyles.icon}>2</Text></View>
          <View style={themeStyles.cardText}>
            <Text style={themeStyles.cardTitle}>Deep Semantic Fit</Text>
            <Text style={themeStyles.cardDesc}>Applies a statistical weight to keyword importance and assesses how deeply a candidate's background structurally matches the core requirement profile.</Text>
          </View>
        </View>

        <View style={themeStyles.card}>
          <View style={themeStyles.iconBox}><Text style={themeStyles.icon}>3</Text></View>
          <View style={themeStyles.cardText}>
            <Text style={themeStyles.cardTitle}>Contextual N-grams</Text>
            <Text style={themeStyles.cardDesc}>Extracts rolling 2-word phrases (bigrams) to ensure semantic proximity is maintained. For example, it distinguishes "Machine Learning" from someone who just wrote "Machine" and "Learning" in separate paragraphs.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const BRAND_GREEN = '#00704A';

const lightTheme = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingVertical: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  navLogoContainer: { flexDirection: 'row', alignItems: 'center' },
  navLogo: { fontSize: 24, fontWeight: '800', color: BRAND_GREEN, letterSpacing: -0.5 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F3F4F6', borderRadius: 6 },
  navLink: { fontSize: 14, fontWeight: '600', color: '#111827' },
  themeToggleBtn: { backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  themeToggleText: { color: '#111827', fontWeight: '700', fontSize: 13 },
  content: { padding: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },
  title: { fontSize: 36, fontWeight: '800', color: '#111827', marginBottom: 16 },
  intro: { fontSize: 16, color: '#4B5563', lineHeight: 26, marginBottom: 32 },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 24, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginRight: 20 },
  icon: { color: BRAND_GREEN, fontSize: 18, fontWeight: '800' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  cardDesc: { fontSize: 15, color: '#4B5563', lineHeight: 24 },
});

const darkTheme = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1121' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingVertical: 20, backgroundColor: '#161E31', borderBottomWidth: 1, borderBottomColor: '#2A364E' },
  navLogoContainer: { flexDirection: 'row', alignItems: 'center' },
  navLogo: { fontSize: 24, fontWeight: '800', color: BRAND_GREEN, letterSpacing: -0.5 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#1E293B', borderRadius: 6, borderWidth: 1, borderColor: '#334155' },
  navLink: { fontSize: 14, fontWeight: '600', color: '#F8FAFC' },
  themeToggleBtn: { backgroundColor: '#1E293B', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  themeToggleText: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  content: { padding: 40, maxWidth: 800, alignSelf: 'center', width: '100%' },
  title: { fontSize: 36, fontWeight: '800', color: '#F8FAFC', marginBottom: 16 },
  intro: { fontSize: 16, color: '#94A3B8', lineHeight: 26, marginBottom: 32 },
  card: { flexDirection: 'row', backgroundColor: '#161E31', padding: 24, borderRadius: 12, borderWidth: 1, borderColor: '#2A364E', marginBottom: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#064E3B', alignItems: 'center', justifyContent: 'center', marginRight: 20 },
  icon: { color: BRAND_GREEN, fontSize: 18, fontWeight: '800' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', marginBottom: 8 },
  cardDesc: { fontSize: 15, color: '#94A3B8', lineHeight: 24 },
});
