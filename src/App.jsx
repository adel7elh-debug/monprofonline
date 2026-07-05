import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import StudentRoute from './routes/StudentRoute';
import Home from './pages/public/Home';
import AlertMessage from './components/AlertMessage';
import LoadingSpinner from './components/LoadingSpinner';

const Packs = lazy(() => import('./pages/public/Packs'));
const Professors = lazy(() => import('./pages/public/Professors'));
const RegisterRequest = lazy(() => import('./pages/public/RegisterRequest'));
const Contact = lazy(() => import('./pages/public/Contact'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const Login = lazy(() => import('./pages/auth/Login'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const AccessPending = lazy(() => import('./pages/auth/AccessPending'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentSubjects = lazy(() => import('./pages/student/StudentSubjects'));
const StudentDocuments = lazy(() => import('./pages/student/StudentDocuments'));
const StudentQuizzes = lazy(() => import('./pages/student/StudentQuizzes'));
const TakeQuiz = lazy(() => import('./pages/student/TakeQuiz'));
const QuizResult = lazy(() => import('./pages/student/QuizResult'));
const QuizHistory = lazy(() => import('./pages/student/QuizHistory'));
const StudentRecordings = lazy(() => import('./pages/student/StudentRecordings'));
const StudentAgenda = lazy(() => import('./pages/student/StudentAgenda'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const RegistrationRequests = lazy(() => import('./pages/admin/RegistrationRequests'));
const StudentsManagement = lazy(() => import('./pages/admin/StudentsManagement'));
const PacksManagement = lazy(() => import('./pages/admin/PacksManagement'));
const SubjectsManagement = lazy(() => import('./pages/admin/SubjectsManagement'));
const DocumentsManagement = lazy(() => import('./pages/admin/DocumentsManagement'));
const QuizzesManagement = lazy(() => import('./pages/admin/QuizzesManagement'));
const QuizEditor = lazy(() => import('./pages/admin/QuizEditor'));
const ResultsManagement = lazy(() => import('./pages/admin/ResultsManagement'));
const RecordingsManagement = lazy(() => import('./pages/admin/RecordingsManagement'));
const SessionsManagement = lazy(() => import('./pages/admin/SessionsManagement'));
const ContactMessages = lazy(() => import('./pages/admin/ContactMessages'));

function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <AlertMessage type="warning">Page introuvable.</AlertMessage>
    </main>
  );
}

const studentPage = (element) => (
  <Suspense fallback={<LoadingSpinner label="Chargement de l’espace étudiant..." />}>
    {element}
  </Suspense>
);

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner label="Chargement..." />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="packs" element={<Packs />} />
          <Route path="professeurs" element={<Professors />} />
          <Route path="inscription" element={<RegisterRequest />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="access-pending" element={<AccessPending />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<StudentRoute />}>
            <Route path="student" element={<DashboardLayout area="student" />}>
              <Route index element={studentPage(<StudentDashboard />)} />
              <Route path="subjects" element={studentPage(<StudentSubjects />)} />
              <Route path="documents" element={studentPage(<StudentDocuments />)} />
              <Route path="quizzes" element={studentPage(<StudentQuizzes />)} />
              <Route path="quizzes/:quizId" element={studentPage(<TakeQuiz />)} />
              <Route path="quizzes/:quizId/result" element={studentPage(<QuizResult />)} />
              <Route path="history" element={studentPage(<QuizHistory />)} />
              <Route path="quiz-history" element={studentPage(<QuizHistory />)} />
              <Route path="recordings" element={studentPage(<StudentRecordings />)} />
              <Route path="agenda" element={studentPage(<StudentAgenda />)} />
              <Route path="profile" element={studentPage(<StudentProfile />)} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="admin" element={<DashboardLayout area="admin" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="requests" element={<RegistrationRequests />} />
              <Route path="students" element={<StudentsManagement />} />
              <Route path="packs" element={<PacksManagement />} />
              <Route path="subjects" element={<SubjectsManagement />} />
              <Route path="documents" element={<DocumentsManagement />} />
              <Route path="quizzes" element={<QuizzesManagement />} />
              <Route path="quizzes/:quizId" element={<QuizEditor />} />
              <Route path="results" element={<ResultsManagement />} />
              <Route path="recordings" element={<RecordingsManagement />} />
              <Route path="agenda" element={<SessionsManagement />} />
              <Route path="messages" element={<ContactMessages />} />
            </Route>
          </Route>
        </Route>

        <Route path="/dashboard" element={<Navigate to="/student" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
