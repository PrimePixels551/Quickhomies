
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { userAPI, orderAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ServiceInquiryScreen() {
    const router = useRouter();
    const { id, name, minPrice, maxPrice } = useLocalSearchParams();
    const [query, setQuery] = useState('');
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [selectedHelper, setSelectedHelper] = useState<any>(null);

    useEffect(() => {
        if (name) {
            fetchProfessionals();
        }
    }, [name]);

    const fetchProfessionals = async () => {
        try {
            const { data } = await userAPI.getProfessionals(name as string);
            setProfessionals(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = () => {
        if (!query.trim()) {
            Alert.alert('Error', 'Please enter your query.');
            return;
        }
        Alert.alert('Success', 'Query submitted! Select a professional below to complete your booking.');
    };

    const handleBookProfessional = async (professional: any) => {
        if (!query.trim()) {
            Alert.alert('Error', 'Please describe your issue first before booking.');
            return;
        }

        try {
            const userData = await AsyncStorage.getItem('user');
            if (!userData) {
                Alert.alert('Login Required', 'Please login to book a professional.', [
                    { text: 'OK', onPress: () => router.push('/auth/login') }
                ]);
                return;
            }

            const user = JSON.parse(userData);

            const orderData = {
                customer: user._id,
                professional: professional._id,
                serviceName: name as string,
                description: query,
                price: 0, // Price can be set later
            };

            await orderAPI.create(orderData);

            Alert.alert('Booking Confirmed!', `Your request has been sent to ${professional.name}. They will contact you soon.`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'Failed to create booking. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: Colors.gray }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{name || 'Service'} Request</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Price Range Card */}
                    {(Number(minPrice) > 0 || Number(maxPrice) > 0) && (
                        <View style={styles.priceCard}>
                            <View style={styles.priceIconContainer}>
                                <Ionicons name="pricetag" size={24} color={Colors.success} />
                            </View>
                            <View>
                                <Text style={styles.priceLabel}>Estimated Price Range</Text>
                                <Text style={styles.priceValue}>₹{minPrice} - ₹{maxPrice}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.card}>
                        <Text style={styles.title}>Describe your issue (Timings, Address, etc.)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., My kitchen tap is leaking..."
                            placeholderTextColor={Colors.textLight}
                            multiline
                            numberOfLines={4}
                            value={query}
                            onChangeText={setQuery}
                        />
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Submit Request</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Available Helpers Section */}
                    <Text style={styles.sectionTitle}>Available Professionals</Text>
                    <View style={styles.helpersList}>
                        {professionals.length > 0 ? (
                            professionals.map((item) => (
                                <TouchableOpacity
                                    key={item._id}
                                    style={styles.helperCard}
                                    activeOpacity={0.7}
                                    onPress={() => setSelectedHelper(item)}
                                >
                                    <View style={styles.helperInfo}>
                                        <View style={styles.helperAvatar}>
                                            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.helperName}>{item.name}</Text>
                                            <Text style={styles.helperRating}>⭐ {item.rating || 'New'} • {item.jobsCompleted || 0} Jobs</Text>
                                        </View>
                                    </View>
                                    <View style={styles.viewInfoButton}>
                                        <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>No professionals available for this category yet.</Text>
                        )}
                    </View>
                </ScrollView>

                {/* Helper Details Modal */}
                <Modal
                    visible={selectedHelper !== null}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setSelectedHelper(null)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Professional Details</Text>
                                <TouchableOpacity
                                    onPress={() => setSelectedHelper(null)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color={Colors.text} />
                                </TouchableOpacity>
                            </View>

                            {selectedHelper && (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {/* Profile Section */}
                                    <View style={styles.profileSection}>
                                        {selectedHelper.profileImage ? (
                                            <Image
                                                source={{ uri: selectedHelper.profileImage }}
                                                style={styles.modalAvatarImage}
                                            />
                                        ) : (
                                            <View style={styles.modalAvatar}>
                                                <Text style={styles.modalAvatarText}>
                                                    {selectedHelper.name?.charAt(0)}
                                                </Text>
                                            </View>
                                        )}
                                        <Text style={styles.modalName}>{selectedHelper.name}</Text>
                                        <Text style={styles.modalCategory}>{selectedHelper.serviceCategory || name}</Text>

                                        {/* Verification Badge */}
                                        {selectedHelper.verificationStatus === 'verified' && (
                                            <View style={styles.verifiedBadge}>
                                                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                                <Text style={styles.verifiedText}>Verified Professional</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Stats Section */}
                                    <View style={styles.statsContainer}>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>⭐ {selectedHelper.rating || 'New'}</Text>
                                            <Text style={styles.statLabel}>Rating</Text>
                                        </View>
                                        <View style={styles.statDivider} />
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{selectedHelper.jobsCompleted || 0}</Text>
                                            <Text style={styles.statLabel}>Jobs Done</Text>
                                        </View>
                                        <View style={styles.statDivider} />
                                        <View style={styles.statItem}>
                                            <Text style={styles.statValue}>{selectedHelper.experience || 0}+</Text>
                                            <Text style={styles.statLabel}>Yrs Exp</Text>
                                        </View>
                                    </View>

                                    {/* Info List */}
                                    <View style={styles.infoList}>
                                        {selectedHelper.phone && (
                                            <View style={styles.infoItem}>
                                                <View style={styles.infoIcon}>
                                                    <Ionicons name="call-outline" size={20} color={Colors.primary} />
                                                </View>
                                                <View>
                                                    <Text style={styles.infoLabel}>Phone</Text>
                                                    <Text style={styles.infoValue}>{selectedHelper.phone}</Text>
                                                </View>
                                            </View>
                                        )}

                                        {selectedHelper.email && (
                                            <View style={styles.infoItem}>
                                                <View style={styles.infoIcon}>
                                                    <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                                                </View>
                                                <View>
                                                    <Text style={styles.infoLabel}>Email</Text>
                                                    <Text style={styles.infoValue}>{selectedHelper.email}</Text>
                                                </View>
                                            </View>
                                        )}

                                        {selectedHelper.address && (
                                            <View style={styles.infoItem}>
                                                <View style={styles.infoIcon}>
                                                    <Ionicons name="location-outline" size={20} color={Colors.primary} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.infoLabel}>Address</Text>
                                                    <Text style={styles.infoValue}>{selectedHelper.address}</Text>
                                                </View>
                                            </View>
                                        )}

                                        <View style={styles.infoItem}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                                            </View>
                                            <View>
                                                <Text style={styles.infoLabel}>Availability</Text>
                                                <Text style={[styles.infoValue, { color: selectedHelper.isAvailable ? Colors.success : Colors.error }]}>
                                                    {selectedHelper.isAvailable ? 'Available Now' : 'Currently Busy'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Book Button */}
                                    <TouchableOpacity
                                        style={styles.modalBookButton}
                                        onPress={() => {
                                            setSelectedHelper(null);
                                            handleBookProfessional(selectedHelper);
                                        }}
                                    >
                                        <Text style={styles.modalBookButtonText}>Book This Professional</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: Colors.primary,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: Colors.secondary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        backgroundColor: Colors.gray,
        flexGrow: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    card: {
        backgroundColor: Colors.secondary,
        borderRadius: 20,
        padding: 20,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 15,
    },
    input: {
        textAlignVertical: 'top',
        backgroundColor: Colors.gray,
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        minHeight: 120,
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
    },
    submitButtonText: {
        color: Colors.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 15,
        marginLeft: 5,
    },
    helpersList: {
        gap: 15,
    },
    helperCard: {
        backgroundColor: Colors.secondary,
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    helperInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    helperAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: Colors.secondary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    helperName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    helperRating: {
        fontSize: 13,
        color: Colors.textLight,
    },
    bookButton: {
        backgroundColor: Colors.gray,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
    },
    bookButtonText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 13,
    },
    noDataText: {
        textAlign: 'center',
        color: Colors.textLight,
        marginTop: 20,
        fontStyle: 'italic',
    },
    priceCard: {
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: Colors.success,
        borderStyle: 'dashed',
    },
    priceIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.success + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceLabel: {
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.success,
    },
    viewInfoButton: {
        padding: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.secondary,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    closeButton: {
        padding: 5,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    modalAvatarText: {
        color: Colors.secondary,
        fontSize: 32,
        fontWeight: 'bold',
    },
    modalAvatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    modalName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    modalCategory: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 10,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.success + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    verifiedText: {
        fontSize: 12,
        color: Colors.success,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: Colors.gray,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textLight,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.border,
    },
    infoList: {
        gap: 15,
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: Colors.text,
        fontWeight: '500',
    },
    modalBookButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    modalBookButtonText: {
        color: Colors.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
