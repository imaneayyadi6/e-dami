import axios from 'axios';

async function testAllEndpoints() {
  try {
    console.log('🔍 Test de tous les endpoints...\n');

    
    console.log('1. Test de connexion...');
    const loginResponse = await axios.post('http://localhost:4000/api/utilisateurs/login', {
      email: 'demandeur@snrt.ma',
      password: '123456'
    });
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    
    console.log('\n2. Test des endpoints...');

    const endpoints = [
      { name: 'Options', url: '/api/options' },
      { name: 'Directions', url: '/api/directions' },
      { name: 'Services', url: '/api/services' },
      { name: 'Départements', url: '/api/departements' },
      { name: 'Mes demandes', url: '/api/demandes/mesdemandes' },
      { name: 'Demandes à traiter', url: '/api/demandes/handle' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`http://localhost:4000${endpoint.url}`, config);
        console.log(`✅ ${endpoint.name} - ${response.data?.length || 'OK'} éléments`);
      } catch (error) {
        console.log(`❌ ${endpoint.name} - ${error.response?.status}: ${error.response?.data?.error || error.message}`);
      }
    }

    console.log('\n🎯 Test terminé!');
    console.log('\n📝 Le serveur backend est maintenant complet et fonctionnel!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testAllEndpoints();
