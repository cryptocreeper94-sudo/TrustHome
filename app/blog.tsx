import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { apiRequest } from '@/lib/query-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TABS = ['Posts', 'Create', 'AI Generate'] as const;
type Tab = typeof TABS[number];

const CATEGORIES = [
  'market-insights',
  'home-buying',
  'home-selling',
  'investment',
  'neighborhood',
  'technology',
  'mortgage',
  'staging',
];

const TONES = ['professional', 'casual', 'educational', 'inspirational'];

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  authorName: string;
  status: string;
  createdAt: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BlogScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('Posts');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [topic, setTopic] = useState('');
  const [aiCategory, setAiCategory] = useState(CATEGORIES[0]);
  const [aiTone, setAiTone] = useState(TONES[0]);
  const [generatedPost, setGeneratedPost] = useState<any>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showFormCategoryPicker, setShowFormCategoryPicker] = useState(false);
  const [showTonePicker, setShowTonePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const { data: posts, isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/admin/posts'],
  });

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PUT', `/api/blog/admin/posts/${id}`, { status: 'published' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/admin/posts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/blog/admin/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/admin/posts'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingPost) {
        await apiRequest('PUT', `/api/blog/admin/posts/${editingPost.id}`, data);
      } else {
        await apiRequest('POST', '/api/blog/admin/posts', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/admin/posts'] });
      resetForm();
      setActiveTab('Posts');
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { topic: string; category: string; tone: string }) => {
      const res = await apiRequest('POST', '/api/blog/admin/generate', data);
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedPost(data);
    },
  });

  const resetForm = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCategory(CATEGORIES[0]);
    setTags('');
    setAuthorName('');
    setStatus('draft');
  };

  const openEditForm = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title || '');
    setSlug(post.slug || '');
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setCategory(post.category || CATEGORIES[0]);
    setTags(post.tags || '');
    setAuthorName(post.authorName || '');
    setStatus((post.status as 'draft' | 'published') || 'draft');
    setActiveTab('Create');
  };

  const openEditFromGenerated = (data: any) => {
    setEditingPost(null);
    setTitle(data.title || '');
    setSlug(slugify(data.title || ''));
    setExcerpt(data.excerpt || '');
    setContent(data.content || '');
    setCategory(data.category || CATEGORIES[0]);
    setTags(Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''));
    setAuthorName(data.authorName || '');
    setStatus('draft');
    setActiveTab('Create');
  };

  const publishGenerated = async (data: any) => {
    try {
      await apiRequest('POST', '/api/blog/admin/posts', {
        title: data.title,
        slug: slugify(data.title || ''),
        excerpt: data.excerpt,
        content: data.content,
        category: data.category || aiCategory,
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
        authorName: data.authorName || 'TrustHome',
        status: 'published',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/admin/posts'] });
      setGeneratedPost(null);
      setActiveTab('Posts');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleSubmitForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    createMutation.mutate({
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      category,
      tags,
      authorName,
      status,
    });
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (!editingPost) {
      setSlug(slugify(text));
    }
  };

  const statusBadgeColor = (s: string) => {
    if (s === 'published') return '#1A8A7E';
    if (s === 'draft') return '#F59E0B';
    return '#9CA3AF';
  };

  const renderPicker = (
    visible: boolean,
    onClose: () => void,
    items: string[],
    selected: string,
    onSelect: (val: string) => void,
  ) => {
    if (!visible) return null;
    return (
      <View style={[styles.pickerDropdown, { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider }]}>
        {items.map((item) => (
          <Pressable
            key={item}
            onPress={() => { onSelect(item); onClose(); }}
            style={[styles.pickerItem, selected === item && { backgroundColor: colors.primary + '20' }]}
          >
            <Text style={[styles.pickerItemText, { color: selected === item ? colors.primary : colors.text }]}>{item}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderPostsTab = () => (
    <View style={styles.section}>
      {postsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading posts...</Text>
        </View>
      ) : !posts || posts.length === 0 ? (
        <GlassCard>
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Posts Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Create your first blog post or use AI to generate one.</Text>
          </View>
        </GlassCard>
      ) : (
        posts.map((post) => (
          <GlassCard key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={2}>{post.title}</Text>
                <View style={styles.postMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: statusBadgeColor(post.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: statusBadgeColor(post.status) }]}>{post.status}</Text>
                  </View>
                  <Text style={[styles.postCategory, { color: colors.textSecondary }]}>{post.category}</Text>
                </View>
              </View>
            </View>
            <View style={styles.postInfo}>
              <Text style={[styles.postDate, { color: colors.textSecondary }]}>
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
              </Text>
              {post.authorName ? (
                <Text style={[styles.postAuthor, { color: colors.textSecondary }]}>by {post.authorName}</Text>
              ) : null}
            </View>
            <View style={styles.postActions}>
              {post.status === 'draft' && (
                <Pressable
                  testID={`publish-post-${post.id}`}
                  onPress={() => publishMutation.mutate(post.id)}
                  style={[styles.actionButton, { backgroundColor: '#1A8A7E' }]}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
                  <Text style={styles.actionButtonText}>Publish</Text>
                </Pressable>
              )}
              <Pressable
                testID={`edit-post-${post.id}`}
                onPress={() => openEditForm(post)}
                style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
              >
                <Ionicons name="create-outline" size={16} color={colors.primary} />
                <Text style={[styles.actionButtonTextDark, { color: colors.primary }]}>Edit</Text>
              </Pressable>
              <Pressable
                testID={`delete-post-${post.id}`}
                onPress={() => handleDelete(post.id)}
                style={[styles.actionButton, { backgroundColor: '#EF444420' }]}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={[styles.actionButtonTextDark, { color: '#EF4444' }]}>Delete</Text>
              </Pressable>
            </View>
          </GlassCard>
        ))
      )}
    </View>
  );

  const renderCreateTab = () => (
    <View style={styles.section}>
      <GlassCard>
        <Text style={[styles.formTitle, { color: colors.text }]}>
          {editingPost ? 'Edit Post' : 'Create New Post'}
        </Text>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Title</Text>
        <TextInput
          testID="blog-title-input"
          style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
          value={title}
          onChangeText={handleTitleChange}
          placeholder="Enter post title"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Slug</Text>
        <TextInput
          testID="blog-slug-input"
          style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
          value={slug}
          onChangeText={setSlug}
          placeholder="auto-generated-from-title"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Excerpt</Text>
        <TextInput
          testID="blog-excerpt-input"
          style={[styles.input, styles.multilineInput, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
          value={excerpt}
          onChangeText={setExcerpt}
          placeholder="Brief description of the post"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={3}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Content</Text>
        <TextInput
          testID="blog-content-input"
          style={[styles.input, styles.contentInput, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
          value={content}
          onChangeText={setContent}
          placeholder="Write your blog post content (HTML supported)"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={8}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category</Text>
        <Pressable
          testID="blog-category-picker"
          onPress={() => setShowFormCategoryPicker(!showFormCategoryPicker)}
          style={[styles.pickerButton, { backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>{category}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>
        {renderPicker(showFormCategoryPicker, () => setShowFormCategoryPicker(false), CATEGORIES, category, setCategory)}

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tags (comma separated)</Text>
        <TextInput
          testID="blog-tags-input"
          style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
          value={tags}
          onChangeText={setTags}
          placeholder="real-estate, market, tips"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Author Name</Text>
        <TextInput
          testID="blog-author-input"
          style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
          value={authorName}
          onChangeText={setAuthorName}
          placeholder="Author name"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Status</Text>
        <Pressable
          testID="blog-status-picker"
          onPress={() => setShowStatusPicker(!showStatusPicker)}
          style={[styles.pickerButton, { backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>{status}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>
        {renderPicker(showStatusPicker, () => setShowStatusPicker(false), ['draft', 'published'], status, (val) => setStatus(val as 'draft' | 'published'))}

        <View style={styles.formActions}>
          {editingPost && (
            <Pressable
              testID="blog-cancel-edit"
              onPress={resetForm}
              style={[styles.formButton, { backgroundColor: colors.backgroundTertiary }]}
            >
              <Text style={[styles.formButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            testID="blog-submit"
            onPress={handleSubmitForm}
            style={[styles.formButton, styles.submitButton, { backgroundColor: colors.primary }]}
          >
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name={editingPost ? 'save-outline' : 'add-circle-outline'} size={18} color="#FFF" />
                <Text style={styles.submitButtonText}>{editingPost ? 'Update Post' : 'Create Post'}</Text>
              </>
            )}
          </Pressable>
        </View>
      </GlassCard>
    </View>
  );

  const renderAiTab = () => (
    <View style={styles.section}>
      <GlassCard>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={24} color={colors.primary} />
          <Text style={[styles.formTitle, { color: colors.text, marginLeft: 8 }]}>AI Blog Generator</Text>
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Topic</Text>
        <TextInput
          testID="ai-topic-input"
          style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
          value={topic}
          onChangeText={setTopic}
          placeholder="e.g., Spring home buying tips for first-time buyers"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category</Text>
        <Pressable
          testID="ai-category-picker"
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          style={[styles.pickerButton, { backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>{aiCategory}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>
        {renderPicker(showCategoryPicker, () => setShowCategoryPicker(false), CATEGORIES, aiCategory, setAiCategory)}

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tone</Text>
        <Pressable
          testID="ai-tone-picker"
          onPress={() => setShowTonePicker(!showTonePicker)}
          style={[styles.pickerButton, { backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>{aiTone}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>
        {renderPicker(showTonePicker, () => setShowTonePicker(false), TONES, aiTone, setAiTone)}

        <Pressable
          testID="ai-generate-button"
          onPress={() => {
            if (!topic.trim()) {
              Alert.alert('Error', 'Topic is required');
              return;
            }
            generateMutation.mutate({ topic, category: aiCategory, tone: aiTone });
          }}
          style={[styles.formButton, styles.submitButton, { backgroundColor: colors.primary, marginTop: 16 }]}
        >
          {generateMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#FFF" />
              <Text style={styles.submitButtonText}>Generate</Text>
            </>
          )}
        </Pressable>
      </GlassCard>

      {generateMutation.isPending && (
        <GlassCard style={styles.generatingCard}>
          <View style={styles.generatingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.generatingText, { color: colors.text }]}>Generating your blog post...</Text>
            <Text style={[styles.generatingSubtext, { color: colors.textSecondary }]}>This may take a moment</Text>
          </View>
        </GlassCard>
      )}

      {generatedPost && !generateMutation.isPending && (
        <GlassCard style={styles.generatedCard}>
          <View style={styles.generatedHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#1A8A7E" />
            <Text style={[styles.generatedLabel, { color: '#1A8A7E' }]}>Generated Successfully</Text>
          </View>
          <Text style={[styles.generatedTitle, { color: colors.text }]}>{generatedPost.title}</Text>
          {generatedPost.excerpt ? (
            <Text style={[styles.generatedExcerpt, { color: colors.textSecondary }]}>{generatedPost.excerpt}</Text>
          ) : null}
          <View style={[styles.generatedContentPreview, { backgroundColor: colors.backgroundTertiary, borderColor: colors.divider }]}>
            <Text style={[styles.generatedContent, { color: colors.text }]} numberOfLines={12}>
              {(generatedPost.content || '').replace(/<[^>]*>/g, '')}
            </Text>
          </View>
          <View style={styles.generatedActions}>
            <Pressable
              testID="ai-publish-button"
              onPress={() => publishGenerated(generatedPost)}
              style={[styles.formButton, styles.submitButton, { backgroundColor: '#1A8A7E' }]}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
              <Text style={styles.submitButtonText}>Publish</Text>
            </Pressable>
            <Pressable
              testID="ai-edit-button"
              onPress={() => openEditFromGenerated(generatedPost)}
              style={[styles.formButton, { backgroundColor: colors.backgroundTertiary }]}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
              <Text style={[styles.formButtonText, { color: colors.primary }]}>Edit</Text>
            </Pressable>
          </View>
        </GlassCard>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Blog Management" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              testID={`blog-tab-${tab.toLowerCase().replace(' ', '-')}`}
              onPress={() => {
                if (tab === 'Create' && activeTab !== 'Create') {
                  resetForm();
                }
                setActiveTab(tab);
              }}
              style={[
                styles.tabPill,
                activeTab === tab
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.backgroundSecondary, borderColor: colors.divider, borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.tabPillText,
                  { color: activeTab === tab ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'Posts' && renderPostsTab()}
        {activeTab === 'Create' && renderCreateTab()}
        {activeTab === 'AI Generate' && renderAiTab()}

        <Footer />
      </ScrollView>
      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.blog.title}
        description={SCREEN_HELP.blog.description}
        details={SCREEN_HELP.blog.details}
        examples={SCREEN_HELP.blog.examples}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 34 : 20,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 16,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabPillText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  section: {
    gap: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  postCard: {
    minHeight: 80,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  postCategory: {
    fontSize: 12,
  },
  postInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  postDate: {
    fontSize: 12,
  },
  postAuthor: {
    fontSize: 12,
  },
  postActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  actionButtonTextDark: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  contentInput: {
    minHeight: 160,
    textAlignVertical: 'top',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerButtonText: {
    fontSize: 14,
  },
  pickerDropdown: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerItemText: {
    fontSize: 14,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  formButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
  },
  formButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  submitButton: {
    flex: 2,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  generatingCard: {
    minHeight: 120,
  },
  generatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  generatingText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  generatingSubtext: {
    fontSize: 13,
  },
  generatedCard: {
    minHeight: 80,
  },
  generatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  generatedLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  generatedTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  generatedExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  generatedContentPreview: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  generatedContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  generatedActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
