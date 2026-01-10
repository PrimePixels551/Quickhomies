import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, Animated, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { serviceAPI } from '../services/api';
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

export default function ServicesScreen() {
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [filteredServices, setFilteredServices] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchServices();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredServices(services);
        } else {
            const filtered = services.filter(service =>
                service.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredServices(filtered);
        }
    }, [searchQuery, services]);

    const fetchServices = async () => {
        try {
            const response = await serviceAPI.getAll();
            const formattedServices = response.data.map((item: any) => ({
                id: item._id,
                name: item.name,
                icon: item.icon,
                description: item.description || 'Professional service at your doorstep',
                minPrice: item.minPrice || 0,
                maxPrice: item.maxPrice || 0
            }));
            setServices(formattedServices);
            setFilteredServices(formattedServices);
        } catch (error) {
            console.log('Error fetching services:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchServices();
        setRefreshing(false);
    };

    const colorSchemes = [
        { gradient: [COLORS.blue, COLORS.lightBlue] as const, border: COLORS.blue },
        { gradient: [COLORS.navy, COLORS.navyLight] as const, border: COLORS.navy },
        { gradient: [COLORS.lightBlue, COLORS.skyBlue] as const, border: COLORS.lightBlue },
        { gradient: [COLORS.navyLight, COLORS.navy] as const, border: COLORS.navyLight },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={[COLORS.navy, COLORS.navyLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>All Services</Text>
                        <Text style={styles.headerSubtitle}>{filteredServices.length} services available</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color={COLORS.grey} />
                    <TextInput
                        placeholder="Search services..."
                        placeholderTextColor={COLORS.grey}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.grey} />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.navy]}
                        tintColor={COLORS.navy}
                    />
                }
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {filteredServices.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={60} color={COLORS.grey} />
                            <Text style={styles.emptyTitle}>No services found</Text>
                            <Text style={styles.emptyText}>Try a different search term</Text>
                        </View>
                    ) : (
                        <View style={styles.servicesGrid}>
                            {filteredServices.map((service, index) => {
                                const colorScheme = colorSchemes[index % 4];

                                return (
                                    <TouchableOpacity
                                        key={service.id}
                                        style={styles.serviceCard}
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
                                            <Ionicons name={service.icon as any} size={32} color={COLORS.white} />
                                        </LinearGradient>
                                        <View style={styles.serviceInfo}>
                                            <Text style={styles.serviceName}>{service.name}</Text>
                                            <Text style={styles.serviceDescription} numberOfLines={2}>
                                                {service.description}
                                            </Text>
                                            {(service.minPrice > 0 || service.maxPrice > 0) && (
                                                <View style={styles.priceContainer}>
                                                    <Text style={styles.priceText}>
                                                        ₹{service.minPrice} - ₹{service.maxPrice}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.arrowContainer}>
                                            <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.greyBg,
    },
    headerGradient: {
        paddingBottom: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 13,
        color: COLORS.greyLight,
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.navy,
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.navy,
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.grey,
        marginTop: 4,
    },
    servicesGrid: {
        gap: 14,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    serviceIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceInfo: {
        flex: 1,
        marginLeft: 14,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.navy,
        marginBottom: 4,
    },
    serviceDescription: {
        fontSize: 13,
        color: COLORS.grey,
        lineHeight: 18,
    },
    priceContainer: {
        marginTop: 8,
        backgroundColor: COLORS.greyBg,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    priceText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.blue,
    },
    arrowContainer: {
        padding: 8,
    },
});
