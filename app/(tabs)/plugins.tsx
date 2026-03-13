import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, TextInput, Dimensions, Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Wellness', 'Analytics', 'AI Workflows', 'Templates', 'Productivity'];

const FEATURED_PLUGINS = [
  {
    id: 'fp1',
    name: 'MoodFlow Pro',
    author: 'NeuraTech Labs',
    icon: '🌊',
    desc: 'Advanced mood analytics with predictive AI and Spotify integration.',
    rating: 4.9,
    reviews: 2341,
    installs: '12.4K',
    category: 'Analytics',
    price: 4.99,
    tags: ['mood', 'spotify', 'ai'],
    gradient: ['#8B5CF6', '#EC4899'] as const,
    installed: false,
    verified: true,
  },
  {
    id: 'fp2',
    name: 'SerenityBot',
    author: 'CalmAI',
    icon: '🤖',
    desc: 'Custom AI therapist persona trained on CBT and mindfulness frameworks.',
    rating: 4.8,
    reviews: 1892,
    installs: '8.7K',
    category: 'AI Workflows',
    price: 9.99,
    tags: ['ai', 'cbt', 'therapy'],
    gradient: ['#10B981', '#06B6D4'] as const,
    installed: true,
    verified: true,
  },
];

const ALL_PLUGINS = [
  {
    id: 'p1',
    name: 'Dream Journal Templates',
    author: 'SleepLab',
    icon: '🌙',
    desc: 'Beautiful guided templates for lucid dreaming and sleep tracking.',
    rating: 4.7,
    reviews: 891,
    installs: '5.2K',
    category: 'Templates',
    price: 0,
    tags: ['sleep', 'dreams', 'templates'],
    installed: false,
    verified: true,
  },
  {
    id: 'p2',
    name: 'Gratitude AI Coach',
    author: 'MindfulDev',
    icon: '🙏',
    desc: 'AI workflows that generate personalized gratitude prompts from your journal history.',
    rating: 4.6,
    reviews: 634,
    installs: '3.8K',
    category: 'AI Workflows',
    price: 2.99,
    tags: ['gratitude', 'ai', 'prompts'],
    installed: true,
    verified: false,
  },
  {
    id: 'p3',
    name: 'CBT Thought Records',
    author: 'TherapyTools',
    icon: '🧩',
    desc: 'Structured Cognitive Behavioral Therapy worksheets integrated into your journal.',
    rating: 4.9,
    reviews: 1204,
    installs: '7.1K',
    category: 'Wellness',
    price: 3.99,
    tags: ['cbt', 'therapy', 'wellness'],
    installed: false,
    verified: true,
  },
  {
    id: 'p4',
    name: 'Weekly Mood Report',
    author: 'DataMind',
    icon: '📊',
    desc: 'Auto-generates beautiful PDF mood reports you can share with your therapist.',
    rating: 4.5,
    reviews: 478,
    installs: '2.9K',
    category: 'Analytics',
    price: 0,
    tags: ['analytics', 'reports', 'therapist'],
    installed: false,
    verified: true,
  },
  {
    id: 'p5',
    name: 'Pomodoro Focus Mode',
    author: 'ProductivityAI',
    icon: '⏱️',
    desc: 'Integrate Pomodoro focus sessions with journaling for peak mental performance.',
    rating: 4.4,
    reviews: 312,
    installs: '1.7K',
    category: 'Productivity',
    price: 1.99,
    tags: ['focus', 'productivity', 'timer'],
    installed: false,
    verified: false,
  },
  {
    id: 'p6',
    name: 'Affirmation Engine',
    author: 'PositiveLabs',
    icon: '✨',
    desc: 'AI generates personalized affirmations based on your current emotional state.',
    rating: 4.8,
    reviews: 1567,
    installs: '9.3K',
    category: 'Wellness',
    price: 0,
    tags: ['affirmations', 'ai', 'wellness'],
    installed: true,
    verified: true,
  },
];

// ─── Sub-screens ──────────────────────────────────────────────────────────────

function SDKScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView style={sdkStyles.root} contentContainerStyle={sdkStyles.content}>
      <TouchableOpacity onPress={onBack} style={sdkStyles.back}>
        <Text style={sdkStyles.backText}>← Plugin Marketplace</Text>
      </TouchableOpacity>
      <LinearGradient colors={['#10B981', '#06B6D4']} style={sdkStyles.hero}>
        <Text style={sdkStyles.heroEmoji}>🛠️</Text>
        <Text style={sdkStyles.heroTitle}>Plugin SDK</Text>
        <Text style={sdkStyles.heroSub}>Build powerful extensions for MindMate</Text>
      </LinearGradient>

      {[
        { icon: '📦', title: 'Plugin Framework', desc: 'Lightweight JavaScript runtime using Hermes or V8. Plugins are bundled as standard ES Modules with clear entry points.' },
        { icon: '🔌', title: 'Plugin API', desc: 'Secure bridge to access MindMate features. Use `MindMate.journal`, `MindMate.analytics`, and `MindMate.user`.' },
        { icon: '🔒', title: 'Sandboxed Execution', desc: 'Plugins run in an isolated environment with NO access to device storage, network (except whitelist), or UI except via provided components.' },
        { icon: '🤖', title: 'AI & Workflows', desc: 'Programmatic access to MindMate model endpoints. Chain prompts and create custom processing pipelines for journal data.' },
        { icon: '📋', title: 'Manifest & Templates', desc: 'Define required permissions and UI schema in `plugin.json`. Create custom input fields and dashboard widgets.' },
        { icon: '📈', title: 'Real-time Analytics', desc: 'Hook into the data stream to provide live feedback. Perfect for productivity trackers and mood monitors.' },
      ].map((item, i) => (
        <View key={i} style={sdkStyles.apiCard}>
          <Text style={sdkStyles.apiIcon}>{item.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={sdkStyles.apiTitle}>{item.title}</Text>
            <Text style={sdkStyles.apiDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}

      <View style={sdkStyles.sandboxDetail}>
        <Text style={sdkStyles.sandboxTitle}>🛡️ Security Model</Text>
        <Text style={sdkStyles.sandboxText}>
          All community plugins are audited and run within a restricted JavaScript Virtual Machine. 
          This ensures your private journal data never leaves the device unless explicitly permitted.
        </Text>
      </View>

      <View style={sdkStyles.codeBlock}>
        <Text style={sdkStyles.codeTitle}>// Example: Custom AI workflow</Text>
        <Text style={sdkStyles.code}>{`import { MindMateSDK } from '@mindmate/sdk';

const plugin = MindMateSDK.createPlugin({
  name: 'DailyInsight',
  permissions: ['journal:read', 'ai:generate'],

  async onJournalSave(entry) {
    const insight = await MindMateSDK.ai.complete({
      prompt: \`Analyze this entry: \${entry.content}\`,
      model: 'mindmate-v2',
    });
    return MindMateSDK.ui.showInsight(insight);
  },
});

export default plugin;`}</Text>
      </View>

      <TouchableOpacity style={sdkStyles.docsBtn}>
        <LinearGradient colors={['#10B981', '#06B6D4']} style={sdkStyles.docsBtnGrad}>
          <Text style={sdkStyles.docsBtnText}>📚 Read Full Documentation →</Text>
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const sdkStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },
  content: { padding: Spacing.md },
  back: { marginBottom: Spacing.md },
  backText: { color: Colors.primaryLight, fontSize: 14, fontWeight: '600' },
  hero: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroEmoji: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  apiCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'flex-start',
  },
  apiIcon: { fontSize: 24, marginTop: 2 },
  apiTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark.text, marginBottom: 4 },
  apiDesc: { fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 20 },
  sandboxDetail: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sandboxTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark.text, marginBottom: 8 },
  sandboxText: { fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 20 },
  codeBlock: {
    backgroundColor: '#0D1117',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  codeTitle: { fontSize: 12, color: '#6B7280', marginBottom: 8, fontFamily: 'monospace' },
  code: { fontSize: 12, color: '#E5C07B', fontFamily: 'monospace', lineHeight: 20 },
  docsBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  docsBtnGrad: { padding: Spacing.md, alignItems: 'center' },
  docsBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

// ─── Plugin Card ─────────────────────────────────────────────────────────────

function PluginCard({ plugin, onPress }: { plugin: typeof ALL_PLUGINS[0]; onPress: () => void }) {
  const [installed, setInstalled] = useState(plugin.installed);
  const installAnim = useRef(new Animated.Value(1)).current;

  const handleInstall = () => {
    Animated.sequence([
      Animated.timing(installAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(installAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => setInstalled(!installed));
  };

  return (
    <TouchableOpacity style={styles.pluginCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.pluginCardTop}>
        <View style={styles.pluginIconWrap}>
          <Text style={styles.pluginIcon}>{plugin.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.pluginTitleRow}>
            <Text style={styles.pluginName}>{plugin.name}</Text>
            {plugin.verified && <Text style={styles.verifiedBadge}>✓</Text>}
          </View>
          <Text style={styles.pluginAuthor}>{plugin.author}</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: installAnim }] }}>
          <TouchableOpacity
            style={[styles.installBtn, installed && styles.installedBtn]}
            onPress={handleInstall}
          >
            <Text style={[styles.installBtnText, installed && styles.installedBtnText]}>
              {installed ? '✓ Installed' : plugin.price === 0 ? 'Free' : `$${plugin.price}`}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <Text style={styles.pluginDesc} numberOfLines={2}>{plugin.desc}</Text>
      <View style={styles.pluginMeta}>
        <Text style={styles.pluginRating}>⭐ {plugin.rating}</Text>
        <Text style={styles.pluginDot}>·</Text>
        <Text style={styles.pluginMetaText}>{plugin.reviews.toLocaleString()} reviews</Text>
        <Text style={styles.pluginDot}>·</Text>
        <Text style={styles.pluginMetaText}>{plugin.installs} installs</Text>
      </View>
      <View style={styles.pluginTags}>
        {plugin.tags.map(t => (
          <View key={t} style={styles.tag}>
            <Text style={styles.tagText}>#{t}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

// ─── Plugin Detail Modal ──────────────────────────────────────────────────────

function PluginDetail({ plugin, onClose }: { plugin: typeof ALL_PLUGINS[0] | null; onClose: () => void }) {
  if (!plugin) return null;
  const [installed, setInstalled] = useState(plugin.installed);

  return (
    <Modal visible={!!plugin} animationType="slide" transparent>
      <View style={detailStyles.overlay}>
        <View style={detailStyles.sheet}>
          <View style={detailStyles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={detailStyles.header}>
              <View style={detailStyles.iconLarge}>
                <Text style={{ fontSize: 40 }}>{plugin.icon}</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={detailStyles.name}>{plugin.name}</Text>
                  {plugin.verified && <Text style={styles.verifiedBadge}>✓</Text>}
                </View>
                <Text style={detailStyles.author}>by {plugin.author}</Text>
                <Text style={detailStyles.category}>{plugin.category}</Text>
              </View>
            </View>

            <View style={detailStyles.statsRow}>
              {[
                { label: 'Rating', value: `⭐ ${plugin.rating}` },
                { label: 'Reviews', value: plugin.reviews.toLocaleString() },
                { label: 'Installs', value: plugin.installs },
                { label: 'Price', value: plugin.price === 0 ? 'Free' : `$${plugin.price}` },
              ].map((s, i) => (
                <View key={i} style={detailStyles.statItem}>
                  <Text style={detailStyles.statValue}>{s.value}</Text>
                  <Text style={detailStyles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={detailStyles.sectionTitle}>About</Text>
            <Text style={detailStyles.about}>{plugin.desc} This plugin integrates seamlessly with your MindMate journal, providing enhanced capabilities through our secure sandboxed plugin framework.</Text>

            <Text style={detailStyles.sectionTitle}>Permissions Required</Text>
            {['journal:read', 'mood:write', 'ai:generate'].map(p => (
              <View key={p} style={detailStyles.permRow}>
                <Text style={detailStyles.permIcon}>🔑</Text>
                <Text style={detailStyles.permText}>{p}</Text>
              </View>
            ))}

            <Text style={detailStyles.sectionTitle}>Reviews</Text>
            {[
              { user: 'Alex M.', rating: 5, comment: 'Game changer for my mental health journey!' },
              { user: 'Sarah K.', rating: 4, comment: 'Really useful, would love more customization options.' },
            ].map((r, i) => (
              <View key={i} style={detailStyles.reviewCard}>
                <View style={detailStyles.reviewHeader}>
                  <View style={detailStyles.reviewAvatar}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primary }}>{r.user[0]}</Text>
                  </View>
                  <Text style={detailStyles.reviewUser}>{r.user}</Text>
                  <Text style={detailStyles.reviewRating}>{'⭐'.repeat(r.rating)}</Text>
                </View>
                <Text style={detailStyles.reviewComment}>{r.comment}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={detailStyles.installBtn}
              onPress={() => setInstalled(!installed)}
            >
              <LinearGradient
                colors={installed ? ['#6B7280', '#4B5563'] : ['#8B5CF6', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={detailStyles.installGrad}
              >
                <Text style={detailStyles.installText}>
                  {installed ? '✓ Installed — Tap to Remove' : plugin.price === 0 ? '⬇ Install Free' : `⬇ Buy for $${plugin.price}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={detailStyles.closeBtn} onPress={onClose}>
              <Text style={detailStyles.closeBtnText}>Close</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const detailStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.dark.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.md,
    maxHeight: '92%',
  },
  handle: { width: 40, height: 4, backgroundColor: Colors.dark.muted, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  header: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: Spacing.lg },
  iconLarge: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  name: { fontSize: 20, fontWeight: '800', color: Colors.dark.text },
  author: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4 },
  category: { fontSize: 11, color: Colors.primary, fontWeight: '700', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '800', color: Colors.dark.text },
  statLabel: { fontSize: 10, color: Colors.dark.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark.text, marginBottom: Spacing.sm, marginTop: 4 },
  about: { fontSize: 14, color: Colors.dark.textSecondary, lineHeight: 22, marginBottom: Spacing.md },
  permRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 },
  permIcon: { fontSize: 14 },
  permText: { fontSize: 13, color: Colors.dark.textSecondary, fontFamily: 'monospace' },
  reviewCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewUser: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.dark.text },
  reviewRating: { fontSize: 11 },
  reviewComment: { fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 20 },
  installBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  installGrad: { padding: Spacing.md, alignItems: 'center' },
  installText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  closeBtn: { padding: Spacing.md, alignItems: 'center' },
  closeBtnText: { fontSize: 14, color: Colors.dark.textMuted },
});

// ─── Main Plugin Screen ───────────────────────────────────────────────────────

export default function PluginsScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState<typeof ALL_PLUGINS[0] | null>(null);
  const [activePage, setActivePage] = useState<'marketplace' | 'sdk' | 'installed'>('marketplace');
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const filteredPlugins = ALL_PLUGINS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchSearch;
  });

  const installedPlugins = ALL_PLUGINS.filter(p => p.installed);

  if (activePage === 'sdk') return <SDKScreen onBack={() => setActivePage('marketplace')} />;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <Animated.View style={{ opacity: headerAnim }}>
        <LinearGradient
          colors={['#10B981', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>🧩 Plugin Marketplace</Text>
          <Text style={styles.headerSubtitle}>Extend MindMate with community-built tools</Text>

          {/* Page Tabs */}
          <View style={styles.pageTabs}>
            {(['marketplace', 'installed', 'sdk'] as const).map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.pageTab, activePage === p && styles.pageTabActive]}
                onPress={() => setActivePage(p)}
              >
                <Text style={[styles.pageTabText, activePage === p && styles.pageTabTextActive]}>
                  {p === 'marketplace' ? '🏪 Market' : p === 'installed' ? `⚙️ Installed (${installedPlugins.length})` : '🛠️ SDK'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {activePage === 'installed' ? (
        <ScrollView contentContainerStyle={styles.installedList}>
          <Text style={styles.sectionTitle}>Installed Plugins</Text>
          {installedPlugins.map(p => (
            <PluginCard key={p.id} plugin={p} onPress={() => setSelectedPlugin(p)} />
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search plugins..."
                placeholderTextColor={Colors.dark.textMuted}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            <TouchableOpacity style={styles.filterIconBtn}>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Featured */}
          {!searchText && activeCategory === 'All' && (
            <>
              <Text style={styles.sectionTitle}>⭐ Featured Plugins</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
                {FEATURED_PLUGINS.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedPlugin(p)}
                    activeOpacity={0.9}
                    style={styles.featuredCard}
                  >
                    <LinearGradient colors={p.gradient} style={styles.featuredGrad}>
                      <View style={styles.featuredHeader}>
                        <Text style={styles.featuredIcon}>{p.icon}</Text>
                        {p.verified && (
                          <View style={styles.verifiedChip}>
                            <Text style={styles.verifiedChipText}>✓ Verified</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.featuredName}>{p.name}</Text>
                      <Text style={styles.featuredDesc} numberOfLines={2}>{p.desc}</Text>
                      <View style={styles.featuredFooter}>
                        <Text style={styles.featuredRating}>⭐ {p.rating}</Text>
                        <View style={[styles.featuredPrice, p.installed && styles.featuredPriceInstalled]}>
                          <Text style={styles.featuredPriceText}>
                            {p.installed ? '✓ Installed' : p.price === 0 ? 'Free' : `$${p.price}`}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catBar}
            contentContainerStyle={styles.catContent}
          >
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.catBtn, activeCategory === c && styles.catBtnActive]}
                onPress={() => setActiveCategory(c)}
              >
                <Text style={[styles.catText, activeCategory === c && styles.catTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Plugin Stats Banner */}
          {!searchText && (
            <View style={styles.statsBanner}>
              {[
                { value: '247', label: 'Plugins', icon: '🧩' },
                { value: '14K+', label: 'Installs', icon: '⬇️' },
                { value: '89', label: 'Creators', icon: '👨‍💻' },
              ].map((s, i) => (
                <View key={i} style={styles.statBannerItem}>
                  <Text style={styles.statBannerEmoji}>{s.icon}</Text>
                  <Text style={styles.statBannerValue}>{s.value}</Text>
                  <Text style={styles.statBannerLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Plugin List */}
          <Text style={styles.sectionTitle}>
            {searchText ? `Results for "${searchText}"` : activeCategory === 'All' ? 'All Plugins' : activeCategory}
          </Text>
          <View style={styles.pluginList}>
            {filteredPlugins.map(p => (
              <PluginCard key={p.id} plugin={p} onPress={() => setSelectedPlugin(p)} />
            ))}
          </View>

          {/* Become a Developer CTA */}
          <TouchableOpacity
            style={styles.devCTA}
            onPress={() => setActivePage('sdk')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.devCTAGrad}
            >
              <View>
                <Text style={styles.devCTATitle}>👨‍💻 Build a Plugin</Text>
                <Text style={styles.devCTASub}>Publish to the marketplace & earn from paid sales</Text>
              </View>
              <Text style={styles.devCTAArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      <PluginDetail plugin={selectedPlugin} onClose={() => setSelectedPlugin(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark.bg },

  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.md },

  pageTabs: { flexDirection: 'row', gap: 6 },
  pageTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  pageTabActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  pageTabText: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  pageTabTextActive: { color: '#fff' },

  searchRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: 10,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.dark.text,
    fontSize: 14,
  },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: 4,
  },

  featuredRow: { paddingHorizontal: Spacing.md, gap: 12, paddingBottom: Spacing.sm },
  featuredCard: {
    width: width * 0.7,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  featuredGrad: { padding: Spacing.md, minHeight: 170 },
  featuredHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  featuredIcon: { fontSize: 36 },
  verifiedChip: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  verifiedChipText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  featuredName: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 6 },
  featuredDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 18, marginBottom: 12, flex: 1 },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredRating: { fontSize: 13, color: '#fff', fontWeight: '600' },
  featuredPrice: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featuredPriceInstalled: { backgroundColor: 'rgba(16,185,129,0.4)', borderColor: '#10B981' },
  featuredPriceText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  catBar: { maxHeight: 52 },
  catContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  catBtnActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  catText: { fontSize: 13, color: Colors.dark.textSecondary, fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '700' },

  statsBanner: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  statBannerItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBannerEmoji: { fontSize: 20, marginBottom: 4 },
  statBannerValue: { fontSize: 16, fontWeight: '800', color: Colors.dark.text },
  statBannerLabel: { fontSize: 11, color: Colors.dark.textMuted, marginTop: 2 },

  pluginList: { paddingHorizontal: Spacing.md, gap: Spacing.sm },

  pluginCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  pluginCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  pluginIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.dark.muted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pluginIcon: { fontSize: 26 },
  pluginTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pluginName: { fontSize: 15, fontWeight: '700', color: Colors.dark.text },
  verifiedBadge: {
    fontSize: 11,
    color: Colors.secondary,
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    fontWeight: '700',
    overflow: 'hidden',
  },
  pluginAuthor: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 3 },

  installBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  installedBtn: { backgroundColor: Colors.success + '20', borderWidth: 1, borderColor: Colors.success },
  installBtnText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  installedBtnText: { color: Colors.success },

  pluginDesc: { fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 20, marginBottom: 8 },
  pluginMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  pluginRating: { fontSize: 12, color: Colors.accent, fontWeight: '700' },
  pluginDot: { fontSize: 12, color: Colors.dark.textMuted },
  pluginMetaText: { fontSize: 12, color: Colors.dark.textMuted },
  pluginTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: Colors.dark.muted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  tagText: { fontSize: 11, color: Colors.dark.textSecondary },

  devCTA: { margin: Spacing.md, marginTop: Spacing.sm, borderRadius: Radius.lg, overflow: 'hidden' },
  devCTAGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  devCTATitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  devCTASub: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  devCTAArrow: { fontSize: 28, color: '#fff', fontWeight: '800' },

  installedList: { padding: Spacing.md },
});
