import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationAPI } from '../../services/api';

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUserAndNotifications();
    }, []);

    const loadUserAndNotifications = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserId(user._id);
            fetchNotifications(user._id);
        }
    };

    const fetchNotifications = async (id: string) => {
        try {
            const { data } = await notificationAPI.getAll(id);
            setNotifications(data);
        } catch (error) {
            console.log('Error fetching notifications', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (userId) await fetchNotifications(userId);
        setRefreshing(false);
    };

    const handleMarkRead = async (id: string, read: boolean) => {
        if (read) return;
        try {
            await notificationAPI.markRead(id);
            // Update local state
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.log(error);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, !item.read && styles.unreadCard]}
            onPress={() => handleMarkRead(item._id, item.read)}
            activeOpacity={0.8}
        >
            <View style={[styles.iconContainer, !item.read && { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name={item.type === 'order' ? 'cart' : 'notifications'} size={24} color={Colors.primary} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => userId && notificationAPI.markAllRead(userId).then(() => onRefresh())}>
                    <Ionicons name="checkmark-done-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No notifications yet.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.secondary },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: Colors.secondary, borderBottomWidth: 1, borderBottomColor: Colors.border },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
    list: { padding: 20 },
    card: { flexDirection: 'row', padding: 15, borderRadius: 12, backgroundColor: Colors.gray, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
    unreadCard: { backgroundColor: Colors.secondary, borderColor: Colors.primary, borderLeftWidth: 4 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    content: { flex: 1 },
    title: { fontWeight: 'bold', fontSize: 16, color: Colors.text, marginBottom: 4 },
    message: { fontSize: 14, color: Colors.textLight, marginBottom: 6, lineHeight: 20 },
    time: { fontSize: 12, color: Colors.textLight, opacity: 0.8 },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginLeft: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, color: Colors.textLight, fontSize: 16 }
});
