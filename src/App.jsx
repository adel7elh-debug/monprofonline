import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import StudentRoute from './routes/StudentRoute';
import Home from './pages/public/Home';
import Packs from './pages/public/Packs';
import RegisterRequest from './pages/public/RegisterRequest';
import Contact from './pages/public/Contact';
import FAQ from './pages/public/FAQ';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import AccessPending from './pages/auth/AccessPending';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentSubjects from './pages/student/StudentSubjects';
import StudentDocuments from './pages/student/StudentDocuments';
import StudentQuizzes from './pages/student/StudentQuizzes';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResult from './pages/student/QuizResult';
import QuizHistory from './pages/student/QuizHistory';
import StudentRecordings from './pages/student/StudentRecordings';
import StudentProfile from './pages/student/StudentProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import RegistrationRequests from './pages/admin/RegistrationRequests';
import StudentsManagement from './pages/admin/StudentsManagement';
import PacksManagement from './pages/admin/PacksManagement';
import SubjectsManagement from './pages/admin/SubjectsManagement';
import DocumentsManagement from './pages/admin/DocumentsManagement';
import QuizzesManagement from './pages/admin/QuizzesManagement';
import QuizEditor from './pages/admin/QuizEditor';
import ResultsManagement from './pages/admin/ResultsManagement';
import RecordingsManagement from './pages/admin/RecordingsManagement';
import ContactMessages from './pages/admin/ContactMessages';
import AlertMessage from './components/AlertMessage';

function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <AlertMessage type="warning">Page introuvable.</AlertMessage>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="packs" element={<Packs />} />
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
            <Route index element={<StudentDashboard />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="documents" element={<StudentDocuments />} />
            <Route path="quizzes" element={<StudentQuizzes />} />
            <Route path="quizzes/:quizId" element={<TakeQuiz />} />
            <Route path="quizzes/:quizId/result" element={<QuizResult />} />
            <Route path="history" element={<QuizHistory />} />
            <Route path="recordings" element={<StudentRecordings />} />
            <Route path="profile" element={<StudentProfile />} />
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
            <Route path="messages" element={<ContactMessages />} />
          </Route>
        </Route>
      </Route>

      <Route path="/dashboard" element={<Navigate to="/student" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
