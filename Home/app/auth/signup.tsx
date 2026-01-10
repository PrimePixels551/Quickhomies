
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, uploadAPI } from '../../services/api';

export default function SignupScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    // Email removed as per requirement
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<'user' | 'professional'>('user');
    const [serviceCategory, setServiceCategory] = useState('');
    const [experience, setExperience] = useState('');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Image states
    const [idProofImage, setIdProofImage] = useState<string | null>(null);
    const [idProofUrl, setIdProofUrl] = useState<string>('');

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string>('');

    const [uploading, setUploading] = useState(false);

    const pickImage = async (type: 'id' | 'profile') => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photos to upload image.');
            return;
        }

        // Pick image
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            handleImageUpload(result.assets[0].uri, result.assets[0].base64, type);
        }
    };

    const takePhoto = async (type: 'id' | 'profile') => {
        // Request camera permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow camera access to take a photo.');
            return;
        }

        // Take photo
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            handleImageUpload(result.assets[0].uri, result.assets[0].base64, type);
        }
    };

    const handleImageUpload = async (uri: string, base64: string | null | undefined, type: 'id' | 'profile') => {
        if (!base64) return;

        const base64Image = `data:image/jpeg;base64,${base64}`;

        if (type === 'id') {
            setIdProofImage(uri);
        } else {
            setProfileImage(uri);
        }

        // Upload to Cloudinary
        setUploading(true);
        try {
            const response = await uploadAPI.uploadImage(base64Image);
            if (type === 'id') {
                setIdProofUrl(response.data.url);
                Alert.alert('Success', 'ID proof uploaded successfully!');
            } else {
                setProfileImageUrl(response.data.url);
                Alert.alert('Success', 'Profile photo uploaded successfully!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
            if (type === 'id') setIdProofImage(null);
            else setProfileImage(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSignup = async () => {
        // Validate password for professional role
        if (role === 'professional' && !password) {
            Alert.alert('Password Required', 'Please enter a password.');
            return;
        }

        if (role === 'professional' && !profileImageUrl) {
            Alert.alert('Profile Photo Required', 'Please upload your profile photo.');
            return;
        }

        try {
            const payload: any = {
                name,
                // Email removed
                phone,
                address,
                role,
            };

            // Only include password for professional role
            if (role === 'professional') {
                payload.password = password;
                payload.serviceCategory = serviceCategory;
                payload.isAvailable = true;
                payload.experience = parseInt(experience) || 0;
                payload.profileImage = profileImageUrl;
                // ID proof is optional
                if (idProofUrl) {
                    payload.idProof = idProofUrl;
                }
            }

            const { data } = await authAPI.register(payload);
            await AsyncStorage.setItem('user', JSON.stringify(data));

            if (role === 'professional') {
                Alert.alert('Success', 'Partner account created! waiting for admin approval.');
            }

            router.replace('/(drawer)');
        } catch (error: any) {
            console.error('Signup error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Signup failed. Please try again.';
            Alert.alert('Signup Failed', errorMessage);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ top: 60, right: 30, zIndex: 99 }}>
                <TouchableOpacity onPress={() => router.replace('/(drawer)')} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, padding: 8, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }}>
                    <Ionicons name="home-outline" size={20} color={Colors.secondary} />
                    <Text style={{ marginLeft: 4, color: Colors.secondary, fontWeight: 'bold' }}>Home</Text>
                </TouchableOpacity>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join QuickHomies today!</Text>
                    </View>

                    {/* Role Switcher */}
                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'user' && styles.roleButtonActive]}
                            onPress={() => setRole('user')}
                        >
                            <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Customer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'professional' && styles.roleButtonActive]}
                            onPress={() => setRole('professional')}
                        >
                            <Text style={[styles.roleText, role === 'professional' && styles.roleTextActive]}>Partner</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Profile Image Upload */}
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <TouchableOpacity onPress={() => pickImage('profile')}>
                                {profileImage ? (
                                    <View style={{ position: 'relative' }}>
                                        <Image source={{ uri: profileImage }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                                        <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, borderRadius: 15, padding: 4 }}>
                                            <Ionicons name="camera" size={14} color='#fff' />
                                        </View>
                                    </View>
                                ) : (
                                    <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.gray, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border }}>
                                        <Ionicons name="camera-outline" size={30} color={Colors.textLight} />
                                        <Text style={{ fontSize: 12, color: Colors.textLight, marginTop: 4 }}>Add Photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor={Colors.textLight}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>



                        <View style={styles.inputWrapper}>
                            <Ionicons name="call-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                placeholderTextColor={Colors.textLight}
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Ionicons name="location-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Address"
                                placeholderTextColor={Colors.textLight}
                                value={address}
                                onChangeText={setAddress}
                            />
                        </View>

                        {role === 'professional' && (
                            <View>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="time-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Experience (Years)"
                                        placeholderTextColor={Colors.textLight}
                                        keyboardType="numeric"
                                        value={experience}
                                        onChangeText={setExperience}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.inputWrapper}
                                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                                >
                                    <Ionicons name="briefcase-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                                    <Text style={[styles.input, !serviceCategory && { color: Colors.textLight }]}>
                                        {serviceCategory || 'Select Service Category'}
                                    </Text>
                                    <Ionicons name="chevron-down-outline" size={20} color={Colors.textLight} />
                                </TouchableOpacity>

                                {showCategoryPicker && (
                                    <View style={styles.dropdownContainer}>
                                        {SERVICE_CATEGORIES.map((cat) => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setServiceCategory(cat);
                                                    setShowCategoryPicker(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{cat}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        {/* ID Proof Image Upload - Optional for partners */}
                        {role === 'professional' && (
                            <View style={styles.idProofSection}>
                                <Text style={styles.idProofLabel}>Government ID Proof (Optional)</Text>

                                {idProofImage ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image source={{ uri: idProofImage }} style={styles.imagePreview} />
                                        {uploading && (
                                            <View style={styles.uploadingOverlay}>
                                                <ActivityIndicator size="large" color={Colors.primary} />
                                                <Text style={styles.uploadingText}>Uploading...</Text>
                                            </View>
                                        )}
                                        {!uploading && (
                                            <TouchableOpacity
                                                style={styles.removeImageBtn}
                                                onPress={() => {
                                                    setIdProofImage(null);
                                                    setIdProofUrl('');
                                                }}
                                            >
                                                <Ionicons name="close-circle" size={28} color={Colors.error} />
                                            </TouchableOpacity>
                                        )}
                                        {idProofUrl && !uploading && (
                                            <View style={styles.uploadedBadge}>
                                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                                <Text style={styles.uploadedText}>Uploaded</Text>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View style={styles.uploadButtons}>
                                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('id')}>
                                            <Ionicons name="images-outline" size={24} color={Colors.primary} />
                                            <Text style={styles.uploadBtnText}>Gallery</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.uploadBtn} onPress={() => takePhoto('id')}>
                                            <Ionicons name="camera-outline" size={24} color={Colors.primary} />
                                            <Text style={styles.uploadBtnText}>Camera</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Password field - Only for professionals/helpers */}
                        {role === 'professional' && (
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor={Colors.textLight}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textLight} />
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.signupButton, uploading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={uploading}
                        >
                            <Text style={styles.signupButtonText}>Sign Up</Text>
                        </TouchableOpacity>

                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/login')}>
                            <Text style={styles.loginText}>Login</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.secondary,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        padding: 10,
        zIndex: 10,
    },
    header: {
        marginTop: 60,
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.textLight,
    },
    formContainer: {
        marginBottom: 30,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    signupButton: {
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    signupButtonDisabled: {
        opacity: 0.6,
    },
    signupButtonText: {
        color: Colors.secondary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 16,
        color: Colors.textLight,
    },
    loginText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    roleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: Colors.gray,
        borderRadius: 12,
        padding: 4,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    roleButtonActive: {
        backgroundColor: Colors.primary,
    },
    roleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textLight,
    },
    roleTextActive: {
        color: Colors.secondary,
    },
    dropdownContainer: {
        marginTop: -10,
        marginBottom: 15,
        backgroundColor: Colors.gray,
        borderRadius: 12,
        padding: 5,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    dropdownItemText: {
        fontSize: 16,
        color: Colors.text,
    },
    // ID Proof Styles
    idProofSection: {
        marginBottom: 15,
    },
    idProofLabel: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '600',
        marginBottom: 10,
    },
    uploadButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    uploadBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.gray,
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
    },
    uploadBtnText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: 180,
        borderRadius: 12,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingText: {
        marginTop: 8,
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    removeImageBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    uploadedBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#10B98120',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    uploadedText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
});

const SERVICE_CATEGORIES = [
    'Electrician',
    'Plumber',
    'Maid',
    'Barber',
    'Driver',
    'Party Planner',
    'Caretaker',
    'Other'
];
