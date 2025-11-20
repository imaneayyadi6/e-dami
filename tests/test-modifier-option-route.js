import axios from 'axios';

async function testModifierOptionRoute() {
  try {
    console.log('🔍 Test de la route /modifier-option...\n');

    
    console.log('1. Test de connexion...');
    const loginResponse = await axios.post('http://localhost:4000/api/utilisateurs/login', {
      email: 'admin@snrt.ma',
      password: '123456'
    });
    const token = loginResponse.data.token;
    console.log('✅ Connexion admin réussie');

    
    console.log('\n2. Test de récupération des options...');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const optionsResponse = await axios.get('http://localhost:4000/api/options', config);
    console.log(`✅ Options récupérées: ${optionsResponse.data.length} options`);

    if (optionsResponse.data.length > 0) {
      const firstOption = optionsResponse.data[0];
      console.log(`📋 Première option: ${firstOption.libelle} (ID: ${firstOption._id})`);

      
      console.log('\n3. Test de récupération d\'une option spécifique...');
      try {
        const optionResponse = await axios.get(`http://localhost:4000/api/options/${firstOption._id}`, config);
        console.log(`✅ Option spécifique récupérée: ${optionResponse.data.libelle}`);
      } catch (error) {
        console.log(`❌ Erreur récupération option: ${error.response?.status}: ${error.response?.data?.error}`);
      }
    }

    console.log('\n🎯 Test terminé!');
    console.log('\n📝 Instructions:');
    console.log('1. Allez sur http://localhost:3000');
    console.log('2. Connectez-vous avec admin@snrt.ma / 123456');
    console.log('3. Allez sur /modifier-option (sans ID) - devrait fonctionner maintenant');
    console.log('4. Ou allez sur /modifier-option/[ID] avec un ID valide');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error(`📋 Status: ${error.response.status}`);
      console.error(`📋 Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

testModifierOptionRoute();
