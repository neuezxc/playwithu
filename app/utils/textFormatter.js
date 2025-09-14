export function formatMessageContent(content) {
  // Handle edge case of empty content
  if (!content) return [<span key="empty">{content}</span>];
  
  const elements = [];
  let elementKey = 0;
  
  // Split by quotes first
  const quoteParts = content.split(/"([^"]*)"/g);
  
  quoteParts.forEach((part, quoteIndex) => {
    const isQuoted = quoteIndex % 2 === 1;
    
    if (isQuoted) {
      // Process quoted text for bold formatting
      const boldParts = part.split(/\*([^*]*)\*/g);
      
      boldParts.forEach((boldPart, boldIndex) => {
        const isBold = boldIndex % 2 === 1;
        
        if (isBold) {
          // Both quoted and bold
          elements.push(
            <span 
              key={elementKey++} 
              className="text-[var(--send-button-bg)] opacity-60"
            >
              {boldPart}
            </span>
          );
        } else if (boldPart) {
          // Only quoted
          elements.push(
            <span 
              key={elementKey++} 
              className="text-[var(--send-button-bg)]"
            >
              {boldPart}
            </span>
          );
        }
      });
    } else {
      // Process non-quoted text for bold formatting
      const boldParts = part.split(/\*([^*]*)\*/g);
      
      boldParts.forEach((boldPart, boldIndex) => {
        const isBold = boldIndex % 2 === 1;
        
        if (isBold) {
          // Only bold
          elements.push(
            <span 
              key={elementKey++} 
              className="opacity-60"
            >
              {boldPart}
            </span>
          );
        } else if (boldPart) {
          // Normal text
          elements.push(
            <span key={elementKey++}>
              {boldPart}
            </span>
          );
        }
      });
    }
  });
  
  return elements;
}