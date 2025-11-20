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

interface MedicationInputProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (medication: MedicationData) => void;
    patientId?: string;
}

export interface MedicationData {
    drugName: string;
    dosage: string;
    frequency: string;
    timeOfDay: string;
    duration: string;
    instructions: string;
    startDate: string;
}

const PatientMedicationsModal: React.FC<MedicationInputProps> = ({
    visible,
    onClose,
    onSubmit,
    patientId,
}) => {
    const [formData, setFormData] = useState<MedicationData>({
        drugName: '',
        dosage: '',
        frequency: '',
        timeOfDay: '',
        duration: '',
        instructions: '',
        startDate: new Date().toISOString().split('T')[0],
    });

    const handleInputChange = (field: keyof MedicationData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.drugName.trim()) {
            Alert.alert('Validation Error', 'Please enter drug name');
            return false;
        }
        if (!formData.dosage.trim()) {
            Alert.alert('Validation Error', 'Please enter dosage');
            return false;
        }
        if (!formData.frequency.trim()) {
            Alert.alert('Validation Error', 'Please enter frequency');
            return false;
        }
        if (!formData.timeOfDay.trim()) {
            Alert.alert('Validation Error', 'Please enter time of day');
            return false;
        }
        if (!formData.duration.trim()) {
            Alert.alert('Validation Error', 'Please enter duration');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
            // Reset form
            setFormData({
                drugName: '',
                dosage: '',
                frequency: '',
                timeOfDay: '',
                duration: '',
                instructions: '',
                startDate: new Date().toISOString().split('T')[0],
            });
            onClose();
            Alert.alert('Success', 'Medication prescribed successfully');
        }
    };

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
                            <Text style={styles.headerTitle}>Prescribe Medication</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Form Content */}
                        <ScrollView
                            style={styles.formContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Drug Name */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="pill"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>Drug Name</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Aspirin, Metformin"
                                    value={formData.drugName}
                                    onChangeText={(text) =>
                                        handleInputChange('drugName', text)
                                    }
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Dosage */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="scale"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>Dosage</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 500mg, 10ml"
                                    value={formData.dosage}
                                    onChangeText={(text) =>
                                        handleInputChange('dosage', text)
                                    }
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Frequency */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="clock-outline"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>Frequency</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Once daily, Twice daily, Every 6 hours"
                                    value={formData.frequency}
                                    onChangeText={(text) =>
                                        handleInputChange('frequency', text)
                                    }
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Time of Day */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="calendar-clock"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>Time of Day</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Morning, After meals, Before bed"
                                    value={formData.timeOfDay}
                                    onChangeText={(text) =>
                                        handleInputChange('timeOfDay', text)
                                    }
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Duration */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="timer-outline"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>Duration</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 7 days, 2 weeks, 1 month, Ongoing"
                                    value={formData.duration}
                                    onChangeText={(text) =>
                                        handleInputChange('duration', text)
                                    }
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Start Date */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="calendar"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>Start Date</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    value={formData.startDate}
                                    onChangeText={(text) =>
                                        handleInputChange('startDate', text)
                                    }
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Instructions */}
                            <View style={styles.formGroup}>
                                <View style={styles.labelContainer}>
                                    <MaterialCommunityIcons
                                        name="clipboard-list"
                                        size={18}
                                        color="#7d4c9e"
                                    />
                                    <Text style={styles.label}>
                                        Special Instructions (Optional)
                                    </Text>
                                </View>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="e.g., Take with food, Avoid dairy products"
                                    value={formData.instructions}
                                    onChangeText={(text) =>
                                        handleInputChange('instructions', text)
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
                                <Text style={styles.submitButtonText}>
                                    Prescribe Medication
                                </Text>
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

export default PatientMedicationsModal;
