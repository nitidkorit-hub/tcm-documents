import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase credentials. Check .env file');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ============ AUTH ============
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// ============ PROJECTS ============
export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createProject(projectData) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      ...projectData,
      created_by: user.id
    }])
    .select();
  if (error) throw error;
  return data?.[0];
}

export async function updateProject(projectId, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select();
  if (error) throw error;
  return data?.[0];
}

export async function deleteProject(projectId) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  if (error) throw error;
}

// ============ FILES ============
export async function fetchFiles(projectId) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchLatestFiles(limit = 10) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('is_latest', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Supabase Storage rejects object keys containing non-ASCII characters (e.g. Thai)
// with "Invalid key" — sanitize only the storage path, keep the real filename
// in the `name` column for display/download.
function sanitizeStorageKey(filename) {
  const dot = filename.lastIndexOf('.');
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  const ext = dot > 0 ? filename.slice(dot) : '';
  const safeBase = base
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 150) || 'file';
  return safeBase + ext;
}

export async function uploadFile(projectId, file, fileType, uploaderName, contentText = null) {
  const user = await getCurrentUser();

  // 1. Upload to storage
  const fileName = `${projectId}/${Date.now()}-${sanitizeStorageKey(file.name)}`;
  const { data: storageData, error: storageError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (storageError) throw storageError;

  // 2. Insert file record (with optional content_text for search)
  const baseName = file.name.replace(/\.\w+$/, '').replace(/_(rev\s*\d+|v\d+|\d{4}-\d{2}-\d{2})$/i, '');
  const ext = file.name.split('.').pop();

  const insertData = {
    project_id: projectId,
    name: file.name,
    type: fileType,
    base_name: baseName,
    size: Math.round(file.size / 1024),
    ext: ext,
    storage_path: fileName,
    uploader_id: user.id,
    uploader_name: uploaderName,
    is_latest: true
  };
  if (contentText) {
    insertData.content_text = contentText;
  }

  const { data: fileData, error: fileError } = await supabase
    .from('files')
    .insert([insertData])
    .select();

  if (fileError) {
    // If content_text column doesn't exist yet, retry without it
    if (contentText && /content_text/i.test(fileError.message || '')) {
      delete insertData.content_text;
      const retry = await supabase.from('files').insert([insertData]).select();
      if (retry.error) throw retry.error;
      return retry.data?.[0];
    }
    throw fileError;
  }

  // 3. Mark old versions as not latest
  await supabase
    .from('files')
    .update({ is_latest: false })
    .eq('base_name', baseName)
    .eq('project_id', projectId)
    .neq('id', fileData[0].id);

  return fileData?.[0];
}

// Update content_text for existing file (used for reindexing)
export async function updateFileContent(fileId, contentText) {
  const { error } = await supabase
    .from('files')
    .update({ content_text: contentText })
    .eq('id', fileId);
  if (error && !/content_text/i.test(error.message || '')) throw error;
  return !error;
}

// Get file blob from storage (for reindexing)
export async function getFileBlob(storagePath) {
  const { data, error } = await supabase.storage
    .from('documents')
    .download(storagePath);
  if (error) throw error;
  return data;
}

// Get public URL for a file (used by Preview)
export function getFilePublicUrl(storagePath) {
  if (!storagePath) return '';
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath);
  return data?.publicUrl || '';
}

// Get signed URL (more secure, time-limited) — alternative to public URL
export async function getFileSignedUrl(storagePath, expiresIn = 3600) {
  if (!storagePath) return '';
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data?.signedUrl || '';
}

export async function deleteFile(fileId) {
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);
  if (error) throw error;
}

export async function downloadFile(fileId, fileName) {
  const { data, error } = await supabase
    .from('files')
    .select('storage_path')
    .eq('id', fileId)
    .single();

  if (error) throw error;

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(data.storage_path);

  if (downloadError) throw downloadError;

  // Trigger download
  const url = URL.createObjectURL(fileData);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'file';
  a.click();
  URL.revokeObjectURL(url);
}

// ============ ACTIVITY/TIMELINE ============
export async function fetchActivity(projectId, limit = 6) {
  const { data, error } = await supabase
    .from('activity')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function logActivity(projectId, action, details, fileId = null) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from('activity')
    .insert([{
      project_id: projectId,
      action,
      details,
      file_id: fileId,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email
    }]);
  if (error) throw error;
}

// ============ STATS ============
export async function fetchStats() {
  const [projectsData, filesData] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact' }),
    supabase.from('files').select('id', { count: 'exact' })
  ]);

  return {
    projects: projectsData.count || 0,
    files: filesData.count || 0,
    types: 8 // Fixed for now
  };
}
