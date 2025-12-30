'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabaseAdmin, Ad } from '@/lib/supabase';

export default function AdminAdsPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const { data, error } = await supabaseAdmin
                .from('ads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAds(data || []);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            setUploading(true);

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `ads/${fileName}`;

            // Upload image
            const { error: uploadError } = await supabaseAdmin.storage
                .from('product-images') // Updated to match user's bucket
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('product-images')
                .getPublicUrl(filePath);

            // Create ad record
            const { error: dbError } = await supabaseAdmin
                .from('ads')
                .insert([
                    { image_url: publicUrl, active: true }
                ]);

            if (dbError) throw dbError;

            await fetchAds();
            alert('Ad uploaded successfully!');
        } catch (error) {
            console.error('Error uploading ad:', error);
            alert('Failed to upload ad. Make sure "ads" table and storage bucket exist.');
        } finally {
            setUploading(false);
            // Reset input
            event.target.value = '';
        }
    };

    const toggleAdStatus = async (adId: string, currentStatus: boolean) => {
        try {
            // First, if we are activating, deactivate all others (assuming single ad slot for now)
            if (!currentStatus) {
                await supabaseAdmin
                    .from('ads')
                    .update({ active: false })
                    .neq('id', 0); // Update all
            }

            const { error } = await supabaseAdmin
                .from('ads')
                .update({ active: !currentStatus })
                .eq('id', adId);

            if (error) throw error;
            fetchAds();
        } catch (error) {
            console.error('Error updating ad:', error);
            alert('Failed to update status');
        }
    };

    const deleteAd = async (adId: string) => {
        if (!confirm('Are you sure you want to delete this ad?')) return;

        try {
            const { error } = await supabaseAdmin
                .from('ads')
                .delete()
                .eq('id', adId);

            if (error) throw error;
            fetchAds();
        } catch (error) {
            console.error('Error deleting ad:', error);
            alert('Failed to delete ad');
        }
    };

    if (loading) return <div className="admin-loading"><div className="admin-spinner"></div></div>;

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h2>Manage Ads/Banners</h2>
                <div className="upload-btn-wrapper">
                    <button className="admin-btn-primary" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload New Ad'}
                    </button>
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        accept="image/*"
                        disabled={uploading}
                    />
                </div>
            </div>

            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                Upload landscape images (e.g. 1200x400px). Toggle 'Active' to display on the homepage.
            </p>

            <div className="ads-grid">
                {ads.map((ad) => (
                    <div key={ad.id} className={`ad-card ${ad.active ? 'active' : ''}`}>
                        <div className="ad-image-wrapper">
                            <Image
                                src={ad.image_url}
                                alt="Ad"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                            {ad.active && <span className="active-badge">Active</span>}
                        </div>
                        <div className="ad-actions">
                            <button
                                className={`status-toggle ${ad.active ? 'active' : ''}`}
                                onClick={() => toggleAdStatus(ad.id, ad.active)}
                            >
                                {ad.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() => deleteAd(ad.id)}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}

                {ads.length === 0 && (
                    <div className="no-ads-state">
                        <p>No ads uploaded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
