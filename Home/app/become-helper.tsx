
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, Platform, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { authAPI, userAPI, uploadAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function BecomeHelperScreen() {
    const router = useRouter();
    const [isAvailable, setIsAvailable] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');

    // Logged-in user state
    const [loggedInUser, setLoggedInUser] = useState<any>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);

    // Form State (for new users only)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    // ID Proof upload state
    const [idProofImage, setIdProofImage] = useState<string | null>(null);
    const [idProofUrl, setIdProofUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const categories = ['Electrician', 'Plumber', 'Maid', 'Carpenter', 'Other'];

    // Check if user is already logged in
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            // Only allow upgrade if user is a customer (not already a professional)
            if (user.role !== 'professional') {
                setLoggedInUser(user);
                setIsUpgrading(true);
            }
        }
    };

    const pickIdDocument = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to your photo library to upload ID document.');
                return;
            }

            // Pick an image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setIdProofImage(asset.uri);

                // Upload to server
                if (asset.base64) {
                    setIsUploading(true);
                    try {
                        const { data } = await uploadAPI.uploadImage(asset.base64);
                        setIdProofUrl(data.url);
                        Alert.alert('Success', 'ID document uploaded successfully!');
                    } catch (uploadError: any) {
                        console.error('Upload error:', uploadError);
                        Alert.alert('Upload Failed', 'Could not upload the image. Please try again.');
                        setIdProofImage(null);
                    } finally {
                        setIsUploading(false);
                    }
                }
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Something went wrong while picking the image.');
        }
    };
    const handleRegister = async () => {
        if (!selectedCategory) {
            Alert.alert('Missing Fields', 'Please select a service category.');
            return;
        }

        try {
            if (isUpgrading && loggedInUser) {
                // Upgrade existing customer to partner
                const upgradeData: { serviceCategory: string; isAvailable: boolean; idProof?: string } = {
                    serviceCategory: selectedCategory,
                    isAvailable
                };

                // Include ID proof if uploaded
                if (idProofUrl) {
                    upgradeData.idProof = idProofUrl;
                }

                const { data } = await userAPI.upgradeToPartner(loggedInUser._id, upgradeData);

                // Update stored user data
                await AsyncStorage.setItem('user', JSON.stringify(data));

                Alert.alert('Success', 'Your account has been upgraded to Partner! Admin will verify your profile within 24 hours.', [
                    { text: 'Go to Dashboard', onPress: () => router.replace('/(drawer)/partner') }
                ]);
            } else {
                // New user registration
                if (!name || !email || !password || !phone) {
                    Alert.alert('Missing Fields', 'Please fill in all fields.');
                    return;
                }

                const payload: any = {
                    name,
                    email,
                    password,
                    phone,
                    role: 'professional',
                    serviceCategory: selectedCategory,
                    isAvailable
                };

                // Include ID proof if uploaded
                if (idProofUrl) {
                    payload.idProof = idProofUrl;
                }

                const { data } = await authAPI.register(payload);

                // Save user and navigate
                await AsyncStorage.setItem('user', JSON.stringify(data));

                Alert.alert('Success', 'Welcome Partner! Your profile is created.', [
                    { text: 'Go to Dashboard', onPress: () => router.replace('/(drawer)/partner') }
                ]);
            }

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Registration failed';
            Alert.alert('Error', msg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.secondary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Become a Partner</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Intro */}
                <View style={styles.introContainer}>
                    <Text style={styles.title}>Earn with your skills</Text>
                    <Text style={styles.subtitle}>Join as a verified service professional</Text>
                </View>

                {/* Form Container */}
                <View style={styles.formCard}>

                    {/* Show welcome message for logged-in users, form for new users */}
                    {isUpgrading && loggedInUser ? (
                        <View style={styles.welcomeContainer}>
                            <Ionicons name="person-circle" size={60} color={Colors.primary} />
                            <Text style={styles.welcomeName}>Hi, {loggedInUser.name}!</Text>
                            <Text style={styles.welcomeText}>
                                You're upgrading your account to become a partner. Just select your skill category below.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.label}>Personal Details</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Full Name"
                                    placeholderTextColor={Colors.textLight}
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Email Address"
                                    placeholderTextColor={Colors.textLight}
                                    style={styles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor={Colors.textLight}
                                    style={styles.input}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Phone Number"
                                    keyboardType="phone-pad"
                                    placeholderTextColor={Colors.textLight}
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                            </View>
                        </>
                    )}

                    <Text style={styles.label}>Skill Category</Text>
                    <View style={styles.categoryContainer}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextSelected]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Verification Documents (Optional)</Text>
                    {idProofImage ? (
                        <View style={styles.uploadedContainer}>
                            <Image source={{ uri: idProofImage }} style={styles.uploadedImage} />
                            <View style={styles.uploadedOverlay}>
                                {isUploading ? (
                                    <ActivityIndicator size="small" color={Colors.secondary} />
                                ) : (
                                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.changeImageButton}
                                onPress={pickIdDocument}
                                disabled={isUploading}
                            >
                                <Text style={styles.changeImageText}>Change Image</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={pickIdDocument}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator size="small" color={Colors.primary} />
                            ) : (
                                <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
                            )}
                            <Text style={styles.uploadText}>
                                {isUploading ? 'Uploading...' : 'Upload ID Document'}
                            </Text>
                            <Ionicons name="add-circle" size={20} color={Colors.primary} style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                    )}

                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Availability Status (Online/Offline)</Text>
                        <Switch
                            trackColor={{ false: Colors.border, true: Colors.success }}
                            thumbColor={Colors.secondary}
                            onValueChange={setIsAvailable}
                            value={isAvailable}
                        />
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
                        <Text style={styles.submitButtonText}>Submit & Join</Text>
                    </TouchableOpacity>

                    <View style={styles.noteContainer}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={Colors.textLight} />
                        <Text style={styles.noteText}>Admin will verify your profile within 24 hours</Text>
                    </View>

                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.secondary, // White background overall
    },
    header: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.secondary,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    introContainer: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 10,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.accent,
        opacity: 0.9,
    },
    formCard: {
        backgroundColor: Colors.secondary,
        marginHorizontal: 20,
        marginTop: -30,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    welcomeContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 10,
    },
    welcomeName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 10,
    },
    welcomeText: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 15,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 10,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 10,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.gray,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryText: {
        color: Colors.text,
        fontSize: 14,
    },
    categoryTextSelected: {
        color: Colors.secondary,
        fontWeight: '600',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.accent,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.primary + '20', // slight transparency
    },
    uploadText: {
        marginLeft: 10,
        fontSize: 15,
        color: Colors.primary,
        fontWeight: '500',
    },
    uploadedContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    uploadedImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    uploadedOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 15,
        padding: 5,
    },
    changeImageButton: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: Colors.gray,
        borderRadius: 8,
    },
    changeImageText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        backgroundColor: Colors.gray,
        padding: 15,
        borderRadius: 12,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.text,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonText: {
        color: Colors.secondary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        gap: 5,
    },
    noteText: {
        fontSize: 12,
        color: Colors.textLight,
    },
});
