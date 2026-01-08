
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Platform, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
    const router = useRouter();
    const [isProfessional, setIsProfessional] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    if (user.role === 'professional') {
                        setIsProfessional(true);
                    }
                }
            } catch (error) {
                console.error('Error checking user role:', error);
            }
        };
        checkRole();
    }, []);

    // Profile button component for header
    const ProfileButton = () => (
        <TouchableOpacity
            onPress={() => router.push('/profile')}
            style={{
                marginRight: 15,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: Colors.primary + '15',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Ionicons name="person" size={18} color={Colors.primary} />
        </TouchableOpacity>
    );

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: Colors.primary,
                },
                headerTintColor: Colors.secondary,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerRight: () => <ProfileButton />,
                tabBarStyle: {
                    backgroundColor: Colors.secondary,
                    borderTopColor: Colors.border,
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textLight,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false, // Home has its own header design
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'My Orders',
                    headerShown: false, // Has custom header
                    href: isProfessional ? null : undefined,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="partner"
                options={{
                    title: 'Partner',
                    headerShown: false, // Has custom header
                    href: isProfessional ? undefined : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="briefcase-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="about"
                options={{
                    title: 'About Us',
                    headerShown: false, // Has custom header
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="information-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="contact"
                options={{
                    title: 'Contact',
                    headerShown: false, // Has custom header
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
