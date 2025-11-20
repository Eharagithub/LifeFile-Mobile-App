import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ScheduleVisitProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (visitData: VisitData) => void;
    patientId?: string;
}

export interface VisitData {
    date: string;
    time: string;
    visitType: string;
    notes: string;
}

const ScheduleVisitModal: React.FC<ScheduleVisitProps> = ({
    visible,
    onClose,
    onSubmit,
    patientId,
}) => {
    const [formData, setFormData] = useState<VisitData>({
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        visitType: 'Follow-up Consultation',
        notes: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            const dateString = selectedDate.toISOString().split('T')[0];
            setFormData((prev) => ({
                ...prev,
                date: dateString,
            }));
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (selectedTime) {
            const timeString = selectedTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            setFormData((prev) => ({
                ...prev,
                time: timeString,
            }));
        }
    };

    const handleInputChange = (field: keyof VisitData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.date.trim()) {
            Alert.alert('Validation Error', 'Please select a date');
            return false;
        }
        if (!formData.time.trim()) {
            Alert.alert('Validation Error', 'Please select a time');
            return false;
        }
        if (!formData.visitType.trim()) {
            Alert.alert('Validation Error', 'Please select visit type');
            return false;
        }

        // Check if date is in the future
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            Alert.alert('Validation Error', 'Please select a future date');
            return false;
        }

        return true;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                visitType: 'Follow-up Consultation',
                notes: '',
            });
            onClose();
            Alert.alert('Success', 'Visit scheduled successfully');
        }
    };

    const visitTypes = [
        'Follow-up Consultation',
        'Regular Checkup',
        'Review of Results',
        'Treatment Adjustment',
        'Emergency Visit',
        'Other',
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onClose}>
                                <Feather name="x" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Schedule Visit</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Form Content */}
                        <ScrollView
                            style={styles.formContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Date Picker */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="calendar"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>Visit Date</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.pickerButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <MaterialCommunityIcons
                                        name="calendar-outline"
                                        size={20}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.pickerButtonText}>
                                        {new Date(formData.date).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={new Date(formData.date)}
                                        mode="date"
                                        display="spinner"
                                        onChange={handleDateChange}
                                        minimumDate={new Date()}
                                    />
                                )}
                            </View>

                            {/* Time Picker */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="clock-outline"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>Visit Time</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.pickerButton}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <MaterialCommunityIcons
                                        name="clock"
                                        size={20}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.pickerButtonText}>{formData.time}</Text>
                                </TouchableOpacity>
                                {showTimePicker && (
                                    <DateTimePicker
                                        value={new Date(`2025-01-01T${formData.time}`)}
                                        mode="time"
                                        display="spinner"
                                        onChange={handleTimeChange}
                                    />
                                )}
                            </View>

                            {/* Visit Type */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="stethoscope"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>Visit Type</Text>
                                </View>
                                <View style={styles.typeButtonsContainer}>
                                    {visitTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeButton,
                                                formData.visitType === type && styles.typeButtonActive,
                                            ]}
                                            onPress={() => handleInputChange('visitType', type)}
                                        >
                                            <Text
                                                style={[
                                                    styles.typeButtonText,
                                                    formData.visitType === type && styles.typeButtonTextActive,
                                                ]}
                                            >
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Notes */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="note-text"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>
                                        Additional Notes (Optional)
                                    </Text>
                                </View>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="e.g., Please bring test reports"
                                    value={formData.notes}
                                    onChangeText={(text) =>
                                        handleInputChange('notes', text)
                                    }
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>
                        </ScrollView>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                            >
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.submitButtonText}>Schedule Visit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    formGroup: {
        marginBottom: 18,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fafafa',
    },
    textArea: {
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fafafa',
        gap: 10,
    },
    pickerButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    typeButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f5f5f5',
    },
    typeButtonActive: {
        backgroundColor: '#7d4c9e',
        borderColor: '#7d4c9e',
    },
    typeButtonText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#7d4c9e',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ScheduleVisitModal;
