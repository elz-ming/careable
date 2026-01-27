'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { LanguagePreference, FontSize, Theme } from '@/lib/supabase/model';

/**
 * Get user preferences
 */
export async function getUserPreferences() {
  const { userId } = await auth();
  if (!userId) {
    return { 
      success: false, 
      data: null,
      error: 'Unauthorized' 
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('language_preference, font_size, theme')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[getUserPreferences] Error:', error);
    return { 
      success: false, 
      data: null, 
      error: error.message 
    };
  }

  return {
    success: true,
    data: {
      language: (data.language_preference || 'en') as LanguagePreference,
      fontSize: (data.font_size || 'medium') as FontSize,
      theme: (data.theme || 'light') as Theme
    }
  };
}

/**
 * Update language preference
 */
export async function updateLanguage(language: LanguagePreference) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ 
      language_preference: language,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('[updateLanguage] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Update font size preference
 */
export async function updateFontSize(fontSize: FontSize) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ 
      font_size: fontSize,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('[updateFontSize] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Update theme preference
 */
export async function updateTheme(theme: Theme) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ 
      theme: theme,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('[updateTheme] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Update all preferences at once
 */
export async function updateAllPreferences(preferences: {
  language?: LanguagePreference;
  fontSize?: FontSize;
  theme?: Theme;
}) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (preferences.language) updateData.language_preference = preferences.language;
  if (preferences.fontSize) updateData.font_size = preferences.fontSize;
  if (preferences.theme) updateData.theme = preferences.theme;

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('[updateAllPreferences] Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}
