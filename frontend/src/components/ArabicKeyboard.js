import React, { memo } from 'react';
import { Button } from 'react-bootstrap';

const ArabicKeyboard = memo(({ 
  showKeyboard, 
  onInsertChar, 
  currentValue, 
  setFieldValue, 
  field, 
  activeStep 
}) => {
  const arabicKeys = [
    'ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د',
    'ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط',
    'ئ','ء','ؤ','ر','ﻻ','ى','ة','و','ز','ظ'
  ];

  const handleCharClick = (char) => {
    onInsertChar(currentValue, setFieldValue, field, char);
  };

  if (!showKeyboard) {
    return null;
  }

  return (
    <div 
      key={`arabic-keyboard-${field}-${activeStep}`} 
      className="mt-2 p-2 border rounded" 
      style={{ background: 'var(--bs-gray-100)' }}
    >
      <div className="d-flex flex-wrap" style={{ gap: 6 }}>
        {arabicKeys.map((k, index) => (
          <Button 
            key={`arabic-key-${k}-${activeStep}-${index}`}
            size="sm" 
            variant="light" 
            onClick={() => handleCharClick(k)}
          >
            {k}
          </Button>
        ))}
        <Button 
          key={`arabic-space-${activeStep}`}
          size="sm" 
          variant="light" 
          onClick={() => handleCharClick('␣')}
        >
          مسافة
        </Button>
        <Button 
          key={`arabic-backspace-${activeStep}`}
          size="sm" 
          variant="outline-danger" 
          onClick={() => handleCharClick('⌫')}
        >
          ⌫
        </Button>
      </div>
    </div>
  );
});

ArabicKeyboard.displayName = 'ArabicKeyboard';

export default ArabicKeyboard;
