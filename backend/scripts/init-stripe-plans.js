const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function initializeStripePlans() {
  try {
    console.log('🚀 Initialisation des plans Stripe...');
    
    // Vérifier la connexion Stripe
    const account = await stripe.accounts.retrieve();
    console.log('✅ Connexion Stripe réussie');
    console.log(`📧 Compte: ${account.email}`);
    console.log(`🌍 Pays: ${account.country}`);
    
    // Créer les produits Stripe
    const products = [
      {
        name: 'Starter',
        description: 'Parfait pour débuter',
        metadata: {
          tier: 'basic',
          features: JSON.stringify(['Jusqu\'à 5 projets', 'Support email', 'Stockage 1GB'])
        }
      },
      {
        name: 'Pro',
        description: 'Pour les professionnels',
        metadata: {
          tier: 'premium',
          features: JSON.stringify(['Projets illimités', 'Support prioritaire', 'Stockage 10GB', 'Analytics avancées'])
        }
      },
      {
        name: 'Enterprise',
        description: 'Pour les grandes entreprises',
        metadata: {
          tier: 'enterprise',
          features: JSON.stringify(['Tout de Pro', 'Support 24/7', 'Stockage illimité', 'API personnalisée'])
        }
      }
    ];
    
    const createdProducts = [];
    
    for (const productData of products) {
      try {
        // Vérifier si le produit existe déjà
        const existingProducts = await stripe.products.list({
          limit: 100
        });
        
        const existingProduct = existingProducts.data.find(p => p.name === productData.name);
        
        if (existingProduct) {
          console.log(`⚠️ Produit "${productData.name}" existe déjà`);
          createdProducts.push(existingProduct);
          continue;
        }
        
        // Créer le produit
        const product = await stripe.products.create(productData);
        console.log(`✅ Produit créé: ${product.name} (${product.id})`);
        
        // Créer les prix
        const prices = [
          {
            product: product.id,
            unit_amount: productData.name === 'Starter' ? 2900 : 
                        productData.name === 'Pro' ? 9900 : 29900,
            currency: 'eur',
            recurring: { interval: 'month' },
            nickname: `${productData.name} - Mensuel`
          },
          {
            product: product.id,
            unit_amount: productData.name === 'Starter' ? 29000 : 
                        productData.name === 'Pro' ? 99000 : 299000,
            currency: 'eur',
            recurring: { interval: 'year' },
            nickname: `${productData.name} - Annuel`
          }
        ];
        
        for (const priceData of prices) {
          const price = await stripe.prices.create(priceData);
          console.log(`  💰 Prix créé: ${price.nickname} (${price.id})`);
        }
        
        createdProducts.push(product);
        
      } catch (error) {
        console.error(`❌ Erreur lors de la création du produit ${productData.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Initialisation terminée ! ${createdProducts.length} produits créés.`);
    console.log('\n📋 Résumé des produits:');
    createdProducts.forEach(product => {
      console.log(`  - ${product.name}: ${product.id}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation Stripe:', error.message);
    process.exit(1);
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  require('dotenv').config({ path: '../config.env' });
  initializeStripePlans();
}

module.exports = { initializeStripePlans };