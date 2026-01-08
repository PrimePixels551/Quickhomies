
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

export default function ContactScreen() {
    const router = useRouter();
    const contactInfo = {
        phone: '+91 9876543210',
        email: 'support@quickhomies.com',
        whatsapp: '+919876543210',
        address: '123 Main Street, Tech Park, Hyderabad, Telangana 500001',
        workingHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
    };

    const handlePhoneCall = () => {
        Linking.openURL(`tel:${contactInfo.phone}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${contactInfo.email}`);
    };

    const handleWhatsApp = () => {
        Linking.openURL(`https://wa.me/${contactInfo.whatsapp}`);
    };

    const handleOpenMaps = () => {
        const address = encodeURIComponent(contactInfo.address);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
    };

    const ContactCard = ({ icon, title, value, onPress, actionIcon }: any) => (
        <TouchableOpacity style={styles.contactCard} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.contactIconContainer}>
                <Ionicons name={icon} size={24} color={Colors.primary} />
            </View>
            <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{title}</Text>
                <Text style={styles.contactValue}>{value}</Text>
            </View>
            {actionIcon && (
                <View style={styles.actionIcon}>
                    <Ionicons name={actionIcon} size={20} color={Colors.primary} />
                </View>
            )}
        </TouchableOpacity>
    );

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate refresh for static content
        setTimeout(() => setRefreshing(false), 500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Contact Us</Text>
                    <Text style={styles.headerSubtitle}>We're here to help!</Text>
                </View>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => router.push('/profile')}
                >
                    <Ionicons name="person" size={20} color={Colors.secondary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
            >
                {/* Hero Section */}
                <View style={styles.heroCard}>
                    <Ionicons name="headset-outline" size={50} color={Colors.primary} />
                    <Text style={styles.heroTitle}>Need Help?</Text>
                    <Text style={styles.heroText}>
                        Our support team is available to assist you with any questions or concerns.
                    </Text>
                </View>

                {/* Contact Options */}
                <Text style={styles.sectionTitle}>Get in Touch</Text>

                <ContactCard
                    icon="call-outline"
                    title="Phone"
                    value={contactInfo.phone}
                    onPress={handlePhoneCall}
                    actionIcon="chevron-forward"
                />

                <ContactCard
                    icon="mail-outline"
                    title="Email"
                    value={contactInfo.email}
                    onPress={handleEmail}
                    actionIcon="chevron-forward"
                />

                <ContactCard
                    icon="logo-whatsapp"
                    title="WhatsApp"
                    value="Chat with us"
                    onPress={handleWhatsApp}
                    actionIcon="chevron-forward"
                />

                <ContactCard
                    icon="location-outline"
                    title="Address"
                    value={contactInfo.address}
                    onPress={handleOpenMaps}
                    actionIcon="navigate-outline"
                />

                {/* Working Hours */}
                <View style={styles.hoursCard}>
                    <Ionicons name="time-outline" size={24} color={Colors.warning} />
                    <View style={styles.hoursInfo}>
                        <Text style={styles.hoursTitle}>Working Hours</Text>
                        <Text style={styles.hoursValue}>{contactInfo.workingHours}</Text>
                    </View>
                </View>

                {/* Social Links */}
                <Text style={styles.sectionTitle}>Follow Us</Text>
                <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialButton}>
                        <Ionicons name="logo-facebook" size={28} color="#1877F2" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Ionicons name="logo-instagram" size={28} color="#E4405F" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Ionicons name="logo-linkedin" size={28} color="#0A66C2" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.secondary,
    },
    header: {
        padding: 20,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.secondary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.secondary,
        opacity: 0.8,
        marginTop: 4,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    heroCard: {
        backgroundColor: Colors.gray,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        marginBottom: 25,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 15,
        marginBottom: 8,
    },
    heroText: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 15,
        marginTop: 10,
    },
    contactCard: {
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    contactIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactInfo: {
        flex: 1,
        marginLeft: 15,
    },
    contactTitle: {
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 4,
    },
    contactValue: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '600',
    },
    actionIcon: {
        padding: 5,
    },
    hoursCard: {
        backgroundColor: Colors.warning + '15',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    hoursInfo: {
        marginLeft: 15,
    },
    hoursTitle: {
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 4,
    },
    hoursValue: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '600',
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.gray,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
