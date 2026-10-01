import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { AccordionSection } from '@/components/ui/AccordionSection';

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

let EVENTS: CalendarEvent[] = [];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay();
}

export default function ShowingsScreen() {
  const { colors, isDark } = useTheme();
  const now = new Date();
  const [events, setEvents] = useState(EVENTS);
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ address: '', client: '', time: '10:00 AM', type: 'Showing' as EventType });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const eventsForMonth = events.filter(e => e.month === currentMonth && e.year === currentYear);
  const eventDays = new Set(eventsForMonth.map(e => e.day));
  const selectedEvents = eventsForMonth.filter(e => e.day === selectedDay);

  const totalEvents = events.length;
  const upcomingCount = useMemo(() => {
    const todayDate = new Date(today.year, today.month, today.day);
    const weekLater = new Date(todayDate);
    weekLater.setDate(weekLater.getDate() + 7);
    return events.filter(e => {
      const eDate = new Date(e.year, e.month, e.day);
      return eDate >= todayDate && eDate <= weekLater;
    }).length;
  }, [events]);
  const uniqueTypes = new Set(events.map(e => e.type)).size;

  const upcomingEvents = useMemo(() => {
    const todayDate = new Date(today.year, today.month, today.day);
    return events
      .filter(e => {
        const eDate = new Date(e.year, e.month, e.day);
        return eDate >= todayDate;
      })
      .sort((a, b) => {
        const dA = new Date(a.year, a.month, a.day);
        const dB = new Date(b.year, b.month, b.day);
        return dA.getTime() - dB.getTime();
      })
      .slice(0, 5);
  }, [events]);

  const eventsByType = useMemo(() => {
    const grouped: Partial<Record<EventType, CalendarEvent[]>> = {};
    for (const e of selectedEvents) {
      if (!grouped[e.type]) grouped[e.type] = [];
      grouped[e.type]!.push(e);
    }
    return grouped;
  }, [selectedEvents]);

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

  const handleAddEvent = () => {
    if (!newEvent.address || !newEvent.client) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const e: CalendarEvent = {
        id: Math.random().toString(),
        day: selectedDay,
        month: currentMonth,
        year: currentYear,
        time: newEvent.time,
        type: newEvent.type,
        address: newEvent.address,
        client: newEvent.client
      };
      EVENTS.push(e);
      setEvents([...EVENTS]);
      setShowAddModal(false);
      setNewEvent({ address: '', client: '', time: '10:00 AM', type: 'Showing' });
      setIsSubmitting(false);
    }, 500);
  };

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  const typesWithEvents = Object.keys(eventsByType) as EventType[];

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header imageBanner={require('@/assets/images/guide-showings.jpg')} 
          title="Calendar" 
          subtitle="Showings · Open houses · Appointments"
          showBack 
          rightAction={
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Pressable onPress={() => setShowAddModal(true)} style={[styles.headerAddBtn, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="add" size={20} color={colors.primary} />
                <Text style={[styles.headerAddText, { color: colors.primary }]}>Add</Text>
              </Pressable>
              <InfoButton onPress={() => setShowHelp(true)} />
            </View>
          } 
        />

        <BentoGrid columns={3} gap={10}>
          <GlassCard compact style={styles.statCard}>
            <View style={styles.statInner}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{totalEvents}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Events</Text>
            </View>
          </GlassCard>
          <GlassCard compact style={styles.statCard}>
            <View style={styles.statInner}>
              <Ionicons name="time-outline" size={20} color="#34C759" />
              <Text style={[styles.statValue, { color: colors.text }]}>{upcomingCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Upcoming</Text>
            </View>
          </GlassCard>
          <GlassCard compact style={styles.statCard}>
            <View style={styles.statInner}>
              <Ionicons name="layers-outline" size={20} color="#FF9500" />
              <Text style={[styles.statValue, { color: colors.text }]}>{uniqueTypes}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Event Types</Text>
            </View>
          </GlassCard>
        </BentoGrid>

        <HorizontalCarousel title="Upcoming" itemWidth={180}>
          {upcomingEvents.map(event => (
            <GlassCard key={event.id} compact style={styles.carouselCard}>
              <View style={[styles.carouselBadge, { backgroundColor: EVENT_COLORS[event.type] + '18' }]}>
                <Ionicons name={EVENT_ICONS[event.type]} size={12} color={EVENT_COLORS[event.type]} />
                <Text style={[styles.carouselBadgeText, { color: EVENT_COLORS[event.type] }]}>{event.type}</Text>
              </View>
              <Text style={[styles.carouselTime, { color: colors.text }]}>{event.time}</Text>
              <Text style={[styles.carouselAddress, { color: colors.textSecondary }]} numberOfLines={2}>{event.address}</Text>
            </GlassCard>
          ))}
        </HorizontalCarousel>

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

        <AccordionSection title="Calendar" icon="calendar" iconColor="#1A8A7E" defaultOpen={true}>
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
        </AccordionSection>

        <AccordionSection title="Event Legend" icon="color-palette" iconColor="#AF52DE">
          <View style={styles.legendRow}>
            {(Object.keys(EVENT_COLORS) as EventType[]).map(type => (
              <View key={type} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: EVENT_COLORS[type] }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>{type}</Text>
              </View>
            ))}
          </View>
        </AccordionSection>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedDay === today.day && currentMonth === today.month ? "Today's Events" : `Events for ${MONTH_NAMES[currentMonth]} ${selectedDay}`}
          </Text>
          <Text style={[styles.eventCount, { color: colors.textSecondary }]}>{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</Text>
        </View>

        {selectedEvents.length === 0 ? (
          <View style={styles.emptyInner}>
            <Ionicons name="calendar-outline" size={36} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No events scheduled</Text>
          </View>
        ) : typesWithEvents.length === 1 ? (
          <AccordionSection
            title={typesWithEvents[0] + 's'}
            icon={EVENT_ICONS[typesWithEvents[0]]}
            iconColor={EVENT_COLORS[typesWithEvents[0]]}
            badge={eventsByType[typesWithEvents[0]]!.length}
            badgeColor={EVENT_COLORS[typesWithEvents[0]]}
            defaultOpen={true}
          >
            {eventsByType[typesWithEvents[0]]!.map(event => (
              <View key={event.id} style={styles.eventCard}>
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
              </View>
            ))}
          </AccordionSection>
        ) : (
          typesWithEvents.map(type => (
            <AccordionSection
              key={type}
              title={type + 's'}
              icon={EVENT_ICONS[type]}
              iconColor={EVENT_COLORS[type]}
              badge={eventsByType[type]!.length}
              badgeColor={EVENT_COLORS[type]}
              defaultOpen={true}
            >
              {eventsByType[type]!.map(event => (
                <View key={event.id} style={styles.eventCard}>
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
                </View>
              ))}
            </AccordionSection>
          ))
        )}

        <Footer />
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1A1D24' : '#FFF', borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Event</Text>
              <Pressable onPress={() => setShowAddModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Event Type</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {(Object.keys(EVENT_COLORS) as EventType[]).map(t => (
                    <Pressable key={t} onPress={() => setNewEvent({...newEvent, type: t})} style={[styles.stageSelectBtn, { backgroundColor: newEvent.type === t ? EVENT_COLORS[t] : 'transparent', borderColor: EVENT_COLORS[t] }]}>
                      <Text style={{ color: newEvent.type === t ? '#FFF' : EVENT_COLORS[t], fontSize: 12, fontWeight: '600' }}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Address / Location</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newEvent.address} onChangeText={t => setNewEvent({...newEvent, address: t})} placeholder="123 Main St" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Client</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newEvent.client} onChangeText={t => setNewEvent({...newEvent, client: t})} placeholder="John Doe" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Time</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newEvent.time} onChangeText={t => setNewEvent({...newEvent, time: t})} placeholder="10:00 AM" placeholderTextColor={colors.textTertiary} />
              </View>
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.divider }]}>
              <Pressable style={[styles.modalBtn, { backgroundColor: isDark ? '#0B1021' : colors.backgroundTertiary }]} onPress={() => setShowAddModal(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleAddEvent} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Add Event</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.showings.title}
        description={SCREEN_HELP.showings.description}
        details={SCREEN_HELP.showings.details}
        examples={SCREEN_HELP.showings.examples}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingHorizontal: 16 },
  statCard: { minHeight: 80 },
  statInner: { alignItems: 'center' as const, justifyContent: 'center' as const, gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' as const },
  statLabel: { fontSize: 11, fontWeight: '500' as const },
  carouselCard: { width: 180, minHeight: 90 },
  carouselBadge: { flexDirection: 'row', alignItems: 'center' as const, gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' as const, marginBottom: 6 },
  carouselBadgeText: { fontSize: 11, fontWeight: '600' as const },
  carouselTime: { fontSize: 14, fontWeight: '700' as const, marginBottom: 2 },
  carouselAddress: { fontSize: 12, fontWeight: '400' as const },
  viewToggleRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 12 },
  viewToggle: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 18 },
  viewToggleText: { fontSize: 13, fontWeight: '600' as const },
  monthHeader: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: 12, marginTop: 4 },
  navBtn: { width: 36, height: 36, alignItems: 'center' as const, justifyContent: 'center' as const, borderRadius: 18 },
  monthTitle: { fontSize: 18, fontWeight: '700' as const },
  weekHeader: { flexDirection: 'row', marginBottom: 6 },
  weekDayCell: { flex: 1, alignItems: 'center' as const, paddingVertical: 4 },
  weekDayText: { fontSize: 12, fontWeight: '600' as const },
  weekRow: { flexDirection: 'row' },
  dayCell: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: 8, borderRadius: 10, minHeight: 44 },
  dayText: { fontSize: 14, fontWeight: '500' as const },
  dotRow: { flexDirection: 'row', gap: 3, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 12, paddingVertical: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center' as const, gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '500' as const },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const },
  eventCount: { fontSize: 13 },
  emptyInner: { alignItems: 'center' as const, justifyContent: 'center' as const, gap: 8, paddingVertical: 24 },
  emptyText: { fontSize: 14 },
  eventCard: { marginBottom: 10 },
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
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  headerAddText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  stageSelectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnText: {
    fontWeight: '600' as const,
    fontSize: 14,
  },
});
