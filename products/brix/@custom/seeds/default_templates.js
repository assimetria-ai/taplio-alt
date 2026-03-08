/**
 * Brix - Default Templates Seed
 * Task #9681 - MVP: Four storefront templates
 */

const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, whitespace-focused design perfect for modern brands',
    category: 'minimal',
    preview_image: 'https://via.placeholder.com/1200x800/ecfeff/06b6d4?text=Minimal',
    thumbnail: 'https://via.placeholder.com/400x300/ecfeff/06b6d4?text=Minimal',
    default_settings: {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      font: 'Inter',
      headerStyle: 'minimal',
      cardStyle: 'flat'
    },
    default_blocks: [
      {
        type: 'hero',
        title: 'Welcome to Your Store',
        subtitle: 'Discover our curated collection',
        image: null,
        cta: { text: 'Shop Now', link: '#products' }
      },
      {
        type: 'spacer',
        height: 80
      },
      {
        type: 'productGrid',
        columns: 3,
        products: 'all',
        showPrices: true
      }
    ],
    features: [
      'Clean typography',
      'Generous whitespace',
      'Mobile-first design',
      'Fast loading'
    ],
    is_active: true,
    is_premium: false
  },
  
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold typography and vibrant colors for creative brands',
    category: 'modern',
    preview_image: 'https://via.placeholder.com/1200x800/f0fdfa/14b8a6?text=Modern',
    thumbnail: 'https://via.placeholder.com/400x300/f0fdfa/14b8a6?text=Modern',
    default_settings: {
      primaryColor: '#14b8a6',
      secondaryColor: '#f59e0b',
      font: 'Poppins',
      headerStyle: 'bold',
      cardStyle: 'elevated'
    },
    default_blocks: [
      {
        type: 'hero',
        title: 'Stand Out',
        subtitle: 'Bold designs for bold brands',
        image: null,
        cta: { text: 'Explore', link: '#products' }
      },
      {
        type: 'productFeatured',
        productId: null,
        layout: 'split'
      },
      {
        type: 'spacer',
        height: 60
      },
      {
        type: 'productGrid',
        columns: 4,
        products: 'all',
        showPrices: true
      }
    ],
    features: [
      'Bold typography',
      'Vibrant colors',
      'Image-forward layout',
      'Animations'
    ],
    is_active: true,
    is_premium: false
  },
  
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional e-commerce layout with structured navigation',
    category: 'classic',
    preview_image: 'https://via.placeholder.com/1200x800/fef3c7/f59e0b?text=Classic',
    thumbnail: 'https://via.placeholder.com/400x300/fef3c7/f59e0b?text=Classic',
    default_settings: {
      primaryColor: '#1e40af',
      secondaryColor: '#dc2626',
      font: 'Georgia',
      headerStyle: 'traditional',
      cardStyle: 'bordered'
    },
    default_blocks: [
      {
        type: 'hero',
        title: 'Quality Products',
        subtitle: 'Trusted by customers since day one',
        image: null,
        cta: { text: 'Shop All', link: '#products' }
      },
      {
        type: 'text',
        content: 'Browse our carefully curated selection of premium products.',
        alignment: 'center'
      },
      {
        type: 'spacer',
        height: 40
      },
      {
        type: 'productGrid',
        columns: 3,
        products: 'all',
        showPrices: true
      }
    ],
    features: [
      'Sidebar navigation',
      'Structured layout',
      'Trust signals',
      'Traditional design'
    ],
    is_active: true,
    is_premium: false
  },
  
  {
    id: 'bold',
    name: 'Bold',
    description: 'High-contrast, statement-making design for brands that dare',
    category: 'bold',
    preview_image: 'https://via.placeholder.com/1200x800/18181b/fafafa?text=Bold',
    thumbnail: 'https://via.placeholder.com/400x300/18181b/fafafa?text=Bold',
    default_settings: {
      primaryColor: '#18181b',
      secondaryColor: '#ef4444',
      font: 'Montserrat',
      headerStyle: 'statement',
      cardStyle: 'sharp'
    },
    default_blocks: [
      {
        type: 'hero',
        title: 'MAKE A STATEMENT',
        subtitle: 'Unapologetically bold.',
        image: null,
        cta: { text: 'DISCOVER', link: '#products' }
      },
      {
        type: 'divider',
        style: 'solid',
        color: '#ef4444'
      },
      {
        type: 'productGrid',
        columns: 2,
        products: 'all',
        showPrices: true,
        layout: 'asymmetric'
      }
    ],
    features: [
      'High contrast',
      'Statement typography',
      'Asymmetric layouts',
      'Edge-to-edge design'
    ],
    is_active: true,
    is_premium: false
  }
]

exports.seed = async function(knex) {
  // Delete existing templates
  await knex('templates').del()
  
  // Insert default templates
  await knex('templates').insert(TEMPLATES.map(template => ({
    ...template,
    default_blocks: JSON.stringify(template.default_blocks),
    default_settings: JSON.stringify(template.default_settings),
    features: JSON.stringify(template.features),
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  })))
  
  console.log(`✅ Seeded ${TEMPLATES.length} default templates`)
}
