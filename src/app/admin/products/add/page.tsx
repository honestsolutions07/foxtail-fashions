'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Category {
    id: string;
    name: string;
    slug: string;
    subcategories: string[];
}

const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

interface SizeQuantity {
    [key: string]: number;
}

export default function AddProductPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<SizeQuantity>({});

    // Categories from database
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        subcategory: '',
        description: '',
    });

    // Fetch categories from database
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;

            setCategories(data || []);

            // Set default category and subcategory if available
            if (data && data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    category: data[0].slug,
                    subcategory: data[0].subcategories?.[0] || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoriesLoading(false);
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
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            alert('Please upload at least one image');
            return;
        }

        if (Object.keys(selectedSizes).length === 0) {
            alert(formData.category === 'accessories' ? 'Please enter stock quantity' : 'Please select at least one size');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('products')
                .insert([{
                    name: formData.name,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    subcategory: formData.subcategory,
                    description: formData.description,
                    images: images,
                    image: images[0], // Keep first image as main
                    size_mode: 'select',
                    sizes: selectedSizes,
                }]);

            if (error) throw error;

            router.push('/admin/products');
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-form-page">
            <div className="admin-form-header">
                <button onClick={() => router.back()} className="admin-back-btn">
                    ← Back
                </button>
                <h2>Add New Product</h2>
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
                        <label>Product Images * (Max 5)</label>
                        <div className="admin-image-upload-area">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                multiple
                                hidden
                            />

                            <div className="admin-images-grid">
                                {images.map((img, index) => (
                                    <div key={index} className="admin-image-preview">
                                        <img src={img} alt={`Product ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="admin-image-remove"
                                            onClick={() => removeImage(index)}
                                        >
                                            ✕
                                        </button>
                                        {index === 0 && <span className="admin-image-main">Main</span>}
                                    </div>
                                ))}

                                {images.length < 5 && (
                                    <button
                                        type="button"
                                        className="admin-image-add"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        {uploading ? '⏳' : '➕'}
                                        <span>{uploading ? 'Uploading...' : 'Add Image'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
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
                    <button type="submit" className="admin-btn-primary" disabled={loading || uploading}>
                        {loading ? 'Adding...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
