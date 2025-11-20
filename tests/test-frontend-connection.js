import axios from 'axios';

async function testFrontendConnection() {
  try {
    console.log('🔍 Test de connexion frontend...\n');

    
    console.log('1. Test de connexion via frontend...');
    
    
    const loginData = {
      email: 'demandeur@snrt.ma',
      password: '123456'
    };

    const response = await axios.post('http://localhost:4000/api/utilisateurs/login', loginData);
    const token = response.data.token;
    
    console.log('✅ Connexion réussie');
    console.log(`📋 Token: ${token.substring(0, 50)}...`);
    console.log(`👤 Utilisateur: ${response.data.nom} ${response.data.prenom}`);
    console.log(`🔑 Rôles: ${response.data.roles?.map(r => r.role?.code).join(', ') || 'Aucun'}`);

    
    console.log('\n2. Test des appels API frontend...');
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    
    const endpoints = [
      '/api/demandes/mesdemandes',
      '/api/demandes/handle',
      '/api/options',
      '/api/directions',
      '/api/services',
      '/api/departements'
    ];

    for (const endpoint of endpoints) {
      try {
        const result = await axios.get(`http://localhost:4000${endpoint}`, config);
        console.log(`✅ ${endpoint} - ${result.data?.length || 'OK'}`);
      } catch (error) {
        console.log(`❌ ${endpoint} - ${error.response?.status}: ${error.response?.data?.error || error.message}`);
      }
    }

    console.log('\n🎯 Test terminé!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error(`📋 Status: ${error.response.status}`);
      console.error(`📋 Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

testFrontendConnection();
