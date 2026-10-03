import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { SampleDataBanner } from '@/components/ui/SampleDataBanner';
import { useTenantList, apiErrorMessage } from '@/lib/tenant-api';

type Priority = 'High' | 'Medium' | 'Low' | 'Normal';

interface Task {
  id: string;
  title: string;
  priority: Priority;
  dueAt: string | null;
  completed: boolean;
}

const TEAL = '#1A8A7E';

const SAMPLE_TASKS: Task[] = [
  { id: 's1', title: 'Call Sarah Jensen regarding home inspection', priority: 'High', dueAt: 'Today 9:30 AM', completed: true },
  { id: 's2', title: 'Send welcome email to John Davies', priority: 'Medium', dueAt: 'Today 10:45 AM', completed: false },
  { id: 's3', title: 'Prepare CMA for 123 Maple St (listing)', priority: 'High', dueAt: 'Today 1:00 PM', completed: false },
  { id: 's4', title: 'Schedule showing for 789 Oak Ave', priority: 'Low', dueAt: 'Tomorrow', completed: false },
  { id: 's5', title: 'Update client notes for Mark Thompson', priority: 'Normal', dueAt: 'Friday', completed: false },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  High: '#EF4444',
  Medium: '#FBBF24',
  Low: '#10B981',
  Normal: '#3B82F6',
};

const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Normal: 2, Low: 3 };

export default function TasksScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const { colors, isDark } = useTheme();
  const api = useTenantList<Task>('/api/tasks');
  const [sample, setSample] = useState<Task[]>(SAMPLE_TASKS);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('Normal');
  const [due, setDue] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');

  const tasks = useMemo(() => {
    const list = api.isLive ? api.items : sample;
    return [...list].sort((a, b) => Number(a.completed) - Number(b.completed) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [api.isLive, api.items, sample]);

  const completedCount = tasks.filter(t => t.completed).length;
  const openCount = tasks.length - completedCount;

  const toggleTask = async (t: Task) => {
    setPageError('');
    if (!api.isLive) { setSample(prev => prev.map(x => x.id === t.id ? { ...x, completed: !x.completed } : x)); return; }
    try { await api.update.mutateAsync({ id: t.id, completed: !t.completed }); } catch (e) { setPageError(apiErrorMessage(e)); }
  };

  const removeTask = async (t: Task) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.confirm(`Delete "${t.title}"?`)) return;
    setPageError('');
    if (!api.isLive) { setSample(prev => prev.filter(x => x.id !== t.id)); return; }
    try { await api.remove.mutateAsync(t.id); } catch (e) { setPageError(apiErrorMessage(e)); }
  };

  const addTask = async () => {
    if (!title.trim()) { setFormError('What needs to get done?'); return; }
    setSaving(true); setFormError('');
    try {
      const body = { title: title.trim(), priority, dueAt: due.trim() || null, completed: false };
      if (api.isLive) await api.create.mutateAsync(body);
      else setSample(prev => [...prev, { id: `s${Date.now()}`, ...body }]);
      setShowAdd(false); setTitle(''); setPriority('Normal'); setDue('');
    } catch (e) { setFormError(apiErrorMessage(e)); } finally { setSaving(false); }
  };

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header imageBanner={require('@/assets/images/guide-crm.jpg')} title="Tasks & To-Do" subtitle="Stay organized · Never miss a deadline" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />

        <SampleDataBanner live={api.isLive} count={tasks.length} noun="tasks" />

        <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF', borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>TO-DO ({openCount} OPEN)</Text>
            <Pressable style={styles.addBtn} onPress={() => { setFormError(''); setShowAdd(true); }} testID="tasks-add-btn">
              <Ionicons name="add" size={16} color="#FFF" />
              <Text style={styles.addBtnText}>Add Task</Text>
            </Pressable>
          </View>

          {pageError ? <Text style={{ color: '#F87171', marginBottom: 10 }}>{pageError}</Text> : null}
          {api.isLoading ? <ActivityIndicator color={TEAL} style={{ marginVertical: 20 }} /> : null}
          {!api.isLoading && tasks.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 24, gap: 6 }}>
              <Ionicons name="checkmark-done-circle-outline" size={36} color={TEAL} />
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Nothing on your list</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Tap "Add Task" to add your first to-do.</Text>
            </View>
          ) : null}

          {tasks.map((task) => (
            <View key={task.id} style={[styles.taskRow, { borderBottomColor: colors.divider }]}>
              <Pressable onPress={() => toggleTask(task)} hitSlop={8} style={[styles.checkbox, task.completed ? { backgroundColor: TEAL, borderColor: TEAL } : { borderColor: colors.textSecondary }]} testID={`task-toggle-${task.id}`}>
                {task.completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </Pressable>
              <Pressable onPress={() => toggleTask(task)} style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, { color: task.completed ? colors.textSecondary : colors.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>
                  {task.title}
                </Text>
                <View style={styles.metaRow}>
                  <View style={[styles.priorityBadge, { borderColor: PRIORITY_COLORS[task.priority] }]}>
                    <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>{task.priority.toUpperCase()}</Text>
                  </View>
                  {task.dueAt ? <Text style={[styles.taskTime, { color: colors.textTertiary }]}>{task.dueAt}</Text> : null}
                </View>
              </Pressable>
              <Pressable onPress={() => removeTask(task)} hitSlop={8} style={{ padding: 6 }} testID={`task-delete-${task.id}`}>
                <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
          ))}

          <View style={styles.cardFooter}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{tasks.length} tasks</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: 'bold' }}>COMPLETED: {completedCount}/{tasks.length}</Text>
          </View>
        </View>

        <Footer />
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1A1D24' : '#FFF', borderColor: colors.border }]}>
            <View style={styles.modalHead}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Task</Text>
              <Pressable onPress={() => setShowAdd(false)}><Ionicons name="close" size={24} color={colors.textSecondary} /></Pressable>
            </View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>What needs to get done?</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Call the lender about Sarah's pre-approval" placeholderTextColor={colors.textTertiary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]} testID="task-title" />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {(['High', 'Medium', 'Normal', 'Low'] as Priority[]).map(p => (
                <Pressable key={p} onPress={() => setPriority(p)} style={[styles.chip, { borderColor: PRIORITY_COLORS[p], backgroundColor: priority === p ? PRIORITY_COLORS[p] : 'transparent' }]}>
                  <Text style={{ color: priority === p ? '#FFF' : PRIORITY_COLORS[p], fontWeight: '700', fontSize: 12 }}>{p}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>When? (optional)</Text>
            <TextInput value={due} onChangeText={setDue} placeholder="e.g. Tomorrow 2pm" placeholderTextColor={colors.textTertiary}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]} testID="task-due" />
            {formError ? <Text style={{ color: '#F87171', marginTop: 8 }}>{formError}</Text> : null}
            <Pressable style={styles.saveBtn} onPress={addTask} disabled={saving} testID="task-save">
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>Add Task</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>

      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.tasks?.title ?? 'Tasks & To-Do'}
        description={SCREEN_HELP.tasks?.description ?? 'Keep track of everything you need to do. Tap a task to check it off.'}
        details={SCREEN_HELP.tasks?.details}
        examples={SCREEN_HELP.tasks?.examples}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', padding: 20, marginTop: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: TEAL, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 15, fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  priorityBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  priorityText: { fontSize: 10, fontWeight: 'bold' },
  taskTime: { fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modal: { borderRadius: 16, borderWidth: 1, padding: 18, maxWidth: 520, width: '100%', alignSelf: 'center' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, borderWidth: 1 },
  saveBtn: { marginTop: 18, backgroundColor: TEAL, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
});
