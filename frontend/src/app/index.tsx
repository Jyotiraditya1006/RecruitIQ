import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, useWindowDimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../ThemeContext';

type Mode = 'applicant' | 'recruiter';

export default function App() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>('applicant');
  
  const [jobDescription, setJobDescription] = useState('');
  const [jobFile, setJobFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  const [cvFiles, setCvFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [bulkCvText, setBulkCvText] = useState(''); 
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null); 
  const [bulkResults, setBulkResults] = useState<any[] | null>(null); 

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const pickJobDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['*/*'], copyToCacheDirectory: true });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setJobFile(result.assets[0]);
        setJobDescription('');
      }
    } catch (err) {}
  };

  const pickSingleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['*/*'], copyToCacheDirectory: true });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCvFile(result.assets[0]);
        setCvText('');
      }
    } catch (err) {}
  };

  const pickMultipleDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['*/*'], copyToCacheDirectory: true, multiple: true });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCvFiles((prev) => [...prev, ...result.assets]);
      }
    } catch (err) {}
  };

  const appendFile = (formData: FormData, key: string, fileAsset: DocumentPicker.DocumentPickerAsset) => {
    if (Platform.OS === 'web' && fileAsset.file) {
      formData.append(key, fileAsset.file);
    } else {
      formData.append(key, { uri: fileAsset.uri, name: fileAsset.name, type: fileAsset.mimeType || 'application/octet-stream' } as any);
    }
  };

  const runAnalysis = async () => {
    if (!jobDescription.trim() && !jobFile) {
      Alert.alert('Missing Info', 'Please provide a Job Description.');
      return;
    }

    setLoading(true);
    setResults(null);
    setBulkResults(null);

    try {
      const formData = new FormData();
      if (jobDescription.trim()) formData.append('job_description', jobDescription);
      if (jobFile) appendFile(formData, 'job_file', jobFile);

      let endpoint = '';

      if (mode === 'applicant') {
        if (!cvText.trim() && !cvFile) {
          Alert.alert('Missing Info', 'Please provide a Candidate CV.');
          setLoading(false);
          return;
        }
        if (cvText.trim()) formData.append('cv_text', cvText);
        if (cvFile) appendFile(formData, 'cv_file', cvFile);
        endpoint = '/compare';
      } else {
        if (cvFiles.length === 0 && !bulkCvText.trim()) {
          Alert.alert('Missing Info', 'Please provide at least one Candidate CV.');
          setLoading(false);
          return;
        }
        if (bulkCvText.trim()) formData.append('cv_texts', bulkCvText);
        cvFiles.forEach((file) => appendFile(formData, 'cv_files', file));
        endpoint = '/compare_bulk';
      }

      const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL 
        ? `${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`
        : (Platform.OS === 'android' ? `http://10.0.2.2:8000${endpoint}` : `http://localhost:8000${endpoint}`);
        
      const response = await axios.post(BACKEND_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      
      if (mode === 'applicant') setResults(response.data);
      else setBulkResults(response.data.results);
      
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const themeStyles = isDarkMode ? darkTheme : lightTheme;

  const renderProgress = (label: string, value: number, color: string) => (
    <View style={themeStyles.metricContainer}>
      <View style={themeStyles.metricHeader}>
        <Text style={themeStyles.metricLabel}>{label}</Text>
        <Text style={[themeStyles.metricValue, { color }]}>{value}%</Text>
      </View>
      <View style={themeStyles.track}>
        <View style={[themeStyles.bar, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={themeStyles.safeArea} edges={['top', 'left', 'right']}>
      
      <View style={themeStyles.navbar}>
        <View style={themeStyles.navLogoContainer}>
          <Text style={themeStyles.navLogo}>RecruitIQ</Text>
        </View>
        <View style={themeStyles.navLinks}>
          <TouchableOpacity onPress={() => router.push('/about')} style={themeStyles.navLinkBtn}>
            <Text style={themeStyles.navLink}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/how-it-works')} style={themeStyles.navLinkBtn}>
            <Text style={themeStyles.navLink}>How it Works</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={themeStyles.themeToggleBtn}>
            <Text style={themeStyles.themeToggleText}>{isDarkMode ? '☀️ Light' : '🌙 Dark'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={themeStyles.mainContent}>
        
        <View style={themeStyles.headerBlock}>
          <Text style={themeStyles.headerTitle}>Intelligent Candidate Screening</Text>
          <Text style={themeStyles.headerSub}>Find the perfect match instantly using robust NLP keyword coverage and contextual analysis.</Text>
        </View>

        <View style={themeStyles.tabContainer}>
          <TouchableOpacity style={[themeStyles.tab, mode === 'applicant' && themeStyles.tabActive]} onPress={() => { setMode('applicant'); setResults(null); setBulkResults(null); }}>
            <Text style={[themeStyles.tabText, mode === 'applicant' && themeStyles.tabTextActive]}>Single Applicant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[themeStyles.tab, mode === 'recruiter' && themeStyles.tabActive]} onPress={() => { setMode('recruiter'); setResults(null); setBulkResults(null); }}>
            <Text style={[themeStyles.tabText, mode === 'recruiter' && themeStyles.tabTextActive]}>Bulk Screening</Text>
          </TouchableOpacity>
        </View>

        <View style={[themeStyles.layout, isDesktop && themeStyles.layoutDesktop]}>
          
          <View style={[themeStyles.card, isDesktop && themeStyles.flexCard]}>
            <Text style={themeStyles.cardTitle}>Upload Documents</Text>

            <Text style={themeStyles.inputLabel}>Job Description</Text>
            {!jobFile ? (
              <View>
                <TextInput style={themeStyles.textArea} placeholder="Enter job description..." placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'} multiline value={jobDescription} onChangeText={setJobDescription} />
                <TouchableOpacity style={themeStyles.uploadBtn} onPress={pickJobDocument}>
                  <Text style={themeStyles.uploadBtnText}>Upload JD (PDF/DOCX)</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={themeStyles.filePill}>
                <Text style={themeStyles.filePillText} numberOfLines={1}>{jobFile.name}</Text>
                <TouchableOpacity onPress={() => setJobFile(null)}><Text style={themeStyles.filePillClose}>Remove</Text></TouchableOpacity>
              </View>
            )}

            <View style={themeStyles.divider} />

            <Text style={themeStyles.inputLabel}>{mode === 'applicant' ? 'Candidate Resume' : 'Candidate Resumes'}</Text>
            {mode === 'applicant' ? (
              !cvFile ? (
                <View>
                  <TextInput style={themeStyles.textArea} placeholder="Enter candidate resume..." placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'} multiline value={cvText} onChangeText={setCvText} />
                  <TouchableOpacity style={themeStyles.uploadBtn} onPress={pickSingleDocument}>
                    <Text style={themeStyles.uploadBtnText}>Upload CV (PDF/DOCX)</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={themeStyles.filePill}>
                  <Text style={themeStyles.filePillText} numberOfLines={1}>{cvFile.name}</Text>
                  <TouchableOpacity onPress={() => setCvFile(null)}><Text style={themeStyles.filePillClose}>Remove</Text></TouchableOpacity>
                </View>
              )
            ) : (
              <View>
                <TextInput style={[themeStyles.textArea, { minHeight: 80 }]} placeholder="Paste CV text here..." placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'} multiline value={bulkCvText} onChangeText={setBulkCvText} />
                <TouchableOpacity style={themeStyles.uploadBtn} onPress={pickMultipleDocuments}>
                  <Text style={themeStyles.uploadBtnText}>+ Add Multiple Resumes</Text>
                </TouchableOpacity>
                
                {cvFiles.length > 0 && (
                  <View style={themeStyles.fileGrid}>
                    {cvFiles.map((f, i) => (
                      <View key={i} style={themeStyles.filePillSmall}>
                        <Text style={themeStyles.filePillTextSmall} numberOfLines={1}>{f.name}</Text>
                        <TouchableOpacity onPress={() => {
                          const nf = [...cvFiles]; nf.splice(i,1); setCvFiles(nf);
                        }}><Text style={themeStyles.filePillCloseSmall}>✕</Text></TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={themeStyles.actionBtn} onPress={runAnalysis} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={themeStyles.actionBtnText}>Analyze Compatibility</Text>}
            </TouchableOpacity>
          </View>

          <View style={[themeStyles.card, themeStyles.resultsCard, isDesktop && themeStyles.flexCard]}>
            <Text style={themeStyles.cardTitle}>Results</Text>

            {!results && !bulkResults ? (
              <View style={themeStyles.emptyState}>
                <Text style={themeStyles.emptyTitle}>Ready for Analysis</Text>
                <Text style={themeStyles.emptyDesc}>Provide a job description and at least one resume on the left to begin.</Text>
              </View>
            ) : mode === 'applicant' && results ? (
              <View style={themeStyles.resultsWrapper}>
                <View style={themeStyles.scoreBox}>
                  <Text style={themeStyles.scoreLabel}>OVERALL MATCH</Text>
                  <Text style={themeStyles.scoreValue}>{results.average_score}%</Text>
                </View>
                <View style={themeStyles.metricsWrapper}>
                  {renderProgress('Keyword Coverage', results.bow_score, '#00704A')}
                  {renderProgress('Deep Semantic Fit', results.tfidf_score, '#047857')}
                  {renderProgress('Contextual N-Grams', results.ngram_score, '#10B981')}
                </View>
              </View>
            ) : mode === 'recruiter' && bulkResults ? (
              <View style={themeStyles.resultsWrapper}>
                {bulkResults.map((r, i) => (
                  <View key={i} style={themeStyles.rankCard}>
                    <View style={themeStyles.rankBadge}><Text style={themeStyles.rankBadgeText}>#{i+1}</Text></View>
                    <View style={themeStyles.rankInfo}>
                      <Text style={themeStyles.rankName} numberOfLines={1}>{r.filename}</Text>
                      <Text style={themeStyles.rankDetails}>Key: {r.bow_score}% | Sem: {r.tfidf_score}% | NG: {r.ngram_score}%</Text>
                    </View>
                    <Text style={themeStyles.rankScore}>{r.average_score}%</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// THEMES
const BRAND_GREEN = '#00704A';
const BRAND_HOVER = '#006241';

const lightTheme = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingVertical: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  navLogoContainer: { flexDirection: 'row', alignItems: 'center' },
  navLogo: { fontSize: 24, fontWeight: '800', color: BRAND_GREEN, letterSpacing: -0.5 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  navLinkBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  navLink: { color: '#111827', fontSize: 15, fontWeight: '600' },
  themeToggleBtn: { backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  themeToggleText: { color: '#111827', fontWeight: '700', fontSize: 13 },
  mainContent: { padding: 24, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  layout: { flexDirection: 'column', gap: 24 },
  layoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  headerBlock: { marginBottom: 32, marginTop: 16 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 8 },
  headerSub: { fontSize: 16, color: '#6B7280' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#E5E7EB', marginBottom: 24 },
  tab: { paddingVertical: 12, paddingHorizontal: 24, borderBottomWidth: 3, borderBottomColor: 'transparent', marginBottom: -2 },
  tabActive: { borderBottomColor: BRAND_GREEN },
  tabText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: BRAND_GREEN },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  flexCard: { flex: 1 },
  resultsCard: { backgroundColor: '#F3F4F6' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 24 },
  inputLabel: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 8 },
  textArea: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, color: '#111827', fontSize: 15, minHeight: 120, textAlignVertical: 'top', marginBottom: 16 },
  uploadBtn: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', padding: 16, borderRadius: 8, alignItems: 'center' },
  uploadBtnText: { color: '#111827', fontWeight: '600', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 32 },
  filePill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 8, padding: 16 },
  filePillText: { flex: 1, color: BRAND_HOVER, fontWeight: '600', fontSize: 15 },
  filePillClose: { color: '#DC2626', fontWeight: '600', fontSize: 14, marginLeft: 16 },
  fileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  filePillSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  filePillTextSmall: { color: '#111827', fontSize: 13, maxWidth: 120 },
  filePillCloseSmall: { color: '#DC2626', fontWeight: '800', fontSize: 14, marginLeft: 8 },
  actionBtn: { backgroundColor: BRAND_GREEN, padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 32 },
  actionBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  resultsWrapper: { flex: 1 },
  scoreBox: { backgroundColor: '#FFFFFF', padding: 32, borderRadius: 12, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: '#E5E7EB' },
  scoreLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', letterSpacing: 1, marginBottom: 8 },
  scoreValue: { fontSize: 56, fontWeight: '900', color: BRAND_GREEN },
  metricsWrapper: { gap: 24 },
  metricContainer: {},
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metricLabel: { color: '#111827', fontSize: 15, fontWeight: '600' },
  metricValue: { fontWeight: '700', fontSize: 15 },
  track: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4 },
  rankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 16, marginBottom: 12 },
  rankBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  rankBadgeText: { color: BRAND_HOVER, fontWeight: '800', fontSize: 15 },
  rankInfo: { flex: 1 },
  rankName: { color: '#111827', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  rankDetails: { color: '#6B7280', fontSize: 13 },
  rankScore: { fontSize: 24, fontWeight: '800', color: BRAND_GREEN, marginLeft: 16 },
});

const darkTheme = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B1121' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingVertical: 20, backgroundColor: '#161E31', borderBottomWidth: 1, borderBottomColor: '#2A364E' },
  navLogoContainer: { flexDirection: 'row', alignItems: 'center' },
  navLogo: { fontSize: 24, fontWeight: '800', color: BRAND_GREEN, letterSpacing: -0.5 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  navLinkBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  navLink: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  themeToggleBtn: { backgroundColor: '#1E293B', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  themeToggleText: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  mainContent: { padding: 24, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  layout: { flexDirection: 'column', gap: 24 },
  layoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  headerBlock: { marginBottom: 32, marginTop: 16 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#F8FAFC', marginBottom: 8 },
  headerSub: { fontSize: 16, color: '#94A3B8' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#2A364E', marginBottom: 24 },
  tab: { paddingVertical: 12, paddingHorizontal: 24, borderBottomWidth: 3, borderBottomColor: 'transparent', marginBottom: -2 },
  tabActive: { borderBottomColor: BRAND_GREEN },
  tabText: { fontSize: 16, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: BRAND_GREEN },
  card: { backgroundColor: '#161E31', borderRadius: 12, padding: 32, borderWidth: 1, borderColor: '#2A364E' },
  flexCard: { flex: 1 },
  resultsCard: { backgroundColor: '#0F172A' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#F8FAFC', marginBottom: 24 },
  inputLabel: { fontSize: 15, fontWeight: '600', color: '#E2E8F0', marginBottom: 8 },
  textArea: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#2A364E', borderRadius: 8, padding: 16, color: '#F8FAFC', fontSize: 15, minHeight: 120, textAlignVertical: 'top', marginBottom: 16 },
  uploadBtn: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#2A364E', padding: 16, borderRadius: 8, alignItems: 'center' },
  uploadBtnText: { color: '#F8FAFC', fontWeight: '600', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#2A364E', marginVertical: 32 },
  filePill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#064E3B', borderWidth: 1, borderColor: BRAND_GREEN, borderRadius: 8, padding: 16 },
  filePillText: { flex: 1, color: '#D1FAE5', fontWeight: '600', fontSize: 15 },
  filePillClose: { color: '#FCA5A5', fontWeight: '600', fontSize: 14, marginLeft: 16 },
  fileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  filePillSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#2A364E', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  filePillTextSmall: { color: '#F8FAFC', fontSize: 13, maxWidth: 120 },
  filePillCloseSmall: { color: '#FCA5A5', fontWeight: '800', fontSize: 14, marginLeft: 8 },
  actionBtn: { backgroundColor: BRAND_GREEN, padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 32 },
  actionBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#94A3B8', textAlign: 'center' },
  resultsWrapper: { flex: 1 },
  scoreBox: { backgroundColor: '#161E31', padding: 32, borderRadius: 12, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: '#2A364E' },
  scoreLabel: { fontSize: 13, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, marginBottom: 8 },
  scoreValue: { fontSize: 56, fontWeight: '900', color: BRAND_GREEN },
  metricsWrapper: { gap: 24 },
  metricContainer: {},
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metricLabel: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },
  metricValue: { fontWeight: '700', fontSize: 15 },
  track: { height: 8, backgroundColor: '#2A364E', borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4 },
  rankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161E31', borderWidth: 1, borderColor: '#2A364E', borderRadius: 8, padding: 16, marginBottom: 12 },
  rankBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#064E3B', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  rankBadgeText: { color: '#D1FAE5', fontWeight: '800', fontSize: 15 },
  rankInfo: { flex: 1 },
  rankName: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  rankDetails: { color: '#94A3B8', fontSize: 13 },
  rankScore: { fontSize: 24, fontWeight: '800', color: BRAND_GREEN, marginLeft: 16 },
});
