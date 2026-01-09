import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Modal, Linking, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { orderAPI, userAPI, settingsAPI } from '../../services/api';

export default function PartnerDashboardScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [isOnline, setIsOnline] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [loadingQr, setLoadingQr] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const openOrderDetails = (order: any) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedOrder(null);
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    useEffect(() => {
        loadUserAndOrders();
        fetchQrCode();
    }, []);

    const loadUserAndOrders = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                if (parsedUser.role !== 'professional') {
                    Alert.alert('Access Denied', 'This dashboard is for partners only.');
                    router.replace('/(drawer)');
                    return;
                }

                // Fetch fresh user data from backend to get updated rating
                try {
                    const { data: freshUser } = await userAPI.getUser(parsedUser._id);
                    setUser(freshUser);
                    setIsOnline(freshUser.isAvailable !== undefined ? freshUser.isAvailable : true);

                    // Update local storage with fresh data
                    const updatedUser = { ...parsedUser, ...freshUser };
                    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                } catch (apiError) {
                    // Fallback to cached data if API fails
                    console.log('Using cached user data');
                    setUser(parsedUser);
                    setIsOnline(parsedUser.isAvailable !== undefined ? parsedUser.isAvailable : true);
                }

                fetchOrders(parsedUser._id, parsedUser.role);
            }
        } catch (error) {
            console.error('Failed to load user', error);
        }
    };

    const fetchOrders = async (userId: string, role: string) => {
        try {
            const { data } = await orderAPI.getByUser(userId, role);
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    const fetchQrCode = async () => {
        try {
            const response = await settingsAPI.get('partner_qr_code');
            setQrCodeUrl(response.data.value);
        } catch (error) {
            console.log('No QR code set yet');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadUserAndOrders(), fetchQrCode()]);
        setRefreshing(false);
    };

    const toggleSwitch = async () => {
        if (!user) return;

        try {
            // Optimistic update
            const newState = !isOnline;
            setIsOnline(newState);

            const response = await userAPI.toggleAvailability(user._id);

            // Update local user data
            const updatedUser = { ...user, isAvailable: response.data.isAvailable };
            setUser(updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser)); // Persist updated user

        } catch (error) {
            console.error("Failed to toggle availability", error);
            // Revert on error
            setIsOnline(!isOnline);
            Alert.alert("Error", "Could not update availability status");
        }
    };

    const handleAcceptOrder = async (orderId: string) => {
        try {
            await orderAPI.updateStatus(orderId, { status: 'Accepted' });
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'Accepted' } : o));
            Alert.alert('Order Accepted', 'You can now collect payment from the customer.');
        } catch (error) {
            Alert.alert('Error', 'Failed to accept order.');
        }
    };

    const handlePayClick = (orderId: string) => {
        setPayingOrderId(orderId);
        setPaymentAmount('');
    };

    const handleCancelPay = () => {
        setPayingOrderId(null);
        setPaymentAmount('');
    };

    const handleCashPayment = async (orderId: string) => {
        if (!paymentAmount || Number(paymentAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid payment amount.');
            return;
        }

        Alert.alert(
            'Submit Payment for Approval',
            `Submit ₹${paymentAmount} payment for admin approval?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit',
                    onPress: async () => {
                        try {
                            await orderAPI.updateStatus(orderId, { status: 'PaymentPending', price: Number(paymentAmount) });
                            setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'PaymentPending', price: Number(paymentAmount) } : o));
                            setPayingOrderId(null);
                            setPaymentAmount('');
                            Alert.alert('Success', 'Payment submitted for admin approval. You will be notified once approved.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to submit payment.');
                        }
                    }
                }
            ]
        );
    };

    // Confirm payment function removed - using cash payment only

    const StatCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
        <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
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

                {/* Header & Status Switch */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                                <Ionicons name="menu" size={28} color={Colors.secondary} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Partner Dashboard</Text>
                        </View>
                        <TouchableOpacity
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={() => router.push('/profile')}
                        >
                            <Ionicons name="person" size={20} color={Colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.statusContainer}>
                        <Text style={[styles.statusText, isOnline ? styles.textOnline : styles.textOffline]}>
                            {isOnline ? 'You are Online' : 'You are Offline'}
                        </Text>
                        <Switch
                            trackColor={{ false: Colors.border, true: Colors.success }}
                            thumbColor={Colors.secondary}
                            ios_backgroundColor={Colors.border}
                            onValueChange={toggleSwitch}
                            value={isOnline}
                        />
                    </View>
                </View>

                {/* Stats Overview */}
                <View style={styles.statsGrid}>
                    <StatCard
                        label="Earnings"
                        value={`₹${orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (o.price || 0), 0)}`}
                        icon="cash-outline"
                        color={Colors.success}
                    />
                    <StatCard label="Orders" value={orders.length} icon="list-outline" color={Colors.primary} />
                    <StatCard
                        label="Rating"
                        value={user?.rating > 0 ? user.rating.toFixed(1) : 'New'}
                        icon="star"
                        color="#F59E0B"
                    />
                    <StatCard label="Pending" value={orders.filter(o => o.status === 'Pending').length} icon="time-outline" color={Colors.warning} />
                </View>

                {/* Show QR Button */}
                {qrCodeUrl && (
                    <TouchableOpacity
                        style={styles.showQrButton}
                        onPress={() => setQrModalVisible(true)}
                    >
                        <Ionicons name="qr-code-outline" size={22} color={Colors.secondary} />
                        <Text style={styles.showQrButtonText}>Show QR Code</Text>
                    </TouchableOpacity>
                )}

                {/* Recent Orders Section */}
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                <View style={styles.ordersList}>
                    {orders.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: Colors.textLight, marginTop: 20 }}>No orders yet.</Text>
                    ) : (
                        orders.slice().reverse().map((item) => (
                            <TouchableOpacity key={item._id} style={styles.orderCard} onPress={() => openOrderDetails(item)} activeOpacity={0.7}>
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderCustomer}>{item.customer?.name || 'Unknown'}</Text>
                                    <Text style={[
                                        styles.orderStatus,
                                        item.status === 'Pending' ? { color: Colors.warning } : { color: Colors.success }
                                    ]}>
                                        {item.status}
                                    </Text>
                                </View>
                                <Text style={styles.orderService}>{item.serviceName}</Text>
                                {item.description && (
                                    <Text style={styles.orderDescription} numberOfLines={2}>{item.description}</Text>
                                )}
                                <View style={styles.orderFooter}>
                                    <View style={styles.orderTimeContainer}>
                                        <Ionicons name="time-outline" size={14} color={Colors.textLight} />
                                        <Text style={styles.orderTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <Text style={styles.orderPrice}>₹{item.price || '0'}</Text>
                                </View>
                                {/* Pending: Show only Accept button */}
                                {item.status === 'Pending' && (
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[styles.btn, styles.btnAccept]}
                                            onPress={() => handleAcceptOrder(item._id)}
                                        >
                                            <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                                            <Text style={[styles.btnText, { color: Colors.secondary, marginLeft: 6 }]}>Accept Order</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Accepted: Show Pay button or payment input */}
                                {item.status === 'Accepted' && (
                                    <>
                                        {payingOrderId === item._id ? (
                                            <View style={styles.paymentSection}>
                                                <Text style={styles.paymentLabel}>Enter Payment Amount (₹)</Text>
                                                <View style={styles.paymentInputRow}>
                                                    <TextInput
                                                        style={styles.paymentInput}
                                                        placeholder="e.g., 500"
                                                        placeholderTextColor={Colors.textLight}
                                                        keyboardType="numeric"
                                                        value={paymentAmount}
                                                        onChangeText={setPaymentAmount}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.cashBtn}
                                                        onPress={() => handleCashPayment(item._id)}
                                                    >
                                                        <Ionicons name="checkmark" size={20} color={Colors.secondary} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.cancelBtn}
                                                        onPress={handleCancelPay}
                                                    >
                                                        <Ionicons name="close" size={20} color={Colors.error} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : (
                                            <View style={styles.actionButtons}>
                                                <TouchableOpacity
                                                    style={[styles.btn, styles.btnPay]}
                                                    onPress={() => handlePayClick(item._id)}
                                                >
                                                    <Ionicons name="wallet" size={18} color={Colors.secondary} />
                                                    <Text style={[styles.btnText, { color: Colors.secondary, marginLeft: 6 }]}>Collect Payment</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </>
                                )}

                                {/* PaymentPending: Show waiting for approval message */}
                                {item.status === 'PaymentPending' && (
                                    <View style={styles.paymentPendingBadge}>
                                        <Ionicons name="time-outline" size={18} color="#F59E0B" />
                                        <Text style={styles.paymentPendingText}>
                                            Awaiting admin approval for ₹{item.price}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </View>

            </ScrollView>

            {/* Customer Details Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Customer Details</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedOrder && (
                            <ScrollView style={styles.modalBody}>
                                {/* Customer Info */}
                                <View style={styles.detailSection}>
                                    <View style={styles.customerAvatar}>
                                        <Text style={styles.customerAvatarText}>
                                            {selectedOrder.customer?.name?.charAt(0) || '?'}
                                        </Text>
                                    </View>
                                    <Text style={styles.customerName}>{selectedOrder.customer?.name || 'Unknown'}</Text>
                                </View>

                                {/* Contact Info */}
                                <View style={styles.detailRow}>
                                    <Ionicons name="call-outline" size={20} color={Colors.primary} />
                                    <Text style={styles.detailLabel}>Phone:</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.customer?.phone || 'N/A'}</Text>
                                    {selectedOrder.customer?.phone && (
                                        <TouchableOpacity onPress={() => handleCall(selectedOrder.customer.phone)} style={styles.callButton}>
                                            <Ionicons name="call" size={16} color={Colors.secondary} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                                    <Text style={styles.detailLabel}>Email:</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.customer?.email || 'N/A'}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="location-outline" size={20} color={Colors.primary} />
                                    <Text style={styles.detailLabel}>Address:</Text>
                                    <Text style={[styles.detailValue, { flex: 1 }]}>{selectedOrder.customer?.address || 'Not provided'}</Text>
                                </View>

                                {/* Order Info */}
                                <Text style={styles.sectionDivider}>Order Details</Text>

                                <View style={styles.detailRow}>
                                    <Ionicons name="construct-outline" size={20} color={Colors.primary} />
                                    <Text style={styles.detailLabel}>Service:</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.serviceName}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                                    <Text style={styles.detailLabel}>Date:</Text>
                                    <Text style={styles.detailValue}>{new Date(selectedOrder.createdAt).toLocaleString()}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="pricetag-outline" size={20} color={Colors.primary} />
                                    <Text style={styles.detailLabel}>Price:</Text>
                                    <Text style={styles.detailValue}>₹{selectedOrder.price || '0'}</Text>
                                </View>

                                {selectedOrder.description && (
                                    <View style={styles.descriptionBox}>
                                        <Text style={styles.descriptionLabel}>Customer's Issue:</Text>
                                        <Text style={styles.descriptionText}>{selectedOrder.description}</Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* QR Code Modal */}
            <Modal
                visible={qrModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setQrModalVisible(false)}
            >
                <View style={styles.qrModalOverlay}>
                    <View style={styles.qrModalContent}>
                        <View style={styles.qrModalHeader}>
                            <Text style={styles.qrModalTitle}>Payment QR Code</Text>
                            <TouchableOpacity onPress={() => setQrModalVisible(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.qrImageContainer}>
                            {qrCodeUrl ? (
                                <Image
                                    source={{ uri: qrCodeUrl }}
                                    style={styles.qrImage}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.qrPlaceholder}>
                                    <Ionicons name="qr-code-outline" size={80} color={Colors.textLight} />
                                    <Text style={styles.qrPlaceholderText}>No QR code available</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.qrHelpText}>
                            Show this QR code to customers for payment
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.secondary,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        padding: 20,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.secondary,
        marginBottom: 15,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    textOnline: {
        color: Colors.success,
    },
    textOffline: {
        color: '#CBD5E1', // light gray
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        gap: 12,
        marginBottom: 25,
    },
    statCard: {
        width: '48%',
        backgroundColor: Colors.gray,
        borderRadius: 16,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textLight,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginLeft: 20,
        marginBottom: 15,
    },
    ordersList: {
        paddingHorizontal: 20,
        gap: 15,
    },
    orderCard: {
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    orderCustomer: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    orderStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    orderService: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 6,
    },
    orderDescription: {
        fontSize: 13,
        color: Colors.text,
        backgroundColor: Colors.gray,
        padding: 8,
        borderRadius: 8,
        marginBottom: 10,
        fontStyle: 'italic',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    orderTime: {
        fontSize: 12,
        color: Colors.textLight,
    },
    orderPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 15,
    },
    btn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnDecline: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    btnAccept: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
    },
    btnPay: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
    },
    btnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.secondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
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
    closeButton: {
        padding: 4,
    },
    modalBody: {
        padding: 20,
    },
    detailSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    customerAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    customerAvatarText: {
        color: Colors.secondary,
        fontSize: 28,
        fontWeight: 'bold',
    },
    customerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray,
        gap: 10,
    },
    detailLabel: {
        fontSize: 14,
        color: Colors.textLight,
        width: 70,
    },
    detailValue: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '500',
    },
    callButton: {
        backgroundColor: Colors.success,
        padding: 8,
        borderRadius: 20,
        marginLeft: 'auto',
    },
    sectionDivider: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 20,
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
    },
    descriptionBox: {
        backgroundColor: Colors.gray,
        padding: 15,
        borderRadius: 12,
        marginTop: 15,
    },
    descriptionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: Colors.textLight,
        lineHeight: 20,
    },
    // Payment input styles
    paymentSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.gray,
    },
    paymentLabel: {
        fontSize: 13,
        color: Colors.text,
        fontWeight: '600',
        marginBottom: 8,
    },
    paymentInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    paymentInput: {
        flex: 1,
        backgroundColor: Colors.gray,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.text,
    },
    confirmBtn: {
        backgroundColor: Colors.success,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: Colors.gray,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.error,
    },
    cashBtn: {
        backgroundColor: '#F59E0B', // Orange/Amber for cash
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Show QR Button styles
    showQrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    showQrButtonText: {
        color: Colors.secondary,
        fontSize: 16,
        fontWeight: '700',
    },
    // QR Modal styles
    qrModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrModalContent: {
        backgroundColor: Colors.secondary,
        borderRadius: 24,
        width: '85%',
        maxWidth: 350,
        padding: 24,
        alignItems: 'center',
    },
    qrModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    qrModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    qrImageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: Colors.gray,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    qrImage: {
        width: '100%',
        height: '100%',
    },
    qrPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrPlaceholderText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.textLight,
    },
    qrHelpText: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
    },
    // Payment Pending styles
    paymentPendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FEF3C7',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    paymentPendingText: {
        color: '#B45309',
        fontSize: 13,
        fontWeight: '600',
    },
});
