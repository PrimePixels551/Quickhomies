
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { orderAPI, reviewAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

export default function BookingsScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewOrder, setReviewOrder] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadUserAndOrders();
        }, [])
    );

    const loadUserAndOrders = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                await fetchOrders(parsedUser._id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Failed to load user', error);
            setLoading(false);
        }
    };

    const fetchOrders = async (userId: string) => {
        try {
            const { data } = await orderAPI.getByUser(userId, 'customer');
            setOrders(data);

            // Check which orders are already reviewed
            const reviewed = new Set<string>();
            for (const order of data) {
                if (order.status === 'Completed') {
                    try {
                        const res = await reviewAPI.checkOrderReview(order._id);
                        if (res.data.reviewed) {
                            reviewed.add(order._id);
                        }
                    } catch (e) {
                        // Ignore errors for individual checks
                    }
                }
            }
            setReviewedOrders(reviewed);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        if (user) {
            setRefreshing(true);
            fetchOrders(user._id);
        }
    };

    const openReviewModal = (order: any) => {
        setReviewOrder(order);
        setRating(5);
        setComment('');
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        if (!reviewOrder || !user) return;

        setSubmitting(true);
        try {
            await reviewAPI.create({
                orderId: reviewOrder._id,
                customerId: user._id,
                rating,
                comment,
            });

            setReviewedOrders(prev => new Set(prev).add(reviewOrder._id));
            setShowReviewModal(false);
            Alert.alert('Thank You!', 'Your review has been submitted successfully.');
        } catch (error: any) {
            console.error('Review Error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return Colors.warning;
            case 'Accepted':
                return Colors.primary;
            case 'PaymentPending':
                return '#F59E0B';
            case 'Completed':
                return Colors.success;
            case 'Cancelled':
                return Colors.error;
            default:
                return Colors.textLight;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'time-outline';
            case 'Accepted':
                return 'checkmark-circle-outline';
            case 'PaymentPending':
                return 'wallet-outline';
            case 'Completed':
                return 'checkmark-done-circle-outline';
            case 'Cancelled':
                return 'close-circle-outline';
            default:
                return 'help-circle-outline';
        }
    };

    const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
        <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => onChange(star)}>
                    <Ionicons
                        name={star <= value ? 'star' : 'star-outline'}
                        size={36}
                        color={star <= value ? '#F59E0B' : Colors.textLight}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Bookings</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="log-in-outline" size={60} color={Colors.textLight} />
                    <Text style={styles.emptyTitle}>Login Required</Text>
                    <Text style={styles.emptyText}>Please login to view your bookings</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>My Bookings</Text>
                    <Text style={styles.headerSubtitle}>{orders.length} order(s)</Text>
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
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
            >
                {loading ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Loading...</Text>
                    </View>
                ) : orders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={60} color={Colors.textLight} />
                        <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                        <Text style={styles.emptyText}>Your bookings will appear here</Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => router.push('/(tabs)')}
                        >
                            <Text style={styles.browseButtonText}>Browse Services</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    orders.slice().reverse().map((order) => (
                        <View key={order._id} style={styles.orderCard}>
                            {/* Status Badge */}
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                <Ionicons name={getStatusIcon(order.status) as any} size={16} color={getStatusColor(order.status)} />
                                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                    {order.status}
                                </Text>
                            </View>

                            {/* Service Info */}
                            <Text style={styles.serviceName}>{order.serviceName}</Text>

                            {/* Professional Info */}
                            {order.professional && (
                                <View style={styles.professionalRow}>
                                    <View style={styles.professionalAvatar}>
                                        <Text style={styles.avatarText}>
                                            {order.professional.name?.charAt(0) || '?'}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.professionalName}>{order.professional.name}</Text>
                                        <Text style={styles.professionalPhone}>{order.professional.phone || 'Contact pending'}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Description */}
                            {order.description && (
                                <View style={styles.descriptionBox}>
                                    <Text style={styles.descriptionLabel}>Your Request:</Text>
                                    <Text style={styles.descriptionText} numberOfLines={2}>{order.description}</Text>
                                </View>
                            )}

                            {/* Footer */}
                            <View style={styles.orderFooter}>
                                <View style={styles.dateContainer}>
                                    <Ionicons name="calendar-outline" size={14} color={Colors.textLight} />
                                    <Text style={styles.dateText}>
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                                <Text style={styles.priceText}>
                                    {order.price > 0 ? `₹${order.price}` : 'Price pending'}
                                </Text>
                            </View>

                            {/* Review Button for Completed Orders */}
                            {order.status === 'Completed' && (
                                reviewedOrders.has(order._id) ? (
                                    <View style={styles.reviewedBadge}>
                                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                        <Text style={styles.reviewedText}>Reviewed</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.reviewButton}
                                        onPress={() => openReviewModal(order)}
                                    >
                                        <Ionicons name="star" size={18} color={Colors.secondary} />
                                        <Text style={styles.reviewButtonText}>Rate & Review</Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Review Modal */}
            <Modal
                visible={showReviewModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowReviewModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Rate Your Experience</Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {reviewOrder && (
                                <>
                                    <Text style={styles.reviewServiceName}>{reviewOrder.serviceName}</Text>
                                    <Text style={styles.reviewProfessionalName}>
                                        by {reviewOrder.professional?.name || 'Professional'}
                                    </Text>

                                    <View style={styles.ratingSection}>
                                        <Text style={styles.ratingLabel}>How was the service?</Text>
                                        <StarRating value={rating} onChange={setRating} />
                                        <Text style={styles.ratingHint}>
                                            {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Okay' : rating === 2 ? 'Poor' : 'Very Poor'}
                                        </Text>
                                    </View>

                                    <View style={styles.commentSection}>
                                        <Text style={styles.commentLabel}>Write a review (optional)</Text>
                                        <TextInput
                                            style={styles.commentInput}
                                            placeholder="Share your experience..."
                                            placeholderTextColor={Colors.textLight}
                                            multiline
                                            numberOfLines={4}
                                            value={comment}
                                            onChangeText={setComment}
                                        />
                                    </View>
                                </>
                            )}
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowReviewModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                                onPress={submitReview}
                                disabled={submitting}
                            >
                                <Text style={styles.submitButtonText}>
                                    {submitting ? 'Submitting...' : 'Submit Review'}
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
        backgroundColor: '#F8F9FA',
    },
    header: {
        padding: 20,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
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
        color: Colors.accent,
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
        padding: 16,
        paddingBottom: 40,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textLight,
        marginTop: 8,
        textAlign: 'center',
    },
    loginButton: {
        marginTop: 20,
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    loginButtonText: {
        color: Colors.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    browseButton: {
        marginTop: 20,
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    browseButtonText: {
        color: Colors.secondary,
        fontWeight: 'bold',
    },
    orderCard: {
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        marginBottom: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    professionalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    professionalAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: Colors.secondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    professionalName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    professionalPhone: {
        fontSize: 12,
        color: Colors.textLight,
    },
    descriptionBox: {
        backgroundColor: Colors.gray,
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    descriptionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textLight,
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 14,
        color: Colors.text,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.gray,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        color: Colors.textLight,
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    // Review Button
    reviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#F59E0B',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 12,
    },
    reviewButtonText: {
        color: Colors.secondary,
        fontWeight: '700',
        fontSize: 14,
    },
    reviewedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        marginTop: 12,
        backgroundColor: Colors.success + '20',
        borderRadius: 10,
    },
    reviewedText: {
        color: Colors.success,
        fontWeight: '600',
        fontSize: 14,
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
        borderBottomColor: Colors.gray,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    modalBody: {
        padding: 20,
    },
    reviewServiceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
    },
    reviewProfessionalName: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: 20,
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 16,
    },
    starContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    ratingHint: {
        fontSize: 14,
        color: '#F59E0B',
        fontWeight: '600',
        marginTop: 10,
    },
    commentSection: {
        marginBottom: 10,
    },
    commentLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 10,
    },
    commentInput: {
        backgroundColor: Colors.gray,
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: Colors.text,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.gray,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.gray,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Colors.text,
        fontWeight: '600',
        fontSize: 16,
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F59E0B',
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: Colors.secondary,
        fontWeight: '700',
        fontSize: 16,
    },
});
