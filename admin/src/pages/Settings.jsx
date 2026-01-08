import React, { useState, useEffect } from 'react';
import { Upload, Save, QrCode, Loader2, Check, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Settings = () => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQrCode();
    }, []);

    const fetchQrCode = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/settings/partner_qr_code`);
            setQrCodeUrl(response.data.value);
            setPreviewUrl(response.data.value);
        } catch (err) {
            // Setting might not exist yet
            console.log('No QR code set yet');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setError('');
        setUploading(true);

        // Convert to base64 for preview
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result;
            setPreviewUrl(base64);

            // Upload to Cloudinary via dedicated QR endpoint
            try {
                const uploadResponse = await axios.post(`${API_URL}/upload/qr`, {
                    image: base64
                });
                setQrCodeUrl(uploadResponse.data.url);
                setUploading(false);
            } catch (err) {
                setError('Failed to upload image to Cloudinary. Please try again.');
                setPreviewUrl(qrCodeUrl); // Revert to old image
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!qrCodeUrl) {
            setError('Please upload a QR code image first');
            return;
        }

        setSaving(true);
        setError('');
        try {
            await axios.post(`${API_URL}/settings`, {
                key: 'partner_qr_code',
                value: qrCodeUrl
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">Manage application settings</p>
            </div>

            {/* QR Code Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Partner QR Code</h2>
                        <p className="text-sm text-gray-500">This QR code will be shown to partners in their dashboard</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <>
                        {/* Image Preview */}
                        <div className="mb-6">
                            {previewUrl ? (
                                <div className="relative inline-block">
                                    <img
                                        src={previewUrl}
                                        alt="QR Code Preview"
                                        className="max-w-xs max-h-64 rounded-xl border-2 border-gray-200 shadow-sm"
                                    />
                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                        Preview
                                    </div>
                                </div>
                            ) : (
                                <div className="w-64 h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                                    <p className="text-gray-500 text-sm">No QR code uploaded</p>
                                </div>
                            )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex items-center gap-4">
                            <label className={`cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                <div className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium text-gray-700">
                                    {uploading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Upload className="w-5 h-5" />
                                    )}
                                    {uploading ? 'Uploading to Cloudinary...' : 'Upload New QR Code'}
                                </div>
                            </label>

                            <button
                                onClick={handleSave}
                                disabled={saving || uploading || !qrCodeUrl}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-medium ${saved
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : saved ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {saved ? 'Saved!' : 'Save Changes'}
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Info */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <p className="text-sm text-blue-700">
                                <strong>Tip:</strong> Upload a clear QR code image that partners can show to customers for payments or verification.
                                Recommended size: 300x300 pixels or larger.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Settings;
