export const demoPack = {
  id: 'pack-complet',
  name: 'Pack complet Préparation Master',
  price: 1300,
  description:
    'Préparation écrite et orale avec supports PDF, annales corrigées, QCM et accompagnement personnalisé.',
  is_active: true,
};

export const subjects = [
  'Économie générale',
  'Management',
  'Finance',
  'Marketing',
  'Comptabilité',
  'Méthodologie',
  'Culture générale économique',
  'Préparation orale',
].map((name, index) => ({
  id: `subject-${index + 1}`,
  name,
  description: `Module ${name} pour les concours de Master.`,
  display_order: index + 1,
}));

export const profiles = [
  {
    id: 'admin-demo',
    full_name: 'Admin MonProf',
    phone: '0600000000',
    role: 'admin',
    access_status: 'active',
  },
  {
    id: 'student-demo',
    full_name: 'Sara El Amrani',
    phone: '0611111111',
    role: 'student',
    access_status: 'active',
  },
  {
    id: 'student-pending',
    full_name: 'Youssef Benali',
    phone: '0622222222',
    role: 'student',
    access_status: 'pending',
  },
];

export const studentPacks = [
  {
    id: 'sp-1',
    student_id: 'student-demo',
    pack_id: demoPack.id,
    status: 'active',
    start_date: '2026-07-01',
    end_date: '2026-10-01',
    packs: demoPack,
  },
];

export const documents = [
  {
    id: 'doc-1',
    title: 'Résumé d’économie générale',
    description: 'Concepts essentiels et synthèses rapides.',
    subject_id: 'subject-1',
    pack_id: demoPack.id,
    file_path: 'demo/resume-economie.pdf',
    document_type: 'resume',
    is_visible: true,
    subjects: subjects[0],
  },
  {
    id: 'doc-2',
    title: 'Annales corrigées de management',
    description: 'Sujets récents avec corrections détaillées.',
    subject_id: 'subject-2',
    pack_id: demoPack.id,
    file_path: 'demo/annales-management.pdf',
    document_type: 'annale',
    is_visible: true,
    subjects: subjects[1],
  },
  {
    id: 'doc-3',
    title: 'Support de préparation orale',
    description: 'Méthodes pour structurer les réponses orales.',
    subject_id: 'subject-8',
    pack_id: demoPack.id,
    file_path: 'demo/oral.pdf',
    document_type: 'support',
    is_visible: true,
    subjects: subjects[7],
  },
];

export const quizzes = [
  {
    id: 'quiz-1',
    title: 'QCM Économie - Fondamentaux',
    description: 'Vérification des notions de base.',
    subject_id: 'subject-1',
    pack_id: demoPack.id,
    duration_minutes: 30,
    is_published: true,
    subjects: subjects[0],
  },
  {
    id: 'quiz-2',
    title: 'QCM Management - Organisations',
    description: 'Styles de management et structures.',
    subject_id: 'subject-2',
    pack_id: demoPack.id,
    duration_minutes: 25,
    is_published: true,
    subjects: subjects[1],
  },
];

export const questions = [
  {
    id: 'q-1',
    quiz_id: 'quiz-1',
    question_text: 'Quel indicateur mesure la richesse produite par une économie ?',
    explanation: 'Le PIB mesure la valeur des biens et services finaux produits.',
    display_order: 1,
    answers: [
      { id: 'a-1', question_id: 'q-1', answer_text: 'PIB', is_correct: true },
      { id: 'a-2', question_id: 'q-1', answer_text: 'Inflation', is_correct: false },
      { id: 'a-3', question_id: 'q-1', answer_text: 'Taux de change', is_correct: false },
    ],
  },
  {
    id: 'q-2',
    quiz_id: 'quiz-1',
    question_text: 'Une inflation élevée réduit généralement le pouvoir d’achat.',
    explanation: 'À revenu constant, la hausse générale des prix réduit la quantité achetable.',
    display_order: 2,
    answers: [
      { id: 'a-4', question_id: 'q-2', answer_text: 'Vrai', is_correct: true },
      { id: 'a-5', question_id: 'q-2', answer_text: 'Faux', is_correct: false },
    ],
  },
  {
    id: 'q-3',
    quiz_id: 'quiz-2',
    question_text: 'Le management participatif implique les collaborateurs dans les décisions.',
    explanation: 'Ce style favorise la contribution et la responsabilisation.',
    display_order: 1,
    answers: [
      { id: 'a-6', question_id: 'q-3', answer_text: 'Vrai', is_correct: true },
      { id: 'a-7', question_id: 'q-3', answer_text: 'Faux', is_correct: false },
    ],
  },
];

export const recordings = [
  {
    id: 'rec-1',
    title: 'Séance économie - cadrage concours',
    description: 'Replay de la première séance.',
    subject_id: 'subject-1',
    pack_id: demoPack.id,
    youtube_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_playlist_url: '',
    session_date: '2026-07-05T18:00:00',
    embed_enabled: true,
    is_visible: true,
    subjects: subjects[0],
  },
  {
    id: 'rec-2',
    title: 'Séance orale - méthodologie',
    description: 'Conseils pour l’entretien oral.',
    subject_id: 'subject-8',
    pack_id: demoPack.id,
    youtube_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_playlist_url: '',
    session_date: '2026-07-08T18:00:00',
    embed_enabled: true,
    is_visible: true,
    subjects: subjects[7],
  },
];

export const sessions = [
  {
    id: 'session-1',
    title: 'Séance 1 - cadrage économie',
    description: 'Présentation des attentes du concours et rappel des notions essentielles.',
    subject_id: 'subject-1',
    pack_id: demoPack.id,
    session_date: '2026-07-08',
    start_time: '20:00',
    end_time: '22:00',
    meet_link: 'https://meet.google.com/demo-agenda',
    replay_link: '',
    status: 'scheduled',
    is_visible: true,
    subjects: subjects[0],
    packs: demoPack,
  },
  {
    id: 'session-2',
    title: 'Méthodologie de préparation orale',
    description: 'Travail sur la structure des réponses et la présentation du parcours.',
    subject_id: 'subject-8',
    pack_id: demoPack.id,
    session_date: '2026-07-10',
    start_time: '19:30',
    end_time: '21:00',
    meet_link: 'https://meet.google.com/demo-oral',
    replay_link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'scheduled',
    is_visible: true,
    subjects: subjects[7],
    packs: demoPack,
  },
];

export const registrationRequests = [
  {
    id: 'rr-1',
    full_name: 'Hajar Mansouri',
    phone: '0633333333',
    email: 'hajar@example.com',
    city: 'Casablanca',
    study_level: 'Licence',
    field: 'Économie',
    pack_id: demoPack.id,
    status: 'pending',
    created_at: '2026-07-01T10:00:00',
  },
  {
    id: 'rr-2',
    full_name: 'Omar Idrissi',
    phone: '0644444444',
    email: 'omar@example.com',
    city: 'Rabat',
    study_level: 'Bac+3',
    field: 'Gestion',
    pack_id: demoPack.id,
    status: 'pending',
    created_at: '2026-07-01T11:30:00',
  },
];

export const contactMessages = [
  {
    id: 'cm-1',
    full_name: 'Nadia',
    phone: '0655555555',
    email: 'nadia@example.com',
    message: 'Je veux plus d’informations sur les séances.',
    status: 'new',
    created_at: '2026-07-01T12:00:00',
  },
  {
    id: 'cm-2',
    full_name: 'Mehdi',
    phone: '0666666666',
    email: 'mehdi@example.com',
    message: 'Est-ce que les enregistrements restent disponibles ?',
    status: 'contacted',
    created_at: '2026-07-01T13:00:00',
  },
];

export const attempts = [
  {
    id: 'attempt-1',
    quiz_id: 'quiz-1',
    student_id: 'student-demo',
    score: 2,
    total_questions: 2,
    percentage: 100,
    created_at: '2026-07-02T09:00:00',
    quizzes: quizzes[0],
  },
];

export const demoData = {
  packs: [demoPack],
  subjects,
  profiles,
  studentPacks,
  documents,
  quizzes,
  questions,
  recordings,
  sessions,
  registrationRequests,
  contactMessages,
  attempts,
};
