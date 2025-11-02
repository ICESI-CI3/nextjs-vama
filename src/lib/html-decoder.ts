/**
 * Decodifica entidades HTML a texto plano
 * Maneja: &quot; &amp; &lt; &gt; &#039; y otros
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Decodifica entidades HTML en un objeto o array
 */
export function decodeHtmlInObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return decodeHtmlEntities(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(decodeHtmlInObject) as T;
  }
  
  if (obj && typeof obj === 'object') {
    const decoded = {} as T;
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        (decoded as any)[key] = decodeHtmlEntities(obj[key] as string);
      } else if (typeof obj[key] === 'object') {
        (decoded as any)[key] = decodeHtmlInObject(obj[key]);
      } else {
        (decoded as any)[key] = obj[key];
      }
    }
    return decoded;
  }
  
  return obj;
}

