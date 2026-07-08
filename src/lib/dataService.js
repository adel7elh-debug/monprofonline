import { supabase, isSupabaseConfigured } from './supabaseClient';

let demoDataPromise;
const sessionCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

const getDemoData = async () => {
  if (!demoDataPromise) demoDataPromise = import('./demoData').then((module) => module.demoData);
  return demoDataPromise;
};

const fallback = async (key) => {
  const demoData = await getDemoData();
  return demoData[key] || [];
};

const safeSelect = async (table, queryBuilder, fallbackKey) => {
  if (!isSupabaseConfigured) return fallback(fallbackKey);
  const { data, error } = await queryBuilder(supabase.from(table));
  if (error) {
    console.error(`Supabase select failed for ${table}:`, error);
    return [];
  }
  return data || [];
};

const cached = async (key, loader, ttl = CACHE_TTL_MS) => {
  const now = Date.now();
  const existing = sessionCache.get(key);
  if (existing && existing.expiresAt > now) return existing.value;
  const value = await loader();
  sessionCache.set(key, { value, expiresAt: now + ttl });
  return value;
};

const cacheKey = (...parts) => parts.filter((part) => part !== undefined && part !== null && part !== '').join(':');

export const clearStudentCache = () => {
  [...sessionCache.keys()].forEach((key) => {
    if (key.startsWith('student:')) sessionCache.delete(key);
  });
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
    (q) => q.select('*, subjects(name), packs(name)').eq('is_visible', true).order('session_date', { ascending: false }),
    'recordings',
  );

export const listAdminRecordings = () =>
  safeSelect(
    'recordings',
    (q) => q.select('*, subjects(name), packs(name)').order('session_date', { ascending: false }),
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

export const getStudentSessions = async (activePackId, options = {}) => {
  if (!activePackId) return [];
  const { from, to, limit } = options;
  const key = cacheKey('student:sessions', activePackId, from || 'all', to || 'all', limit || 'all');
  return cached(key, async () => {
  if (!isSupabaseConfigured) {
    const demoData = await getDemoData();
    const sessions = demoData.sessions.filter((session) => {
      if (!session.is_visible || session.pack_id !== activePackId) return false;
      if (from && session.session_date < from) return false;
      if (to && session.session_date > to) return false;
      return true;
    });
    return limit ? sessions.slice(0, limit) : sessions;
  }
  let query = supabase
    .from('sessions')
    .select('id, title, description, subject_id, session_date, start_time, end_time, meet_link, replay_link, status, subjects(name)')
    .eq('is_visible', true)
    .eq('pack_id', activePackId)
    .order('session_date')
    .order('start_time');
  if (from) query = query.gte('session_date', from);
  if (to) query = query.lte('session_date', to);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;

  if (error) {
    console.error('Supabase student sessions select failed:', {
      activePackId,
      from,
      to,
      limit,
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data || [];
  });
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

export const listStudentSubjects = async (activePackId) => {
  const key = cacheKey('student:subjects', activePackId || 'all');
  return cached(key, async () => {
    if (!isSupabaseConfigured) return fallback('subjects');
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, description, display_order')
      .order('display_order');
    if (error) {
      console.error('Supabase student subjects select failed:', {
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
  }, 10 * 1000);
};

const countBySubject = (items = []) =>
  items.reduce((counts, item) => {
    if (!item.subject_id) return counts;
    counts[item.subject_id] = (counts[item.subject_id] || 0) + 1;
    return counts;
  }, {});

export const getStudentSubjectsOverview = async (activePackId) => {
  if (!activePackId) return { subjects: [], documentCounts: {}, quizCounts: {}, recordingCounts: {} };
  const key = cacheKey('student:subjects-overview', activePackId);
  return cached(key, async () => {
    if (!isSupabaseConfigured) {
      const demoData = await getDemoData();
      return {
        subjects: demoData.subjects,
        documentCounts: countBySubject(demoData.documents.filter((item) => item.is_visible && item.pack_id === activePackId)),
        quizCounts: countBySubject(demoData.quizzes.filter((item) => item.is_published && item.pack_id === activePackId)),
        recordingCounts: countBySubject(demoData.recordings.filter((item) => item.is_visible && item.pack_id === activePackId)),
      };
    }

    const [subjectsResult, documentsResult, quizzesResult, recordingsResult] = await Promise.all([
      supabase.from('subjects').select('id, name, description, display_order').order('display_order'),
      supabase.from('documents').select('subject_id').eq('is_visible', true).eq('pack_id', activePackId),
      supabase.from('quizzes').select('subject_id').eq('is_published', true).eq('pack_id', activePackId),
      supabase.from('recordings').select('subject_id').eq('is_visible', true).eq('pack_id', activePackId),
    ]);

    const failed = [
      ['subjects', subjectsResult],
      ['documents', documentsResult],
      ['quizzes', quizzesResult],
      ['recordings', recordingsResult],
    ].find(([, result]) => result.error);

    if (failed) {
      const [label, result] = failed;
      console.error(`Supabase student subjects overview ${label} select failed:`, {
        activePackId,
        error: result.error,
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code,
      });
      throw result.error;
    }

    return {
      subjects: subjectsResult.data || [],
      documentCounts: countBySubject(documentsResult.data),
      quizCounts: countBySubject(quizzesResult.data),
      recordingCounts: countBySubject(recordingsResult.data),
    };
  });
};

export const listStudentDocuments = async (activePackId) => {
  if (!activePackId) return [];
  const key = cacheKey('student:documents', activePackId);
  return cached(key, async () => {
    if (!isSupabaseConfigured) {
      const demoData = await getDemoData();
      return demoData.documents.filter((document) => document.is_visible && document.pack_id === activePackId);
    }
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, description, subject_id, document_type, file_path, is_visible, created_at, subjects(name)')
      .eq('is_visible', true)
      .eq('pack_id', activePackId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase student documents select failed:', {
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
  }, 10 * 1000);
};

const diagnoseStudentQuizVisibility = async (activePackId) => {
  try {
    const { data: publishedQuizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id, title, pack_id, subject_id, is_published')
      .eq('is_published', true);

    if (quizzesError) {
      console.error('Problème RLS Supabase lors de la lecture des QCM publiés:', {
        activePackId,
        error: quizzesError,
        message: quizzesError.message,
        details: quizzesError.details,
        hint: quizzesError.hint,
        code: quizzesError.code,
      });
      return;
    }

    if (!publishedQuizzes?.length) {
      console.warn('Aucun QCM publié visible pour cet étudiant. Causes possibles : aucun QCM publié ou RLS Supabase trop restrictive.');
      return;
    }

    const packQuizzes = publishedQuizzes.filter((quiz) => quiz.pack_id === activePackId);
    if (!packQuizzes.length) {
      console.warn('Aucun QCM publié lié au pack actif de l’étudiant.', {
        activePackId,
        visiblePublishedQuizzes: publishedQuizzes.map((quiz) => ({ id: quiz.id, title: quiz.title, pack_id: quiz.pack_id })),
      });
      return;
    }

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, quiz_id')
      .in('quiz_id', packQuizzes.map((quiz) => quiz.id));

    if (questionsError) {
      console.error('Problème RLS Supabase lors de la lecture des questions QCM:', {
        activePackId,
        error: questionsError,
        message: questionsError.message,
        details: questionsError.details,
        hint: questionsError.hint,
        code: questionsError.code,
      });
      return;
    }

    if (!questions?.length) {
      console.warn('Aucune question liée aux QCM publiés du pack actif.', {
        activePackId,
        quizIds: packQuizzes.map((quiz) => quiz.id),
      });
      return;
    }

    console.warn('Aucun QCM affichable après filtrage. Vérifiez les matières masquées ou les policies RLS Supabase.', {
      activePackId,
      packQuizzes,
      questionsCount: questions.length,
    });
  } catch (error) {
    console.error('Diagnostic QCM étudiant impossible:', error);
  }
};

export const listStudentQuizzes = async (activePackId, limit) => {
  if (!activePackId) {
    console.warn('Aucun pack associé à l’étudiant : impossible de charger les QCM.');
    return [];
  }
  const key = cacheKey('student:quizzes', activePackId, limit || 'all');
  return cached(key, async () => {
    if (!isSupabaseConfigured) {
      const demoData = await getDemoData();
      const questionQuizIds = new Set(demoData.questions.map((question) => question.quiz_id));
      const quizzes = demoData.quizzes.filter((quiz) => quiz.is_published && quiz.pack_id === activePackId && questionQuizIds.has(quiz.id));
      return limit ? quizzes.slice(0, limit) : quizzes;
    }
    let query = supabase
      .from('quizzes')
      .select('id, title, description, subject_id, duration_minutes, created_at, subjects(name, is_visible), questions!inner(id)')
      .eq('is_published', true)
      .eq('pack_id', activePackId)
      .order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      console.error('Supabase student quizzes select failed:', {
        activePackId,
        limit,
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
    const quizzes = (data || []).filter((quiz) => quiz.subjects?.is_visible !== false && quiz.questions?.length);
    if (!quizzes.length) await diagnoseStudentQuizVisibility(activePackId);
    return quizzes.map(({ questions, ...quiz }) => quiz);
  }, 10 * 1000);
};

export const listStudentRecordings = async (activePackId, limit) => {
  if (!activePackId) {
    console.warn('Aucun pack actif : impossible de charger les enregistrements video.');
    return [];
  }
  const key = cacheKey('student:recordings', activePackId, limit || 'all');
  return cached(key, async () => {
    if (!isSupabaseConfigured) {
      const demoData = await getDemoData();
      const recordings = demoData.recordings.filter((recording) => recording.is_visible && recording.pack_id === activePackId);
      return limit ? recordings.slice(0, limit) : recordings;
    }
    let query = supabase
      .from('recordings')
      .select('id, title, description, subject_id, pack_id, youtube_video_url, youtube_playlist_url, session_date, embed_enabled, is_visible, created_at, subjects(name)')
      .eq('is_visible', true)
      .eq('pack_id', activePackId)
      .order('session_date', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      console.error('Supabase student recordings select failed:', {
        activePackId,
        limit,
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
    console.log('recordings reçus', data || []);
    const recordings = data || [];
    console.log('recordings filtrés par pack', { activePackId, recordings });
    if (!recordings.length) await diagnoseStudentVideoVisibility(activePackId);
    return recordings;
  }, 10 * 1000);
};

const diagnoseStudentVideoVisibility = async (activePackId) => {
  try {
    const { data: visibleVideos, error: videosError } = await supabase
      .from('recordings')
      .select('id, title, pack_id, subject_id, is_visible')
      .eq('is_visible', true);

    if (videosError) {
      console.error('Probleme RLS Supabase lors de la lecture des videos visibles:', {
        activePackId,
        error: videosError,
        message: videosError.message,
        details: videosError.details,
        hint: videosError.hint,
        code: videosError.code,
      });
      return;
    }

    if (!visibleVideos?.length) {
      console.warn('Aucune video visible pour cet etudiant. Causes possibles : aucune video visible ou RLS Supabase trop restrictive.');
      return;
    }

    const packVideos = visibleVideos.filter((video) => video.pack_id === activePackId);
    if (!packVideos.length) {
      console.warn('Aucune video visible liee au pack actif de l etudiant.', {
        activePackId,
        visibleVideos: visibleVideos.map((video) => ({ id: video.id, title: video.title, pack_id: video.pack_id })),
      });
      return;
    }

    console.warn('Aucun enregistrement video affichable apres filtrage. Verifiez les matieres masquees ou les policies RLS Supabase.', {
      activePackId,
      packVideos,
    });
  } catch (error) {
    console.error('Diagnostic videos etudiant impossible:', error);
  }
};

export const listStudentAttempts = async (studentId, limit) => {
  if (!studentId) return [];
  const key = cacheKey('student:attempts', studentId, limit || 'all');
  return cached(key, async () => {
    if (!isSupabaseConfigured) {
      const demoData = await getDemoData();
      const attempts = demoData.attempts.filter((attempt) => attempt.student_id === studentId || studentId === 'student-demo');
      return limit ? attempts.slice(0, limit) : attempts;
    }
    let query = supabase
      .from('quiz_attempts')
      .select('id, quiz_id, student_id, score, total_questions, percentage, created_at, quizzes(title, subject_id, subjects(name))')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      console.error('Supabase student attempts select failed:', {
        studentId,
        limit,
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
    return data || [];
  }, 30 * 1000);
};

export const getStudentDashboardSummary = async ({ activePackId, studentId }) => {
  if (!activePackId || !studentId) {
    return { nextSessions: [], recentQuizzes: [], recentAttempts: [] };
  }
  const key = cacheKey('student:dashboard', activePackId, studentId);
  return cached(key, async () => {
    const today = new Date().toISOString().slice(0, 10);
    if (!isSupabaseConfigured) {
      const demoData = await getDemoData();
      return {
        nextSessions: demoData.sessions
          .filter((session) => session.is_visible && session.pack_id === activePackId && session.session_date >= today)
          .slice(0, 3),
        recentQuizzes: demoData.quizzes.filter((quiz) => quiz.is_published && quiz.pack_id === activePackId).slice(0, 3),
        recentAttempts: demoData.attempts.filter((attempt) => attempt.student_id === studentId || studentId === 'student-demo').slice(0, 3),
      };
    }
    const [sessionsResult, quizzesResult, attemptsResult] = await Promise.all([
      supabase
        .from('sessions')
        .select('id, title, session_date, start_time, end_time, subject_id, subjects(name)')
        .eq('is_visible', true)
        .eq('pack_id', activePackId)
        .gte('session_date', today)
        .order('session_date')
        .order('start_time')
        .limit(3),
      supabase
        .from('quizzes')
        .select('id, title, duration_minutes, subject_id, created_at, subjects(name)')
        .eq('is_published', true)
        .eq('pack_id', activePackId)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('quiz_attempts')
        .select('id, quiz_id, score, total_questions, percentage, created_at, quizzes(title)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    const results = [
      ['sessions', sessionsResult],
      ['quizzes', quizzesResult],
      ['attempts', attemptsResult],
    ];
    const failed = results.find(([, result]) => result.error);
    if (failed) {
      const [label, result] = failed;
      console.error(`Supabase student dashboard ${label} select failed:`, {
        activePackId,
        studentId,
        error: result.error,
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code,
      });
      throw result.error;
    }

    return {
      nextSessions: sessionsResult.data || [],
      recentQuizzes: quizzesResult.data || [],
      recentAttempts: attemptsResult.data || [],
    };
  }, 30 * 1000);
};

export const getStudentPack = async (studentId) => {
  if (!studentId) return null;
  const key = cacheKey('student:pack', studentId);
  return cached(key, async () => {
    if (!isSupabaseConfigured) {
      const demoData = await getDemoData();
      return demoData.studentPacks.find((item) => item.student_id === studentId) || demoData.studentPacks[0];
    }
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('student_packs')
      .select('id, student_id, pack_id, status, start_date, end_date, created_at, packs(name)')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order('created_at', { ascending: false })
      .limit(1);

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

    const activePack = data?.[0] || null;
    return activePack;
  });
};

export const getQuizWithQuestions = async (quizId, activePackId) => {
  if (!isSupabaseConfigured) {
    const demoData = await getDemoData();
    const quiz = demoData.quizzes.find((item) => item.id === quizId && (!activePackId || item.pack_id === activePackId));
    const questions = demoData.questions.filter((item) => item.quiz_id === quizId);
    return { quiz, questions };
  }
  let quizQuery = supabase
    .from('quizzes')
    .select('id, title, description, subject_id, duration_minutes, created_at, subjects(name)')
    .eq('id', quizId);
  if (activePackId) quizQuery = quizQuery.eq('is_published', true).eq('pack_id', activePackId);

  const [{ data: quiz, error: quizError }, { data: questions, error: questionsError }] = await Promise.all([
    quizQuery.single(),
    supabase
      .from('questions')
      .select('id, quiz_id, question_text, explanation, display_order, answers(id, question_id, answer_text, is_correct)')
      .eq('quiz_id', quizId)
      .order('display_order'),
  ]);
  if (quizError) throw quizError;
  if (questionsError) throw questionsError;
  return { quiz, questions: questions || [] };
};

export const getQuizAttemptCorrection = async ({ attemptId, studentId, activePackId }) => {
  if (!attemptId || !studentId) return null;
  if (!isSupabaseConfigured) {
    const demoData = await getDemoData();
    const attempt = demoData.attempts.find((item) => item.id === attemptId && (item.student_id === studentId || studentId === 'student-demo'));
    if (!attempt) return null;
    const { quiz, questions } = await getQuizWithQuestions(attempt.quiz_id, activePackId);
    return { quiz, questions, selected: attempt.answers || {}, attempt };
  }

  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, student_id, score, total_questions, percentage, created_at, quizzes(title)')
    .eq('id', attemptId)
    .eq('student_id', studentId)
    .single();
  if (attemptError) throw attemptError;

  const [{ questions, quiz }, { data: attemptAnswers, error: answersError }] = await Promise.all([
    getQuizWithQuestions(attempt.quiz_id, activePackId),
    supabase
      .from('quiz_attempt_answers')
      .select('question_id, selected_answer_id')
      .eq('attempt_id', attemptId),
  ]);
  if (answersError) throw answersError;

  const selected = (attemptAnswers || []).reduce((answers, row) => {
    if (!row.question_id || !row.selected_answer_id) return answers;
    answers[row.question_id] = [...(answers[row.question_id] || []), row.selected_answer_id];
    return answers;
  }, {});

  return { quiz, questions, selected, attempt };
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
  clearStudentCache();
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

export const importQuizQuestions = async ({ rows, subjects, quizzes, defaultPackId }) => {
  const subjectByName = new Map(subjects.map((subject) => [subject.name.trim().toLowerCase(), subject]));
  const quizByTitle = new Map(quizzes.map((quiz) => [quiz.title.trim().toLowerCase(), quiz]));
  let imported = 0;

  for (const row of rows) {
    const subject = subjectByName.get(row.subject.trim().toLowerCase());
    if (!subject) throw new Error(`Ligne ${row.line} : matière introuvable.`);

    const quizKey = row.quiz_title.trim().toLowerCase();
    let quiz = quizByTitle.get(quizKey);
    if (!quiz) {
      quiz = await createRow('quizzes', {
        title: row.quiz_title.trim(),
        description: '',
        subject_id: subject.id,
        pack_id: defaultPackId,
        duration_minutes: 30,
        is_published: false,
      });
      quizByTitle.set(quizKey, quiz);
    }

    const createdQuestion = await createRow('questions', {
      quiz_id: quiz.id,
      question_text: row.question.trim(),
      explanation: row.explanation?.trim() || '',
      display_order: imported,
    });

    const answers = [
      ['A', row.answer_a],
      ['B', row.answer_b],
      ['C', row.answer_c],
      ['D', row.answer_d],
    ];
    await Promise.all(answers.map(([letter, answerText]) =>
      createRow('answers', {
        question_id: createdQuestion.id,
        answer_text: answerText.trim(),
        is_correct: row.correct_answer === letter,
      }),
    ));
    imported += 1;
  }

  return { imported };
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

export const sanitizeFileName = (fileName) => {
  const sanitized = String(fileName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2013\u2014\u2212-]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^[._-]+|[._-]+$/g, '')
    .toLowerCase();

  return sanitized || `document-${Date.now()}.pdf`;
};

export const uploadDocumentPdf = async (file) => {
  if (!file) return '';
  const safeFileName = sanitizeFileName(file.name);
  const filePath = `documents/${Date.now()}-${safeFileName}`;
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

export const deleteStudent = async (studentId) => {
  if (!studentId) throw new Error('student_id requis.');
  if (!isSupabaseConfigured) {
    return {
      success: true,
      message: 'Étudiant supprimé avec succès.',
    };
  }

  const { data, error } = await supabase.functions.invoke('delete-student', {
    body: { student_id: studentId },
  });

  if (error || data?.error || data?.success === false) {
    let functionError = data?.error;
    if (!functionError && error?.context) {
      try {
        const response = await error.context.json();
        functionError = response?.error;
      } catch {
        functionError = null;
      }
    }
    console.error('Delete student function failed:', {
      studentId,
      error,
      data,
      message: functionError || error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
    });
    throw new Error(functionError || error?.message || 'Impossible de supprimer cet étudiant.');
  }

  return data;
};

const extractFunctionError = async (error, data) => {
  if (data?.error) return data.error;
  if (!error?.context) return null;
  try {
    const response = await error.context.json();
    return response?.error || null;
  } catch {
    return null;
  }
};

export const deleteDocument = async (documentId) => {
  if (!documentId) throw new Error('document_id requis.');
  if (!isSupabaseConfigured) {
    return {
      success: true,
      message: 'Document supprimé avec succès.',
    };
  }

  const { data, error } = await supabase.functions.invoke('delete-document', {
    body: { document_id: documentId },
  });

  if (error || data?.error || data?.success === false) {
    const functionError = await extractFunctionError(error, data);
    console.error('Delete document function failed:', {
      documentId,
      error,
      data,
      message: functionError || error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
    });
    throw new Error(functionError || error?.message || 'Impossible de supprimer ce document.');
  }

  return data;
};

export const deleteRecording = async (recordingId) => {
  if (!recordingId) throw new Error('recording_id requis.');
  if (!isSupabaseConfigured) {
    return {
      success: true,
      message: 'Enregistrement supprimé avec succès.',
    };
  }

  const { data, error } = await supabase.functions.invoke('delete-recording', {
    body: { recording_id: recordingId },
  });

  if (error || data?.error || data?.success === false) {
    const functionError = await extractFunctionError(error, data);
    console.error('Delete recording function failed:', {
      recordingId,
      error,
      data,
      message: functionError || error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
    });
    throw new Error(functionError || error?.message || 'Impossible de supprimer cet enregistrement.');
  }

  return data;
};
