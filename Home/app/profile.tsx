
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '../services/api';

type ProfileMenuItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    isDestructive?: boolean;
};

const ProfileMenuItem = ({ icon, label, isDestructive = false }: ProfileMenuItemProps) => (
    <View style={styles.menuItem}>
        <View style={[styles.menuIconContainer, isDestructive && styles.menuIconDestructive]}>
            <Ionicons name={icon} size={20} color={isDestructive ? Colors.error : Colors.primary} />
        </View>
        <Text style={[styles.menuLabel, isDestructive && { color: Colors.error }]}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
    </View>
);

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        address: '',
        email: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadUser();
        }, [])
    );

    const loadUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setEditForm({
                    name: parsedUser.name || '',
                    phone: parsedUser.phone || '',
                    address: parsedUser.address || '',
                    email: parsedUser.email || '',
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('user');
            router.replace('/auth/login');
        } catch (error) {
            console.error(error);
        }
    };

    const openEditModal = () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to edit your profile.');
            return;
        }
        setEditForm({
            name: user.name || '',
            phone: user.phone || '',
            address: user.address || '',
            email: user.email || '',
        });
        setIsEditModalVisible(true);
    };

    const handleSaveProfile = async () => {
        if (!editForm.name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setIsSaving(true);
        try {
            const { data } = await userAPI.updateProfile(user._id, editForm);

            // Update local storage
            await AsyncStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            setIsEditModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            console.error('Update error:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUser();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Back Button Header */}
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.secondary} />
                </TouchableOpacity>
                <Text style={styles.topHeaderTitle}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
            >

                {/* Header Profile Section */}
                <View style={styles.header}>
                    <View style={styles.profileCard}>
                        <TouchableOpacity style={styles.avatarContainer} onPress={openEditModal}>
                            {user?.profileImage ? (
                                <Image
                                    source={{ uri: user.profileImage }}
                                    style={{ width: 76, height: 76, borderRadius: 38 }}
                                />
                            ) : (
                                <Ionicons name="person" size={40} color={Colors.secondary} />
                            )}
                            {user && (
                                <View style={styles.editBadge}>
                                    <Ionicons name="pencil" size={12} color={Colors.secondary} />
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
                        <Text style={styles.userPhone}>{user?.phone || user?.email || 'Login to view details'}</Text>
                        {user?.address && (
                            <Text style={styles.userAddress}>{user.address}</Text>
                        )}

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{user?.rating || 'New'}</Text>
                                <Text style={styles.statLabel}>Rating</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{user?.jobsCompleted || '0'}</Text>
                                <Text style={styles.statLabel}>Jobs</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Menu Sections */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Account</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity onPress={openEditModal}>
                            <ProfileMenuItem icon="person-outline" label="Edit Profile" />
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity onPress={openEditModal}>
                            <ProfileMenuItem icon="location-outline" label="Saved Addresses" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionHeader}>Activity</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity onPress={() => router.push('/(drawer)/bookings')}>
                            <ProfileMenuItem icon="calendar-outline" label="Booking History" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionHeader}>Support</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity onPress={() => router.push('/(drawer)/contact')}>
                            <ProfileMenuItem icon="help-buoy-outline" label="Help & Support" />
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        {user ? (
                            <TouchableOpacity onPress={handleLogout}>
                                <ProfileMenuItem icon="log-out-outline" label="Logout" isDestructive />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <ProfileMenuItem icon="log-in-outline" label="Login" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your name"
                                    placeholderTextColor={Colors.textLight}
                                    value={editForm.name}
                                    onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={[styles.input, styles.inputDisabled]}
                                    placeholder="Email address"
                                    placeholderTextColor={Colors.textLight}
                                    value={editForm.email}
                                    editable={false}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter phone number"
                                    placeholderTextColor={Colors.textLight}
                                    keyboardType="phone-pad"
                                    value={editForm.phone}
                                    onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Address</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Enter your address"
                                    placeholderTextColor={Colors.textLight}
                                    multiline
                                    numberOfLines={3}
                                    value={editForm.address}
                                    onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setIsEditModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                                onPress={handleSaveProfile}
                                disabled={isSaving}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.primary,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    scrollContent: {
        paddingBottom: 40,
        backgroundColor: Colors.secondary,
    },
    header: {
        backgroundColor: Colors.primary,
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 60,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: -40,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: Colors.secondary,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.secondary,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    userPhone: {
        fontSize: 14,
        color: Colors.accent,
        marginBottom: 5,
    },
    userAddress: {
        fontSize: 12,
        color: Colors.accent,
        opacity: 0.8,
        marginBottom: 15,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 15,
        minWidth: 200,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.accent,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    sectionContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textLight,
        marginBottom: 10,
        marginTop: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuCard: {
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.secondary,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    menuIconDestructive: {
        backgroundColor: '#FEE2E2',
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    menuDivider: {
        height: 1,
        backgroundColor: Colors.border,
        marginLeft: 60,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.secondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    modalBody: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.gray,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.text,
    },
    inputDisabled: {
        opacity: 0.6,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: Colors.secondary,
        fontSize: 16,
        fontWeight: '600',
    },
});
