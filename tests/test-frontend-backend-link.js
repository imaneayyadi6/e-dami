import axios from 'axios';

async function testFrontendBackendLink() {
  try {
    console.log('🔍 Test de liaison frontend-backend...\n');

    
    console.log('1. Test direct du backend (port 4000)...');
    try {
      const backendResponse = await axios.post('http://localhost:4000/api/utilisateurs/login', {
        email: 'demandeur@snrt.ma',
        password: '123456'
      });
      console.log('✅ Backend direct - Connexion réussie');
    } catch (error) {
      console.log(`❌ Backend direct - Erreur: ${error.response?.status}`);
    }

    
    console.log('\n2. Test via le proxy frontend (port 3000)...');
    try {
      const frontendResponse = await axios.post('http://localhost:3000/api/utilisateurs/login', {
        email: 'demandeur@snrt.ma',
        password: '123456'
      });
      console.log('✅ Frontend proxy - Connexion réussie');
      console.log(`📋 Token reçu: ${frontendResponse.data.token ? 'Oui' : 'Non'}`);
    } catch (error) {
      console.log(`❌ Frontend proxy - Erreur: ${error.response?.status}`);
      console.log(`📋 Message: ${error.response?.data?.error || error.message}`);
    }

    
    console.log('\n3. Test des endpoints via le proxy...');
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/utilisateurs/login', {
        email: 'demandeur@snrt.ma',
        password: '123456'
      });
      
      const token = loginResponse.data.token;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      
      const optionsResponse = await axios.get('http://localhost:3000/api/options', config);
      console.log(`✅ Options via proxy - ${optionsResponse.data.length} éléments`);

      
      const directionsResponse = await axios.get('http://localhost:3000/api/directions', config);
      console.log(`✅ Directions via proxy - ${directionsResponse.data.length} éléments`);

    } catch (error) {
      console.log(`❌ Endpoints via proxy - Erreur: ${error.response?.status}`);
      console.log(`📋 Message: ${error.response?.data?.error || error.message}`);
    }

    console.log('\n🎯 Test terminé!');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testFrontendBackendLink();
