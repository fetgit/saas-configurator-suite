const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    console.log('🧪 Test de l\'endpoint d\'upload...');
    
    // Test 1: Login pour obtenir un token
    console.log('\n1. Login pour obtenir un token...');
    const loginResponse = await fetch('http://localhost:3003/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@heleam.com',
        password: 'AdminHeleam2025!'
      })
    });
    
    if (!loginResponse.ok) {
      console.log(`❌ Erreur de login: ${loginResponse.status}`);
      const errorText = await loginResponse.text();
      console.log(`❌ Erreur: ${errorText}`);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('🔍 Réponse de login:', loginData);
    
    // Le token peut être dans différentes propriétés
    const token = loginData.token || loginData.accessToken || loginData.access_token;
    console.log('🔍 Token extrait:', token ? 'présent' : 'absent');
    
    if (!token) {
      console.log('❌ Aucun token trouvé dans la réponse');
      return;
    }
    
    console.log('✅ Login réussi, token obtenu');
    
    // Test 2: Créer un fichier de test
    console.log('\n2. Création d\'un fichier de test...');
    const testImagePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testImagePath, 'Test image content');
    console.log('✅ Fichier de test créé');
    
    // Test 3: Test d'upload
    console.log('\n3. Test d\'upload...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath), {
      filename: 'test-image.txt',
      contentType: 'text/plain'
    });
    formData.append('category', 'test');
    
    const uploadResponse = await fetch('http://localhost:3003/api/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    console.log(`📊 Status de l'upload: ${uploadResponse.status}`);
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('✅ Upload réussi:', uploadData);
    } else {
      const errorText = await uploadResponse.text();
      console.log(`❌ Erreur d'upload: ${errorText}`);
    }
    
    // Nettoyage
    fs.unlinkSync(testImagePath);
    console.log('✅ Fichier de test supprimé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  testUpload()
    .then(() => {
      console.log('\n🎉 Test terminé !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test échoué:', error);
      process.exit(1);
    });
}

module.exports = { testUpload };
