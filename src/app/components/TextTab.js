import React from 'react';

export default function TextTab() {
  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedText);
    alert('Text copied to clipboard!');
  };

  const handleShare = () => {
    alert('Shared to community!');
  };
  
  const handleGenerateText = async (e) => {
    e.preventDefault();
    if (!textPrompt.trim()) return;

    setIsGeneratingText(true);
    setGeneratedText('');

    // Simulate API call with timeout
    setTimeout(() => {
      setGeneratedText(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.'
      );
      setIsGeneratingText(false);
    }, 2000);
  };

  const [textPrompt, setTextPrompt] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  return <div>TextTab</div>;
}
