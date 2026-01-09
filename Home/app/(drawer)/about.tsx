
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

export default function AboutScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const features = [
        { icon: 'shield-checkmark-outline', title: 'Verified Professionals', description: 'All our service providers are thoroughly verified' },
        { icon: 'flash-outline', title: 'Quick Service', description: 'Get help within hours, not days' },
        { icon: 'wallet-outline', title: 'Fair Pricing', description: 'Transparent pricing with no hidden charges' },
        { icon: 'star-outline', title: 'Quality Assured', description: 'Rated professionals for quality service' },
    ];

    const stats = [
        { value: '10K+', label: 'Happy Customers' },
        { value: '500+', label: 'Professionals' },
        { value: '25+', label: 'Services' },
        { value: '4.8', label: 'App Rating' },
    ];

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate refresh for static content
        setTimeout(() => setRefreshing(false), 500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                        <Ionicons name="menu" size={28} color={Colors.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>About Us</Text>
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
                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="home" size={50} color={Colors.primary} />
                    </View>
                    <Text style={styles.appName}>QuickHomies</Text>
                    <Text style={styles.tagline}>Your Trusted Home Services Partner</Text>
                </View>

                {/* Mission Statement */}
                <View style={styles.missionCard}>
                    <Text style={styles.missionTitle}>Our Mission</Text>
                    <Text style={styles.missionText}>
                        Our mission is to simplify access to everyday services by building a reliable, technology-driven platform that empowers skilled workers, ensures customer trust, enables fair earnings, and creates sustainable service ecosystems that grow seamlessly from local communities to global markets.
                    </Text>
                </View>

                {/* Stats Section */}
                {/* <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statItem}>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View> */}

                {/* Why Choose Us */}
                <Text style={styles.sectionTitle}>Why Choose Us?</Text>
                <View style={styles.featuresContainer}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureCard}>
                            <View style={styles.featureIconContainer}>
                                <Ionicons name={feature.icon as any} size={28} color={Colors.primary} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Our Story */}
                <View style={styles.storyCard}>
                    <Text style={styles.storyTitle}>Our Story</Text>
                    <Text style={styles.storyText}>
                        Founded in 2024, QuickHomies started with a simple idea: make finding reliable home
                        service professionals as easy as ordering food online. What began as a small startup
                        has grown into a trusted platform serving thousands of customers across the city.
                    </Text>
                    <Text style={styles.storyText}>
                       Quick Homies was founded by five friends who came together with a shared vision to simplify everyday services through technology. What started as a small idea has grown into a purpose-driven platform focused on trust, accessibility, and efficiency. By connecting customers with verified local helpers, the team aims to empower workers, create employment opportunities, and make reliable services available at the tap of a button. Quick Homies is built for scale, impact, and long-term community value.
                    </Text>
                </View>

                {/* Version Info */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                    <Text style={styles.copyrightText}>© 2024 QuickHomies. All rights reserved.</Text>
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
        textAlign: 'center',
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
    heroSection: {
        alignItems: 'center',
        marginBottom: 25,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 5,
    },
    tagline: {
        fontSize: 14,
        color: Colors.textLight,
    },
    missionCard: {
        backgroundColor: Colors.primary,
        borderRadius: 20,
        padding: 25,
        marginBottom: 25,
    },
    missionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: 10,
    },
    missionText: {
        fontSize: 14,
        color: Colors.secondary,
        lineHeight: 22,
        opacity: 0.9,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    statItem: {
        width: '48%',
        backgroundColor: Colors.gray,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 15,
    },
    featuresContainer: {
        marginBottom: 25,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    featureIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureContent: {
        flex: 1,
        marginLeft: 15,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 13,
        color: Colors.textLight,
    },
    storyCard: {
        backgroundColor: Colors.gray,
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
    },
    storyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    storyText: {
        fontSize: 14,
        color: Colors.textLight,
        lineHeight: 22,
        marginBottom: 10,
    },
    versionContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    versionText: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 5,
    },
    copyrightText: {
        fontSize: 12,
        color: Colors.textLight,
        opacity: 0.7,
    },
});
