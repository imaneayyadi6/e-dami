import axios from 'axios';

async function debugFrontend404() {
  try {
    console.log('🔍 Diagnostic de l\'erreur 404 frontend...\n');

    
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

    console.log('\n2. Test des endpoints API...');

    
    try {
      const mesDemandesResponse = await axios.get('http://localhost:4000/api/demandes/mesdemandes', config);
      console.log('✅ /api/demandes/mesdemandes - OK');
    } catch (error) {
      console.log(`❌ /api/demandes/mesdemandes - ${error.response?.status}: ${error.response?.data?.error}`);
    }

    
    try {
      const handleResponse = await axios.get('http://localhost:4000/api/demandes/handle', config);
      console.log('✅ /api/demandes/handle - OK');
    } catch (error) {
      console.log(`❌ /api/demandes/handle - ${error.response?.status}: ${error.response?.data?.error}`);
    }

    
    try {
      const filterResponse = await axios.get('http://localhost:4000/api/demandes/handle/filter', config);
      console.log('✅ /api/demandes/handle/filter - OK');
    } catch (error) {
      console.log(`❌ /api/demandes/handle/filter - ${error.response?.status}: ${error.response?.data?.error}`);
    }

    
    try {
      const optionsResponse = await axios.get('http://localhost:4000/api/options', config);
      console.log('✅ /api/options - OK');
    } catch (error) {
      console.log(`❌ /api/options - ${error.response?.status}: ${error.response?.data?.error}`);
    }

    
    try {
      const directionsResponse = await axios.get('http://localhost:4000/api/directions', config);
      console.log('✅ /api/directions - OK');
    } catch (error) {
      console.log(`❌ /api/directions - ${error.response?.status}: ${error.response?.data?.error}`);
    }

    
    try {
      const servicesResponse = await axios.get('http://localhost:4000/api/services', config);
      console.log('✅ /api/services - OK');
    } catch (error) {
      console.log(`❌ /api/services - ${error.response?.status}: ${error.response?.data?.error}`);
    }

    
    try {
      const departementsResponse = await axios.get('http://localhost:4000/api/departements', config);
      console.log('✅ /api/departements - OK');
    } catch (error) {
      console.log(`❌ /api/departements - ${error.response?.status}: ${error.response?.data?.error}`);
    }

    console.log('\n🎯 Diagnostic terminé!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

debugFrontend404();
