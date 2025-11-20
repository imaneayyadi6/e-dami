


console.log('🧹 Nettoyage du localStorage...');


localStorage.clear();


localStorage.removeItem('options');
localStorage.removeItem('userInfo');
localStorage.removeItem('userLanguage');

console.log('✅ localStorage vidé !');
console.log('🔄 Rechargez la page (F5)');


window.location.reload();
