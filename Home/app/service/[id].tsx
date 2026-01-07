
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
                        <Text style={styles.title}>Describe your issue</Text>
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
                                <View key={item._id} style={styles.helperCard}>
                                    <View style={styles.helperInfo}>
                                        <View style={styles.helperAvatar}>
                                            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.helperName}>{item.name}</Text>
                                            <Text style={styles.helperRating}>⭐ {item.rating || 'New'} • {item.jobsCompleted || 0} Jobs</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.bookButton} onPress={() => handleBookProfessional(item)}>
                                        <Text style={styles.bookButtonText}>Book</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>No professionals available for this category yet.</Text>
                        )}
                    </View>
                </ScrollView>
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
});
