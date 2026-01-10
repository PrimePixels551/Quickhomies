import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Animated, PanResponder } from 'react-native';
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

    const handleDeleteNotification = async (id: string) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await notificationAPI.delete(id);
                            setNotifications(prev => prev.filter(n => n._id !== id));
                        } catch (error) {
                            console.log('Error deleting notification', error);
                        }
                    }
                }
            ]
        );
    };

    const handleClearAllNotifications = async () => {
        if (!userId) return;

        Alert.alert(
            'Clear All Notifications',
            'Are you sure you want to delete all notifications?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await notificationAPI.deleteAll(userId);
                            setNotifications([]);
                        } catch (error) {
                            console.log('Error clearing notifications', error);
                        }
                    }
                }
            ]
        );
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order':
                return 'cart';
            case 'payment':
                return 'wallet';
            case 'system':
                return 'information-circle';
            default:
                return 'notifications';
        }
    };

    // Helper function to format time ago
    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, !item.read && styles.unreadCard]}
            onPress={() => handleMarkRead(item._id, item.read)}
            onLongPress={() => handleDeleteNotification(item._id)}
            activeOpacity={0.8}
        >
            <View style={[styles.iconContainer, !item.read && { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name={getNotificationIcon(item.type) as any} size={24} color={Colors.primary} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
                        </View>
                    )}
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => userId && notificationAPI.markAllRead(userId).then(() => onRefresh())}
                    >
                        <Ionicons name="checkmark-done-outline" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                    {notifications.length > 0 && (
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={handleClearAllNotifications}
                        >
                            <Ionicons name="trash-outline" size={22} color="#EF4444" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {notifications.length > 0 && (
                <Text style={styles.swipeHint}>Long press to delete a notification</Text>
            )}

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color={Colors.textLight} />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                        <Text style={styles.emptySubtext}>We'll notify you when something important happens</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.secondary },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: Colors.secondary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    headerButton: {
        padding: 8,
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unreadBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    swipeHint: {
        textAlign: 'center',
        color: Colors.textLight,
        fontSize: 12,
        paddingVertical: 8,
        backgroundColor: Colors.gray,
    },
    list: { padding: 16, paddingBottom: 100 },
    card: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        backgroundColor: Colors.gray,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center'
    },
    unreadCard: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.primary,
        borderLeftWidth: 4
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    content: { flex: 1 },
    title: { fontWeight: 'bold', fontSize: 15, color: Colors.text, marginBottom: 4 },
    message: { fontSize: 13, color: Colors.textLight, marginBottom: 6, lineHeight: 18 },
    time: { fontSize: 11, color: Colors.textLight, opacity: 0.7 },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginLeft: 10 },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 16,
        color: Colors.text,
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubtext: {
        textAlign: 'center',
        marginTop: 8,
        color: Colors.textLight,
        fontSize: 14,
        paddingHorizontal: 40,
    }
});
