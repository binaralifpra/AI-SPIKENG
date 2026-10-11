import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/user_data.dart';
import '../config/theme.dart';

class TrainingCalendarWidget extends StatelessWidget {
  final Map<String, CalendarDay> calendarData;
  const TrainingCalendarWidget({super.key, required this.calendarData});

  static const Map<String, Color> _activityColors = {
    'test': Colors.green,
    'vocabulary': Colors.purple,
    'speaking': Colors.orange,
    'grammar': Colors.blue,
    'listening': Colors.red,
    'conversation': Colors.pink,
  };

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final firstDayOfMonth = DateTime(today.year, today.month, 1);
    final daysInMonth = DateTime(today.year, today.month + 1, 0).day;
    final startWeekday = firstDayOfMonth.weekday; 

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(
            DateFormat('MMMM yyyy').format(today),
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
        ),
        
        // Legends
        Wrap(
          spacing: 12,
          runSpacing: 8,
          children: _activityColors.entries.map((e) {
            return _LegendItem(color: e.value, label: e.key.toUpperCase());
          }).toList(),
        ),
        const SizedBox(height: 16),
        
        // Days header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              .map((d) => Expanded(
                    child: Text(
                      d,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5),
                      ),
                    ),
                  ))
              .toList(),
        ),
        const SizedBox(height: 8),

        // Grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            childAspectRatio: 0.8,
            crossAxisSpacing: 4,
            mainAxisSpacing: 8,
          ),
          itemCount: daysInMonth + startWeekday - 1,
          itemBuilder: (context, index) {
            if (index < startWeekday - 1) return const SizedBox.shrink();

            final day = index - (startWeekday - 1) + 1;
            final date = DateTime(today.year, today.month, day);
            final dateStr = DateFormat('yyyy-MM-dd').format(date);
            final isToday = day == today.day;
            
            final dayData = calendarData[dateStr];
            final activities = dayData?.activities.toSet().toList() ?? [];

            return Container(
              decoration: BoxDecoration(
                color: isToday ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.1) : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
                border: isToday ? Border.all(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3)) : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    day.toString(),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: isToday ? FontWeight.w800 : FontWeight.w500,
                      color: isToday ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (activities.isNotEmpty)
                    Wrap(
                      spacing: 2,
                      runSpacing: 2,
                      alignment: WrapAlignment.center,
                      children: activities.map((act) {
                        final color = _activityColors[act.toLowerCase()] ?? Colors.grey;
                        return Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
                        );
                      }).toList(),
                    ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8, height: 8,
          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 10)),
      ],
    );
  }
}
