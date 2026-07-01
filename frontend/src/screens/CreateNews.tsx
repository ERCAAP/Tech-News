import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

const CATEGORIES = [
  { label: 'Artificial Intelligence', value: 'AI' },
  { label: 'Technology', value: 'TECHNOLOGY' },
  { label: 'Applications', value: 'APP' }
];

const CreateNews: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('AI');

  return (
    <Picker
      selectedValue={selectedCategory}
      onValueChange={(value) => setSelectedCategory(value)}
    >
      {CATEGORIES.map((category) => (
        <Picker.Item 
          key={category.value} 
          label={category.label} 
          value={category.value} 
        />
      ))}
    </Picker>
  );
};

export default CreateNews; 