const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('🧪 Test de l\'authentification...');
    
    // Test 1: Endpoint sans token (devrait échouer)
    console.log('\n1. Test sans token (devrait échouer):');
    try {
      const response = await fetch('http://localhost:3003/api/media/list');
      if (response.status === 401) {
        console.log('✅ Endpoint protégé correctement (401)');
      } else {
        console.log(`❌ Erreur: Status ${response.status} au lieu de 401`);
      }
    } catch (error) {
      console.log(`❌ Erreur de connexion: ${error.message}`);
    }
    
    // Test 2: Endpoint avec token invalide (devrait échouer)
    console.log('\n2. Test avec token invalide (devrait échouer):');
    try {
      const response = await fetch('http://localhost:3003/api/media/list', {
        headers: {
          'Authorization': 'Bearer token_invalide'
        }
      });
      if (response.status === 401) {
        console.log('✅ Token invalide rejeté correctement (401)');
      } else {
        console.log(`❌ Erreur: Status ${response.status} au lieu de 401`);
      }
    } catch (error) {
      console.log(`❌ Erreur de connexion: ${error.message}`);
    }
    
    // Test 3: Test de login pour obtenir un token valide
    console.log('\n3. Test de login pour obtenir un token:');
    try {
      const loginResponse = await fetch('http://localhost:3003/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        if (loginData.token) {
          console.log('✅ Login réussi, token obtenu');
          
          // Test 4: Endpoint avec token valide (devrait réussir)
          console.log('\n4. Test avec token valide (devrait réussir):');
          try {
            const mediaResponse = await fetch('http://localhost:3003/api/media/list', {
              headers: {
                'Authorization': `Bearer ${loginData.token}`
              }
            });
            
            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json();
              console.log('✅ Endpoint media accessible avec token valide');
              console.log(`✅ ${mediaData.files ? mediaData.files.length : 0} images trouvées`);
            } else {
              console.log(`❌ Erreur: Status ${mediaResponse.status}`);
              const errorText = await mediaResponse.text();
              console.log(`❌ Erreur: ${errorText}`);
            }
          } catch (error) {
            console.log(`❌ Erreur lors du test media: ${error.message}`);
          }
        } else {
          console.log('❌ Pas de token dans la réponse de login');
        }
      } else {
        console.log(`❌ Erreur de login: Status ${loginResponse.status}`);
        const errorText = await loginResponse.text();
        console.log(`❌ Erreur: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Erreur de connexion login: ${error.message}`);
    }
    
    console.log('\n🎉 Test d\'authentification terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  testAuth()
    .then(() => {
      console.log('\n✅ Test terminé !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test échoué:', error);
      process.exit(1);
    });
}

module.exports = { testAuth };
