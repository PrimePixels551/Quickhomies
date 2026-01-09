
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Platform, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomDrawerContent(props: any) {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        AsyncStorage.getItem('user').then(data => {
            if (data) setUser(JSON.parse(data));
        });
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
                {/* Header Section */}
                <View style={{
                    backgroundColor: Colors.primary,
                    padding: 20,
                    paddingTop: Math.max(top, 20) + 10,
                    paddingBottom: 25,
                    marginBottom: 10
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                        <View style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: '#fff',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 15,
                            overflow: 'hidden'
                        }}>
                            <Ionicons name="person" size={35} color={Colors.primary} />
                        </View>
                        <View>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                                {user?.name || 'Welcome!'}
                            </Text>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                                {user?.email || 'QuickHomies App'}
                            </Text>
                        </View>
                    </View>
                </View>

                <DrawerItemList {...props} />

                <View style={{ borderTopWidth: 1, borderTopColor: '#f0f0f0', marginTop: 15, paddingTop: 10 }}>
                    <DrawerItem
                        label="Profile"
                        icon={({ color, size }) => <Ionicons name="person-outline" size={22} color={color} />}
                        onPress={() => router.push('/profile')}
                        labelStyle={{ marginLeft: -10, fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }), fontWeight: '500' }}
                        activeTintColor={Colors.primary}
                        inactiveTintColor={Colors.text}
                    />
                </View>
            </DrawerContentScrollView>

            <View style={{ padding: 20, paddingBottom: bottom + 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                <Text style={{ color: '#aaa', fontSize: 12, textAlign: 'center' }}>QuickHomies v1.0.0</Text>
            </View>
        </View>
    );
}

export default function DrawerLayout() {
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

    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false, 

                drawerActiveTintColor: Colors.primary,
                drawerInactiveTintColor: '#666',
                drawerLabelStyle: {
                    marginLeft: -10,
                    fontWeight: '500',
                    fontSize: 15,
                },
                drawerStyle: {
                    backgroundColor: '#fff',
                    width: '80%',
                },
                drawerType: 'front',
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    drawerLabel: 'Home',
                    title: 'Home',
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={22} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="bookings"
                options={{
                    drawerLabel: 'My Orders',
                    title: 'My Orders',
                    headerShown: false,
                    // Hide if professional? Logic from before:
                    // href: isProfessional ? null : undefined, -> In Drawer, use drawerItemStyle display none
                    drawerItemStyle: { display: isProfessional ? 'none' : 'flex' },
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="receipt-outline" size={22} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="partner"
                options={{
                    drawerLabel: 'Partner Dashboard',
                    title: 'Partner',
                    headerShown: false,
                    // href: isProfessional ? undefined : null,
                    drawerItemStyle: { display: isProfessional ? 'flex' : 'none' },
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="briefcase-outline" size={22} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="about"
                options={{
                    drawerLabel: 'About Us',
                    title: 'About Us',
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="information-circle-outline" size={22} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="contact"
                options={{
                    drawerLabel: 'Contact Support',
                    title: 'Contact',
                    headerShown: false,
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-ellipses-outline" size={22} color={color} />
                    ),
                }}
            />
        </Drawer>
    );
}
