import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Calendar, ChevronDown } from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "./Button";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);
  const [selectingStart, setSelectingStart] = useState(true);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Generate months for the next year
  const months = [];
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(currentYear, currentMonth + i, 1);
    months.push(monthDate);
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDayPress = (day: Date) => {
    if (selectingStart) {
      setTempStartDate(day);
      setTempEndDate(null);
      setSelectingStart(false);
    } else {
      if (tempStartDate && day < tempStartDate) {
        // If end date is before start date, swap them
        setTempEndDate(tempStartDate);
        setTempStartDate(day);
      } else {
        setTempEndDate(day);
      }
      setSelectingStart(true);
    }
  };

  const handleApply = () => {
    onDateChange(tempStartDate, tempEndDate);
    setIsModalVisible(false);
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onDateChange(null, null);
    setIsModalVisible(false);
  };

  const isDayInRange = (day: Date): boolean => {
    if (!tempStartDate || !tempEndDate) return false;
    return day > tempStartDate && day < tempEndDate;
  };

  const isDaySelected = (day: Date): boolean => {
    if (!tempStartDate && !tempEndDate) return false;
    if (tempStartDate && day.toDateString() === tempStartDate.toDateString()) return true;
    if (tempEndDate && day.toDateString() === tempEndDate.toDateString()) return true;
    return false;
  };

  const isDayDisabled = (day: Date): boolean => {
    if (minDate && day < minDate) return true;
    if (maxDate && day > maxDate) return true;
    return false;
  };

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthName = monthDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const days = [];
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isDisabled = isDayDisabled(date);
      const isSelected = isDaySelected(date);
      const isInRange = isDayInRange(date);

      days.push(
        <TouchableOpacity
          key={`day-${i}`}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDay,
            isInRange && styles.inRangeDay,
            isDisabled && styles.disabledDay,
          ]}
          onPress={() => !isDisabled && handleDayPress(date)}
          disabled={isDisabled}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              isInRange && styles.inRangeDayText,
              isDisabled && styles.disabledDayText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.monthContainer} key={`${year}-${month}`}>
        <Text style={styles.monthName}>{monthName}</Text>
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.daysContainer}>{days}</View>
      </View>
    );
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Calendar size={20} color={Colors.textSecondary} />
        <View style={styles.dateTextContainer}>
          <Text style={styles.dateLabel}>
            {startDate || endDate ? "Trip dates" : "Select dates"}
          </Text>
          <Text style={styles.dateText}>
            {startDate ? formatDate(startDate) : "Start"} -{" "}
            {endDate ? formatDate(endDate) : "End"}
          </Text>
        </View>
        <ChevronDown size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Dates</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateSelectionInfo}>
              <View style={styles.dateBox}>
                <Text style={styles.dateBoxLabel}>Start Date</Text>
                <Text style={styles.dateBoxValue}>
                  {tempStartDate ? formatDate(tempStartDate) : "Select"}
                </Text>
              </View>
              <View style={styles.dateArrow}>
                <Text>→</Text>
              </View>
              <View style={styles.dateBox}>
                <Text style={styles.dateBoxLabel}>End Date</Text>
                <Text style={styles.dateBoxValue}>
                  {tempEndDate ? formatDate(tempEndDate) : "Select"}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.calendarContainer}>
              {months.map(renderMonth)}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Clear"
                onPress={handleClear}
                variant="outline"
                style={styles.footerButton}
              />
              <Button
                title="Apply"
                onPress={handleApply}
                disabled={!tempStartDate || !tempEndDate}
                style={styles.footerButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  closeButton: {
    fontSize: 16,
    color: Colors.primary,
  },
  dateSelectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
  },
  dateBoxLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateBoxValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
  dateArrow: {
    paddingHorizontal: 8,
  },
  calendarContainer: {
    paddingHorizontal: 16,
  },
  monthContainer: {
    marginBottom: 24,
  },
  monthName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: Colors.text,
  },
  weekDaysContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedDay: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: "600",
  },
  inRangeDay: {
    backgroundColor: Colors.primaryLight,
  },
  inRangeDayText: {
    color: Colors.primary,
  },
  disabledDay: {
    opacity: 0.4,
  },
  disabledDayText: {
    color: Colors.textSecondary,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});