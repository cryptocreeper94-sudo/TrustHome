import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';

interface Task {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low' | 'Normal';
  time: string;
  completed: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Call Sarah Jensen regarding home inspection', priority: 'High', time: '9:30 AM', completed: true },
  { id: '2', title: 'Send Welcome Email to John Davies', priority: 'Medium', time: '10:45 AM', completed: false },
  { id: '3', title: 'Prepare CMA for 123 Maple St (Listing)', priority: 'High', time: '1:00 PM', completed: false },
  { id: '4', title: 'Schedule showing for listing 789 Oak Ave', priority: 'Low', time: '2:15 PM', completed: false },
  { id: '5', title: 'Update client notes for Mark Thompson', priority: 'Normal', time: '3:30 PM', completed: false },
];

const PRIORITY_COLORS = {
  High: '#EF4444',
  Medium: '#FBBF24',
  Low: '#10B981',
  Normal: '#3B82F6'
};

export default function TasksScreen() {
  const { colors, isDark } = useTheme();
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <Header title="Tasks & To-Do" showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF', borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>DAILY TASKS ({tasks.length} ACTIVE)</Text>
            <Pressable style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add New Task +</Text>
            </Pressable>
          </View>

          {tasks.map((task) => (
            <Pressable key={task.id} onPress={() => toggleTask(task.id)} style={[styles.taskRow, { borderBottomColor: colors.divider }]}>
              <View style={[styles.checkbox, task.completed ? { backgroundColor: colors.primary, borderColor: colors.primary } : { borderColor: colors.textSecondary }]}>
                {task.completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
              <Text style={[styles.taskTitle, { color: task.completed ? colors.textSecondary : colors.text, textDecorationLine: task.completed ? 'line-through' : 'none' }]}>
                {task.title}
              </Text>
              
              <View style={[styles.priorityBadge, { borderColor: PRIORITY_COLORS[task.priority] }]}>
                <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>{task.priority.toUpperCase()} PRIORITY</Text>
              </View>
              <Text style={[styles.taskTime, { color: colors.textTertiary }]}>{task.time}</Text>
            </Pressable>
          ))}

          <View style={styles.cardFooter}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Showing {tasks.length} tasks</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: 'bold' }}>COMPLETED: {completedCount}/{tasks.length}</Text>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  addBtn: { borderWidth: 1, borderColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  taskTitle: { flex: 1, fontSize: 15, fontWeight: '500' },
  priorityBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 12 },
  priorityText: { fontSize: 10, fontWeight: 'bold' },
  taskTime: { fontSize: 13, width: 60, textAlign: 'right' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }
});
