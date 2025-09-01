export function chunkText(text: string, maxChunkSize: number = 1500): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    const potentialChunk = currentChunk ? `${currentChunk}. ${trimmedSentence}` : trimmedSentence;
    
    if (potentialChunk.length <= maxChunkSize) {
      currentChunk = potentialChunk;
    } else {
      // If current chunk has content, save it and start new chunk
      if (currentChunk) {
        chunks.push(currentChunk + '.');
        currentChunk = trimmedSentence;
      } else {
        // If single sentence is too long, split it by words
        const words = trimmedSentence.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          const potentialWordChunk = wordChunk ? `${wordChunk} ${word}` : word;
          
          if (potentialWordChunk.length <= maxChunkSize) {
            wordChunk = potentialWordChunk;
          } else {
            if (wordChunk) {
              chunks.push(wordChunk);
              wordChunk = word;
            } else {
              // Single word is too long, just add it
              chunks.push(word);
              wordChunk = '';
            }
          }
        }
        
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      }
    }
  }
  
  // Add any remaining content
  if (currentChunk) {
    chunks.push(currentChunk + '.');
  }
  
  return chunks.filter(chunk => chunk.trim().length > 0);
}