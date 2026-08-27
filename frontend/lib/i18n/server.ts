import { cookies } from 'next/headers';
import { getTranslation } from '../constants/languages';

export function getTranslationsServer() {
  const cookieStore = cookies();
  const lang = cookieStore.get('krishi_bandhu_lang')?.value || 'en';
  
  return {
    lang,
    t: (key: string) => getTranslation(lang, key)
  };
}
