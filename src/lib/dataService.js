import { demoData } from './demoData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const fallback = (key) => demoData[key] || [];

const safeSelect = async (table, queryBuilder, fallbackKey) => {
  if (!isSupabaseConfigured) return fallback(fallbackKey);
  const { data, error } = await queryBuilder(supabase.from(table));
  if (error) {
    console.error(`Supabase select failed for ${table}:`, error);
    return [];
  }
  return data || [];
};

export const listPacks = () =>
  safeSelect('packs', (q) => q.select('*').order('created_at', { ascending: false }), 'packs');

export const listSubjects = () =>
  safeSelect('subjects', (q) => q.select('*').order('display_order'), 'subjects');

export const listDocuments = () =>
  safeSelect(
    'documents',
    (q) => q.select('*, subjects(name)').eq('is_visible', true).order('created_at', { ascending: false }),
    'documents',
  );

export const listAdminDocuments = () =>
  safeSelect(
    'documents',
    (q) => q.select('*, subjects(name)').order('created_at', { ascending: false }),
    'documents',
  );

export const listQuizzes = () =>
  safeSelect(
    'quizzes',
    (q) => q.select('*, subjects(name)').eq('is_published', true).order('created_at', { ascending: false }),
    'quizzes',
  );

export const listAdminQuizzes = () =>
  safeSelect(
    'quizzes',
    (q) => q.select('*, subjects(name)').order('created_at', { ascending: false }),
    'quizzes',
  );

export const listRecordings = () =>
  safeSelect(
    'recordings',
    (q) => q.select('*, subjects(name)').eq('is_visible', true).order('session_date', { ascending: false }),
    'recordings',
  );

export const listAdminRecordings = () =>
  safeSelect(
    'recordings',
    (q) => q.select('*, subjects(name)').order('session_date', { ascending: false }),
    'recordings',
  );

export const getSessions = () =>
  safeSelect(
    'sessions',
    (q) => q.select('*, subjects(name), packs(name)').eq('is_visible', true).order('session_date').order('start_time'),
    'sessions',
  );

export const getAdminSessions = () =>
  safeSelect(
    'sessions',
    (q) => q.select('*, subjects(name), packs(name)').order('session_date').order('start_time'),
    'sessions',
  );

export const getStudentSessions = async (activePackId) => {
  if (!activePackId) return [];
  if (!isSupabaseConfigured) {
    return demoData.sessions.filter((session) => session.is_visible && session.pack_id === activePackId);
  }
  const { data, error } = await supabase
    .from('sessions')
    .select('*, subjects(name), packs(name)')
    .eq('is_visible', true)
    .eq('pack_id', activePackId)
    .order('session_date')
    .order('start_time');

  if (error) {
    console.error('Supabase student sessions select failed:', {
      activePackId,
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data || [];
};

export const listRegistrationRequests = () =>
  safeSelect(
    'registration_requests',
    (q) => q.select('*').order('created_at', { ascending: false }),
    'registrationRequests',
  );

export const listContactMessages = () =>
  safeSelect(
    'contact_messages',
    (q) => q.select('*').order('created_at', { ascending: false }),
    'contactMessages',
  );

export const listProfiles = () =>
  safeSelect('profiles', (q) => q.select('*').order('created_at', { ascending: false }), 'profiles');

export const listAttempts = () =>
  safeSelect(
    'quiz_attempts',
    (q) => q.select('*, quizzes(title, subject_id, subjects(name)), profiles(full_name)').order('created_at', { ascending: false }),
    'attempts',
  );

export const getStudentPack = async (studentId) => {
  if (!studentId) return null;
  if (!isSupabaseConfigured) {
    return demoData.studentPacks.find((item) => item.student_id === studentId) || demoData.studentPacks[0];
  }
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('student_packs')
    .select('id, student_id, pack_id, status, start_date, end_date, created_at')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase student_packs access check failed:', {
      studentId,
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  const activePack = (data || []).find((item) => !item.end_date || item.end_date >= today) || null;
  console.log('Student pack query result', { studentId, today, rows: data || [], activePack });
  return activePack;
};

export const getQuizWithQuestions = async (quizId) => {
  if (!isSupabaseConfigured) {
    const quiz = demoData.quizzes.find((item) => item.id === quizId);
    const questions = demoData.questions.filter((item) => item.quiz_id === quizId);
    return { quiz, questions };
  }
  const [{ data: quiz }, { data: questions, error }] = await Promise.all([
    supabase.from('quizzes').select('*, subjects(name)').eq('id', quizId).single(),
    supabase
      .from('questions')
      .select('*, answers(*)')
      .eq('quiz_id', quizId)
      .order('display_order'),
  ]);
  if (error) throw error;
  return { quiz, questions: questions || [] };
};

export const submitRegistrationRequest = async (payload) => {
  if (!isSupabaseConfigured) return { id: crypto.randomUUID(), ...payload, status: 'pending' };
  const row = {
    ...payload,
    pack_id: payload.pack_id || null,
    status: 'pending',
  };
  const { error } = await supabase.from('registration_requests').insert(row);
  if (error) {
    console.error('Supabase registration request insert failed:', error);
    throw error;
  }
  return { ...row };
};

export const submitContactMessage = async (payload) => {
  if (!isSupabaseConfigured) return { id: crypto.randomUUID(), ...payload, status: 'new' };
  const row = { ...payload, status: 'new' };
  const { error } = await supabase.from('contact_messages').insert(row);
  if (error) {
    console.error('Supabase contact message insert failed:', error);
    throw error;
  }
  return { ...row };
};

export const saveQuizAttempt = async ({ quizId, studentId, score, totalQuestions, answers }) => {
  const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  if (!isSupabaseConfigured) {
    return {
      id: crypto.randomUUID(),
      quiz_id: quizId,
      student_id: studentId,
      score,
      total_questions: totalQuestions,
      percentage,
      answers,
      created_at: new Date().toISOString(),
    };
  }

  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      student_id: studentId,
      score,
      total_questions: totalQuestions,
      percentage,
    })
    .select()
    .single();
  if (error) throw error;

  const rows = answers.map((answer) => ({
    attempt_id: attempt.id,
    question_id: answer.question_id,
    selected_answer_id: answer.selected_answer_id,
    is_correct: answer.is_correct,
  }));
  if (rows.length) {
    const { error: answersError } = await supabase.from('quiz_attempt_answers').insert(rows);
    if (answersError) throw answersError;
  }
  return attempt;
};

export const updateRowStatus = async (table, id, status) => {
  if (!isSupabaseConfigured) return { id, status };
  const { data, error } = await supabase.from(table).update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const createRow = async (table, payload) => {
  if (!isSupabaseConfigured) return { id: crypto.randomUUID(), ...payload };
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const updateRow = async (table, id, payload) => {
  if (!isSupabaseConfigured) return { id, ...payload };
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteRow = async (table, id) => {
  if (!isSupabaseConfigured) return true;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const createSession = async (sessionData) => {
  if (!isSupabaseConfigured) return { id: crypto.randomUUID(), ...sessionData };
  console.log('Submitting session to Supabase', sessionData);
  const { data, error } = await supabase.from('sessions').insert(sessionData).select().single();
  if (error) {
    console.error('Supabase session insert failed:', {
      payload: sessionData,
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data;
};

export const updateSession = async (id, sessionData) => {
  if (!isSupabaseConfigured) return { id, ...sessionData };
  console.log('Updating session in Supabase', { id, sessionData });
  const { data, error } = await supabase.from('sessions').update(sessionData).eq('id', id).select().single();
  if (error) {
    console.error('Supabase session update failed:', {
      id,
      payload: sessionData,
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data;
};

export const deleteSession = async (id) => {
  try {
    return await deleteRow('sessions', id);
  } catch (error) {
    console.error('Supabase session delete failed:', {
      id,
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
};

export const uploadDocumentPdf = async (file) => {
  if (!file) return '';
  const filePath = `documents/${Date.now()}-${file.name.replaceAll(' ', '-')}`;
  if (!isSupabaseConfigured) return filePath;
  const { error } = await supabase.storage.from('documents').upload(filePath, file, {
    contentType: file.type || 'application/pdf',
    upsert: false,
  });
  if (error) throw error;
  return filePath;
};

export const invokeFunction = async (name, body) => {
  if (!isSupabaseConfigured) return { demo: true, name, body };
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
};

export const getDocumentSignedUrl = async (documentId) => {
  const data = await invokeFunction('generate-document-signed-url', { document_id: documentId });
  return data?.signedUrl || data?.signed_url || '#';
};
