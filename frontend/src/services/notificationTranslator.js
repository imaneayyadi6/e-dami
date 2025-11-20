import { useTranslation } from 'react-i18next';


export const translateNotification = (content, language = 'fr') => {
  if (!content || typeof content !== 'string') return content;
  
  
  if (language === 'fr') return content;
  
  
  const translations = {
    
    'Une demande a été faite par': 'تم تقديم طلب من قبل',
    'veuillez la traiter en tant que': 'يرجى معالجتها كـ',
    'propriétaire de données': 'مالك البيانات',
    'chef de service': 'رئيس الخدمة',
    'chef de departement': 'رئيس القسم',
    'chef de derpatement': 'رئيس القسم', 
    'directeur hiarchique': 'المدير الهرمي',
    'directeur de l\'entité': 'مدير الكيان',
    'directeur général': 'المدير العام',
    'président directeur général': 'الرئيس المدير العام',
    'administrateur': 'مدير النظام',
    'autre responsable': 'مسؤول آخر',
    
    
    'test demandeur': 'مقدم الطلب التجريبي',
    'utilisateur': 'مستخدم',
    'inconnu': 'غير معروف',
    'demandeur': 'مقدم الطلب',
    'signataire': 'الموقع',
    'traitement': 'معالجة',
    'approbation': 'موافقة',
    'refus': 'رفض',
    'terminé': 'منتهي',
    'en attente': 'في الانتظار',
    'validé': 'مصادق عليه',
    'rejeté': 'مرفوض',
    
    
    'le demandeur n\'a pas un chef de service ou n\'a pas été affecté à un service': 'المقدم لا يملك رئيس خدمة أو لم يتم تعيينه لخدمة',
    'le demandeur n\'a pas un chef de departement ou n\'a pas été affecté à un departement': 'المقدم لا يملك رئيس قسم أو لم يتم تعيينه لقسم',
    'le demandeur n\'a pas un chef de derpatement ou n\'a pas été affecté à un departement': 'المقدم لا يملك رئيس قسم أو لم يتم تعيينه لقسم',
    
    
    ' et ': ' و ',
    ', ': '، ',
    ' et directeur': ' ومدير',
    ' et propriétaire': ' ومالك',
    ' et chef de': ' ورئيس',
    
    
    '(interim)': '(مؤقت)',
    'en cours': 'قيد المعالجة',
    'approuve': 'موافق عليه',
    'refuse': 'مرفوض',
    'fini': 'منتهي',
    
    
    'demande': 'طلب',
    'a été': 'تم',
    'faite': 'تقديمه',
    'traitée': 'معالجتها',
    'approuvée': 'الموافقة عليها',
    'refusée': 'رفضها',
    'terminée': 'إنهاؤها',
    
    
    'par': 'من قبل',
    'pour': 'لـ',
    'avec': 'مع',
    'dans': 'في',
    'sur': 'على',
    'de': 'من',
    'du': 'من',
    'des': 'من',
    'le': 'ال',
    'la': 'ال',
    'les': 'ال',
    'un': 'أحد',
    'une': 'إحدى',
    'ce': 'هذا',
    'cette': 'هذه',
    'ces': 'هذه',
    'son': 'له',
    'sa': 'لها',
    'ses': 'له',
    'votre': 'خاصتك',
    'vos': 'خاصتك',
    'notre': 'خاصتنا',
    'nos': 'خاصتنا',
    'leur': 'خاصتهم',
    'leurs': 'خاصتهم',
    
    
    'aujourd\'hui': 'اليوم',
    'hier': 'أمس',
    'demain': 'غداً',
    'maintenant': 'الآن',
    'bientôt': 'قريباً',
    'tard': 'متأخر',
    'tôt': 'مبكر',
    
    
    'font-weight:bold': 'font-weight:bold', 
    'style=': 'style=',
    'href=': 'href=',
    'class=': 'class=',
    'id=': 'id=',
    
    
    '<p>': '<p dir="rtl">',
    '<strong': '<strong',
    '<b': '<b',
    '<i': '<i',
    '<a': '<a',
    '</p>': '</p>',
    '</strong>': '</strong>',
    '</b>': '</b>',
    '</i>': '</i>',
    '</a>': '</a>',
  };
  
  let translatedContent = content;
  
  
  Object.entries(translations).forEach(([french, arabic]) => {
    const regex = new RegExp(french.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translatedContent = translatedContent.replace(regex, arabic);
  });
  
  
  translatedContent = translatedContent.replace(/<p>/g, '<p dir="rtl">');
  translatedContent = translatedContent.replace(/<div>/g, '<div dir="rtl">');
  translatedContent = translatedContent.replace(/<span>/g, '<span dir="rtl">');
  
  return translatedContent;
};


export const useNotificationTranslation = () => {
  const { i18n } = useTranslation();
  
  const translateNotificationContent = (content) => {
    return translateNotification(content, i18n.language);
  };
  
  return { translateNotificationContent };
};


export const translateSystemNotification = (notification, language = 'fr') => {
  if (!notification) return notification;
  
  const translatedNotification = { ...notification };
  
  
  if (notification.content) {
    translatedNotification.content = translateNotification(notification.content, language);
  }
  
  
  if (notification.subject) {
    translatedNotification.subject = translateNotification(notification.subject, language);
  }
  
  return translatedNotification;
};

export default {
  translateNotification,
  useNotificationTranslation,
  translateSystemNotification
};
