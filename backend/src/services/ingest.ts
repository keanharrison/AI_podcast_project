import axios from 'axios';

export async function ingestContent(input: string, inputType: 'url' | 'text'): Promise<string> {
  if (inputType === 'text') {
    return sanitizeText(input);
  }
  
  if (inputType === 'url') {
    try {
      const response = await axios.get(input, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AI-Podcast-Generator/1.0'
        }
      });
      
      // Basic HTML content extraction (simplified)
      let content = response.data;
      
      // Remove HTML tags (basic approach)
      content = content.replace(/<script[^>]*>.*?<\/script>/gis, '');
      content = content.replace(/<style[^>]*>.*?<\/style>/gis, '');
      content = content.replace(/<[^>]*>/g, ' ');
      
      // Decode HTML entities
      content = content
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      return sanitizeText(content);
    } catch (error: any) {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
  }
  
  throw new Error('Invalid input type');
}

function sanitizeText(text: string): string {
  // Clean up the text
  return text
    .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
}