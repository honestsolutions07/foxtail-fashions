'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase, Product } from '@/lib/supabase';

interface Category {
    id: string;
    name: string;
    slug: string;
    subcategories: string[];
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        subcategory: '',
        image: '',
        description: '',
    });

    const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: number }>({});
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL'];

    useEffect(() => {
        fetchCategories();
        fetchProduct();
    }, [productId]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId);

            if (error) {
                console.error('Error fetching product:', error);
            }

            if (data && data.length > 0) {
                const product = data[0];
                setFormData({
                    name: product.name,
                    price: product.price.toString(),
                    category: product.category,
                    subcategory: product.subcategory,
                    image: product.image,
                    description: product.description || '',
                });
                setSelectedSizes(product.sizes || {});
                // Load existing images
                if (product.images && product.images.length > 0) {
                    setImages(product.images);
                } else if (product.image) {
                    setImages([product.image]);
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setFetching(false);
        }
    };

    // Get current category's subcategories
    const currentCategory = categories.find(c => c.slug === formData.category);
    const currentSubcategories = currentCategory?.subcategories || [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'category') {
            // When category changes, reset subcategory to first option
            const newCategory = categories.find(c => c.slug === value);
            setFormData(prev => ({
                ...prev,
                category: value,
                subcategory: newCategory?.subcategories?.[0] || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const toggleSize = (size: string) => {
        setSelectedSizes(prev => {
            if (prev[size] !== undefined) {
                const { [size]: removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [size]: 10 };
        });
    };

    const updateSizeQuantity = (size: string, quantity: number) => {
        setSelectedSizes(prev => ({
            ...prev,
            [size]: Math.max(0, quantity)
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setUploading(true);
        const newImages: string[] = [];

        for (const file of Array.from(files)) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            try {
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                newImages.push(publicUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image');
            }
        }

        setImages(prev => [...prev, ...newImages]);
        setUploading(false);
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (Object.keys(selectedSizes).length === 0) {
            alert(formData.category === 'accessories' ? 'Please enter stock quantity' : 'Please select at least one size');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    subcategory: formData.subcategory,
                    image: images[0] || formData.image,
                    images: images,
                    description: formData.description,
                    size_mode: 'select',
                    sizes: selectedSizes,
                })
                .eq('id', productId);

            if (error) throw error;

            router.push('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="admin-form-page">
                <p>Loading product...</p>
            </div>
        );
    }

    return (
        <div className="admin-form-page">
            <div className="admin-form-header">
                <button onClick={() => router.back()} className="admin-back-btn">
                    ← Back
                </button>
                <h2>Edit Product</h2>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label htmlFor="name">Product Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="price">Price (₹) *</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter price"
                            min="0"
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="category">Category *</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={categoriesLoading}
                        >
                            {categoriesLoading ? (
                                <option value="">Loading categories...</option>
                            ) : categories.length === 0 ? (
                                <option value="">No categories found</option>
                            ) : (
                                categories.map(cat => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="subcategory">Subcategory *</label>
                        <select
                            id="subcategory"
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleChange}
                            required
                            disabled={categoriesLoading || currentSubcategories.length === 0}
                        >
                            {currentSubcategories.length === 0 ? (
                                <option value="">No subcategories</option>
                            ) : (
                                currentSubcategories.map((sub: string) => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Image Upload Section */}
                    <div className="admin-form-group full-width">
                        <label>Product Images (Max 5)</label>

                        {/* Existing Images Preview */}
                        {images.length > 0 && (
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {images.map((img, index) => (
                                    <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                        <img src={img} alt={`Product ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '4px',
                                                right: '4px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            ✕
                                        </button>
                                        {index === 0 && (
                                            <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#000', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                                                Main
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Button */}
                        {images.length < 5 && (
                            <div className="upload-btn-wrapper" style={{ marginTop: '8px' }}>
                                <button type="button" className="admin-btn-secondary" disabled={uploading}>
                                    {uploading ? 'Uploading...' : `📷 ${images.length === 0 ? 'Add Images' : 'Add More Images'}`}
                                </button>
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    multiple
                                    disabled={uploading}
                                    style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                />
                            </div>
                        )}
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px' }}>
                            First image will be the main product image. Click ✕ to remove an image.
                        </p>
                    </div>

                    {/* Size Options Section */}
                    <div className="admin-form-group full-width">
                        <label>
                            {formData.category === 'accessories' ? 'Stock Quantity *' : 'Size Availability *'}
                        </label>

                        {formData.category === 'accessories' ? (
                            <div className="admin-size-quantity">
                                <button
                                    type="button"
                                    onClick={() => updateSizeQuantity('One Size', (selectedSizes['One Size'] || 0) - 1)}
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    value={selectedSizes['One Size'] || 0}
                                    onChange={(e) => updateSizeQuantity('One Size', parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                                <button
                                    type="button"
                                    onClick={() => updateSizeQuantity('One Size', (selectedSizes['One Size'] || 0) + 1)}
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="admin-size-note" style={{ marginBottom: '10px' }}>
                                    Enter quantity for each size. Set to 0 if out of stock.
                                </p>

                                <div className="admin-sizes-grid">
                                    {availableSizes.map(size => (
                                        <div key={size} className="admin-size-item">
                                            <button
                                                type="button"
                                                className={`admin-size-toggle ${selectedSizes[size] !== undefined ? 'active' : ''}`}
                                                onClick={() => toggleSize(size)}
                                            >
                                                {size}
                                            </button>
                                            {selectedSizes[size] !== undefined && (
                                                <div className="admin-size-quantity">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateSizeQuantity(size, selectedSizes[size] - 1)}
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={selectedSizes[size]}
                                                        onChange={(e) => updateSizeQuantity(size, parseInt(e.target.value) || 0)}
                                                        min="0"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateSizeQuantity(size, selectedSizes[size] + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="admin-form-group full-width">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter product description"
                            rows={4}
                        />
                    </div>
                </div>

                <div className="admin-form-actions">
                    <button type="button" onClick={() => router.back()} className="admin-btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="admin-btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

