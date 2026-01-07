import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serviceAPI } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Premium Navy Blue Color Palette
const COLORS = {
    navy: '#0F172A',
    navyLight: '#1E293B',
    navyDark: '#020617',
    blue: '#3B82F6',
    lightBlue: '#60A5FA',
    skyBlue: '#93C5FD',
    white: '#FFFFFF',
    grey: '#94A3B8',
    greyLight: '#CBD5E1',
    greyBg: '#F1F5F9',
    greyDark: '#475569',
};

export default function HomeScreen() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [userName, setUserName] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        fetchServices();
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await serviceAPI.getAll();
            const formattedServices = response.data.map((item: any) => ({
                id: item._id,
                name: item.name,
                icon: item.icon,
                minPrice: item.minPrice || 0,
                maxPrice: item.maxPrice || 0
            }));
            setServices(formattedServices);
        } catch (error) {
            console.log('Error fetching services:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkAuth();
        }, [])
    );

    const checkAuth = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setIsAuthenticated(true);
            setUserName(user.name || '');
        } else {
            setIsAuthenticated(false);
            setUserName('');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserName('');
        router.replace('/auth/login');
    };

    const handleLoginNavigation = () => {
        router.push('/auth/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header with Navy Gradient */}
                <LinearGradient
                    colors={[COLORS.navy, COLORS.navyLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.header}>
                        <View style={styles.locationContainer}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../../assets/images/logo.png')}
                                    style={styles.headerLogo}
                                />
                                <View style={styles.logoBadge}>
                                    <View style={styles.logoBadgeDot} />
                                </View>
                            </View>
                            <View>
                                <Text style={styles.locationLabel}>
                                    {isAuthenticated ? `Hi, ${userName.split(' ')[0] || 'User'}! 👋` : 'Welcome 👋'}
                                </Text>
                                <Text style={styles.locationText}>Find Your Service</Text>
                            </View>
                        </View>
                        <View style={styles.headerRight}>
                            {!isAuthenticated ? (
                                <TouchableOpacity style={styles.authButton} onPress={handleLoginNavigation}>
                                    <Ionicons name="log-in-outline" size={20} color={COLORS.navy} />
                                    <Text style={styles.authButtonText}>Login</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                    <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchIconWrapper}>
                            <Ionicons name="search-outline" size={22} color={COLORS.grey} />
                        </View>
                        <TextInput
                            placeholder="Search for services..."
                            placeholderTextColor={COLORS.grey}
                            style={styles.searchInput}
                        />
                        <TouchableOpacity style={styles.filterButton}>
                            <LinearGradient
                                colors={[COLORS.blue, COLORS.lightBlue]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.filterButtonGradient}
                            >
                                <Ionicons name="options-outline" size={20} color={COLORS.white} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Hero Section - Premium Navy */}
                <Animated.View
                    style={[
                        styles.heroContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={[COLORS.navy, COLORS.navyDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroTextContainer}>
                            <View style={styles.heroBadge}>
                                <Ionicons name="shield-checkmark" size={14} color={COLORS.blue} />
                                <Text style={styles.heroBadgeText}>Premium Quality</Text>
                            </View>
                            <Text style={styles.heroTitle}>Find Trusted{'\n'}Helpers Near You</Text>
                            <Text style={styles.heroSubtitle}>Professional services at your doorstep with verified experts</Text>
                        </View>
                        <Image
                            source={require('../../assets/images/hero.png')}
                            style={styles.heroImage}
                            resizeMode="contain"
                        />
                        <View style={styles.heroDecoration1} />
                        <View style={styles.heroDecoration2} />
                    </LinearGradient>
                </Animated.View>

                {/* Services Grid - Clean & Premium */}
                <View style={styles.servicesSection}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Our Services</Text>
                            <Text style={styles.sectionSubtitle}>Choose from our wide range</Text>
                        </View>
                    </View>
                    <View style={styles.servicesGrid}>
                        {services.map((service, index) => {
                            const colorSchemes = [
                                { gradient: [COLORS.blue, COLORS.lightBlue] as const, border: COLORS.blue },
                                { gradient: [COLORS.navy, COLORS.navyLight] as const, border: COLORS.navy },
                                { gradient: [COLORS.lightBlue, COLORS.skyBlue] as const, border: COLORS.lightBlue },
                                { gradient: [COLORS.navyLight, COLORS.navy] as const, border: COLORS.navyLight },
                            ];
                            const colorScheme = colorSchemes[index % 4];

                            return (
                                <TouchableOpacity
                                    key={service.id}
                                    style={[styles.serviceCard, { borderColor: colorScheme.border }]}
                                    activeOpacity={0.8}
                                    onPress={() => router.push({
                                        pathname: '/service/[id]',
                                        params: { id: service.id, name: service.name, minPrice: service.minPrice, maxPrice: service.maxPrice }
                                    })}
                                >
                                    <LinearGradient
                                        colors={colorScheme.gradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.serviceIconContainer}
                                    >
                                        <Ionicons name={service.icon as any} size={28} color={COLORS.white} />
                                    </LinearGradient>
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                    {(service.minPrice > 0 || service.maxPrice > 0) && (
                                        <View style={styles.priceContainer}>
                                            <Text style={styles.servicePriceHint}>
                                                ₹{service.minPrice}-{service.maxPrice}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Features Section - Premium Design */}
                <View style={styles.featuresSection}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Why Choose Us?</Text>
                            <Text style={styles.sectionSubtitle}>Experience excellence</Text>
                        </View>
                    </View>
                    <View style={styles.featuresGrid}>
                        {[
                            { icon: 'shield-checkmark', title: 'Verified Pros', colors: [COLORS.blue, COLORS.lightBlue] as const },
                            { icon: 'flash', title: 'Quick Service', colors: [COLORS.navy, COLORS.navyLight] as const },
                            { icon: 'wallet', title: 'Fair Pricing', colors: [COLORS.lightBlue, COLORS.skyBlue] as const },
                            { icon: 'star', title: 'Top Rated', colors: [COLORS.navyLight, COLORS.navy] as const },
                        ].map((feature, index) => (
                            <View key={index} style={styles.featureCard}>
                                <LinearGradient
                                    colors={feature.colors}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.featureIcon}
                                >
                                    <Ionicons name={feature.icon as any} size={26} color={COLORS.white} />
                                </LinearGradient>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>Excellence guaranteed</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Become a Helper Banner - Blue Accent */}
                <TouchableOpacity
                    style={styles.helperBanner}
                    activeOpacity={0.9}
                    onPress={() => router.push('/become-helper')}
                >
                    <LinearGradient
                        colors={[COLORS.blue, COLORS.lightBlue]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.helperBannerGradient}
                    >
                        <View style={styles.helperBannerContent}>
                            <View style={styles.helperIconCircle}>
                                <Ionicons name="briefcase" size={32} color={COLORS.white} />
                            </View>
                            <View style={styles.helperTextContainer}>
                                <Text style={styles.helperBannerTitle}>Become a Helper</Text>
                                <Text style={styles.helperBannerSubtitle}>Join our team & earn money</Text>
                            </View>
                        </View>
                        <View style={styles.arrowCircle}>
                            <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
                        </View>
                        <View style={styles.bannerDecoration1} />
                        <View style={styles.bannerDecoration2} />
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.greyBg,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    headerGradient: {
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    logoContainer: {
        position: 'relative',
    },
    headerLogo: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 5,
        borderColor: COLORS.white,
    },
    logoBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 50,
        backgroundColor: COLORS.blue,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    logoBadgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.white,
    },
    locationLabel: {
        fontSize: 14,
        color: COLORS.greyLight,
        marginBottom: 4,
        fontWeight: '500',
    },
    locationText: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 0.3,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.white,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 24,
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    authButtonText: {
        color: COLORS.navy,
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.3,
    },
    logoutButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: 20,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 20,
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    searchIconWrapper: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.navy,
        paddingVertical: 12,
        fontWeight: '500',
    },
    filterButton: {
        overflow: 'hidden',
        borderRadius: 16,
    },
    filterButtonGradient: {
        padding: 10,
    },
    heroContainer: {
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 32,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    heroGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 28,
        minHeight: 220,
        position: 'relative',
        overflow: 'hidden',
    },
    heroTextContainer: {
        flex: 1,
        paddingRight: 15,
        zIndex: 10,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.white,
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 16,
    },
    heroBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.blue,
        letterSpacing: 0.3,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.white,
        marginBottom: 12,
        lineHeight: 36,
        letterSpacing: 0.5,
    },
    heroSubtitle: {
        fontSize: 14,
        color: COLORS.greyLight,
        lineHeight: 20,
        fontWeight: '500',
    },
    heroImage: {
        width: 140,
        height: 190,
        zIndex: 10,
    },
    heroDecoration1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(59,130,246,0.1)',
        top: -80,
        right: -60,
    },
    heroDecoration2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(59,130,246,0.08)',
        bottom: -50,
        left: -40,
    },
    servicesSection: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.navy,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: COLORS.grey,
        fontWeight: '500',
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 14,
        gap: 14,
    },
    serviceCard: {
        width: (width - 56) / 3,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 18,
        alignItems: 'center',
        borderWidth: 1.5,
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    serviceIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    serviceName: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.navy,
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    priceContainer: {
        backgroundColor: COLORS.greyBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    servicePriceHint: {
        fontSize: 11,
        color: COLORS.blue,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    featuresSection: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
    },
    featureCard: {
        width: (width - 54) / 2,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: COLORS.greyLight + '40',
    },
    featureIcon: {
        width: 60,
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.navy,
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    featureDescription: {
        fontSize: 12,
        color: COLORS.grey,
        fontWeight: '500',
    },
    helperBanner: {
        marginHorizontal: 20,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: COLORS.blue,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    helperBannerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    helperBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
        zIndex: 10,
    },
    helperIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    helperTextContainer: {
        flex: 1,
    },
    helperBannerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.white,
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    helperBannerSubtitle: {
        fontSize: 14,
        color: COLORS.white,
        opacity: 0.85,
        fontWeight: '500',
    },
    arrowCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        zIndex: 10,
    },
    bannerDecoration1: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -50,
        right: -30,
    },
    bannerDecoration2: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: -30,
        left: -20,
    },
});