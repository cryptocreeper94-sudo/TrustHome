import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';

type EventType = 'Showing' | 'Open House' | 'Listing Appt' | 'Meeting' | 'Inspection';

interface CalendarEvent {
  id: string;
  day: number;
  month: number;
  year: number;
  time: string;
  type: EventType;
  address: string;
  client: string;
}

const EVENT_COLORS: Record<EventType, string> = {
  'Showing': '#007AFF',
  'Open House': '#34C759',
  'Listing Appt': '#FF9500',
  'Meeting': '#AF52DE',
  'Inspection': '#FF3B30',
};

const EVENT_ICONS: Record<EventType, keyof typeof Ionicons.glyphMap> = {
  'Showing': 'eye-outline',
  'Open House': 'home-outline',
  'Listing Appt': 'document-text-outline',
  'Meeting': 'people-outline',
  'Inspection': 'search-outline',
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENTS: CalendarEvent[] = [
  { id: '1', day: 8, month: 1, year: 2026, time: '10:00 AM', type: 'Showing', address: '1847 Oak Valley Dr', client: 'Sarah Mitchell' },
  { id: '2', day: 8, month: 1, year: 2026, time: '2:30 PM', type: 'Meeting', address: 'Office - Downtown', client: 'James Rivera' },
  { id: '3', day: 10, month: 1, year: 2026, time: '11:00 AM', type: 'Open House', address: '302 Maple Heights Blvd', client: 'Public Event' },
  { id: '4', day: 12, month: 1, year: 2026, time: '9:00 AM', type: 'Inspection', address: '55 Riverside Ln', client: 'Emily Chen' },
  { id: '5', day: 14, month: 1, year: 2026, time: '1:00 PM', type: 'Listing Appt', address: '410 Birch Creek Way', client: 'Lisa Thompson' },
  { id: '6', day: 14, month: 1, year: 2026, time: '4:00 PM', type: 'Showing', address: '88 Lakeview Estates', client: 'Rachel Nguyen' },
  { id: '7', day: 18, month: 1, year: 2026, time: '10:30 AM', type: 'Open House', address: '225 Sunset Ridge', client: 'Public Event' },
  { id: '8', day: 20, month: 1, year: 2026, time: '3:00 PM', type: 'Meeting', address: 'Coffee House on Main', client: 'David Okafor' },
  { id: '9', day: 22, month: 1, year: 2026, time: '9:30 AM', type: 'Showing', address: '1520 Elm St', client: 'Carlos Gutierrez' },
  { id: '10', day: 25, month: 1, year: 2026, time: '11:00 AM', type: 'Inspection', address: '302 Maple Heights Blvd', client: 'James Rivera' },
];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay();
}

export default function ShowingsScreen() {
  const { colors, isDark } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(1);
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(8);
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');

  const today = { day: 8, month: 1, year: 2026 };
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const eventsForMonth = EVENTS.filter(e => e.month === currentMonth && e.year === currentYear);
  const eventDays = new Set(eventsForMonth.map(e => e.day));
  const selectedEvents = eventsForMonth.filter(e => e.day === selectedDay);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(1);
  };

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Calendar" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.viewToggleRow}>
          {(['Month', 'Week', 'Day'] as const).map(mode => (
            <Pressable
              key={mode}
              style={[styles.viewToggle, viewMode === mode && { backgroundColor: colors.primary }]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[styles.viewToggleText, { color: viewMode === mode ? '#FFF' : colors.textSecondary }]}>{mode}</Text>
            </Pressable>
          ))}
        </View>

        <GlassCard style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable onPress={prevMonth} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </Pressable>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
            <Pressable onPress={nextMonth} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.weekHeader}>
            {DAY_NAMES.map(d => (
              <View key={d} style={styles.weekDayCell}>
                <Text style={[styles.weekDayText, { color: colors.textTertiary }]}>{d}</Text>
              </View>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((day, di) => {
                const isToday = day === today.day && currentMonth === today.month && currentYear === today.year;
                const isSelected = day === selectedDay;
                const hasEvents = day !== null && eventDays.has(day);
                return (
                  <Pressable
                    key={di}
                    style={[styles.dayCell, isSelected && { backgroundColor: colors.primary }, isToday && !isSelected && { backgroundColor: colors.primary + '22' }]}
                    onPress={() => day !== null && setSelectedDay(day)}
                    disabled={day === null}
                  >
                    {day !== null && (
                      <>
                        <Text style={[styles.dayText, { color: isSelected ? '#FFF' : isToday ? colors.primary : colors.text }]}>{day}</Text>
                        {hasEvents && (
                          <View style={styles.dotRow}>
                            {eventsForMonth.filter(e => e.day === day).slice(0, 3).map((e, ei) => (
                              <View key={ei} style={[styles.dot, { backgroundColor: isSelected ? '#FFF' : EVENT_COLORS[e.type] }]} />
                            ))}
                          </View>
                        )}
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </GlassCard>

        <View style={styles.legendRow}>
          {(Object.keys(EVENT_COLORS) as EventType[]).map(type => (
            <View key={type} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: EVENT_COLORS[type] }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>{type}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedDay === today.day && currentMonth === today.month ? "Today's Events" : `Events for ${MONTH_NAMES[currentMonth]} ${selectedDay}`}
          </Text>
          <Text style={[styles.eventCount, { color: colors.textSecondary }]}>{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</Text>
        </View>

        {selectedEvents.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <View style={styles.emptyInner}>
              <Ionicons name="calendar-outline" size={36} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No events scheduled</Text>
            </View>
          </GlassCard>
        ) : (
          selectedEvents.map(event => (
            <GlassCard key={event.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <View style={[styles.eventColorBar, { backgroundColor: EVENT_COLORS[event.type] }]} />
                <View style={styles.eventContent}>
                  <View style={styles.eventTopRow}>
                    <View style={[styles.eventTypeBadge, { backgroundColor: EVENT_COLORS[event.type] + '18' }]}>
                      <Ionicons name={EVENT_ICONS[event.type]} size={13} color={EVENT_COLORS[event.type]} />
                      <Text style={[styles.eventTypeText, { color: EVENT_COLORS[event.type] }]}>{event.type}</Text>
                    </View>
                    <Text style={[styles.eventTime, { color: colors.textSecondary }]}>{event.time}</Text>
                  </View>
                  <Text style={[styles.eventAddress, { color: colors.text }]}>{event.address}</Text>
                  <View style={styles.eventClientRow}>
                    <Ionicons name="person-outline" size={13} color={colors.textTertiary} />
                    <Text style={[styles.eventClient, { color: colors.textTertiary }]}>{event.client}</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          ))
        )}

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingHorizontal: 16 },
  viewToggleRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 12 },
  viewToggle: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 18 },
  viewToggleText: { fontSize: 13, fontWeight: '600' as const },
  calendarCard: { minHeight: 300, marginBottom: 12 },
  monthHeader: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: 12 },
  navBtn: { width: 36, height: 36, alignItems: 'center' as const, justifyContent: 'center' as const, borderRadius: 18 },
  monthTitle: { fontSize: 18, fontWeight: '700' as const },
  weekHeader: { flexDirection: 'row', marginBottom: 6 },
  weekDayCell: { flex: 1, alignItems: 'center' as const, paddingVertical: 4 },
  weekDayText: { fontSize: 12, fontWeight: '600' as const },
  weekRow: { flexDirection: 'row' },
  dayCell: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: 8, borderRadius: 10, minHeight: 42 },
  dayText: { fontSize: 14, fontWeight: '500' as const },
  dotRow: { flexDirection: 'row', gap: 3, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 12, marginBottom: 16, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center' as const, gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '500' as const },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const },
  eventCount: { fontSize: 13 },
  emptyCard: { minHeight: 100 },
  emptyInner: { alignItems: 'center' as const, justifyContent: 'center' as const, gap: 8, paddingVertical: 16 },
  emptyText: { fontSize: 14 },
  eventCard: { minHeight: 60, marginBottom: 10 },
  eventRow: { flexDirection: 'row', gap: 12 },
  eventColorBar: { width: 4, borderRadius: 2, minHeight: 50 },
  eventContent: { flex: 1 },
  eventTopRow: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: 4 },
  eventTypeBadge: { flexDirection: 'row', alignItems: 'center' as const, gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  eventTypeText: { fontSize: 11, fontWeight: '600' as const },
  eventTime: { fontSize: 13, fontWeight: '500' as const },
  eventAddress: { fontSize: 14, fontWeight: '600' as const, marginBottom: 4 },
  eventClientRow: { flexDirection: 'row', alignItems: 'center' as const, gap: 4 },
  eventClient: { fontSize: 12 },
});
