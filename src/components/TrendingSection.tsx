'use client';

import Image from 'next/image';
import Link from 'next/link';

const categories = [
    {
        id: 1,
        name: 'Men',
        slug: 'men',
        subtitle: 'Shop the collection',
        image: '/men-category.png',
        bgColor: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    },
    {
        id: 2,
        name: 'Women',
        slug: 'women',
        subtitle: 'Explore styles',
        image: '/women-category.png',
        bgColor: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
    },
    {
        id: 3,
        name: 'Kids',
        slug: 'kids',
        subtitle: 'Fun & comfort',
        image: '/kids-category.png',
        bgColor: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
    },
    {
        id: 4,
        name: 'Customize',
        slug: 'customize',
        subtitle: 'Make it yours',
        image: '/customize-category.png',
        bgColor: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
    },
    {
        id: 5,
        name: 'Accessories',
        slug: 'accessories',
        subtitle: 'Complete your look',
        image: '/accessories-category.png',
        bgColor: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
    },
];

const TrendingSection = () => {
    return (
        <section id="categories" style={{ padding: '40px 0', overflow: 'hidden', position: 'relative' }}>
            <div className="container">
                {/* Cards Stack */}
                <div className="trending-stack">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/category/${category.slug}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div
                                className="landscape-card"
                                style={{ background: category.bgColor }}
                            >
                                {/* Left - Text Content */}
                                <div className="landscape-card-content">
                                    <h3 className="landscape-card-title">{category.name}</h3>
                                    <p className="landscape-card-subtitle">{category.subtitle}</p>
                                    <span className="landscape-card-btn">
                                        Shop Now
                                        <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>

                                {/* Right - Image */}
                                <div
                                    className="landscape-card-image"

                                >
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        style={{
                                            objectFit: 'contain',
                                            objectPosition: category.name === 'Kids' ? 'right bottom' : 'right bottom',
                                            transform: category.name === 'Kids' ? 'scale(0.9) translateY(20px)' : 'none'
                                        }}
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrendingSection;
