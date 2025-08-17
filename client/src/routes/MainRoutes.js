import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Student Pages
const StudentDashboard = Loadable(lazy(() => import('pages/extra-pages/student/StudentDashboard')));
const StudentCourses = Loadable(lazy(() => import('pages/extra-pages/student/StudentCourses')));
const StudentCommunication = Loadable(lazy(() => import('pages/extra-pages/student/StudentCommunication')));
const StudentAssessmentGrading = Loadable(lazy(() => import('pages/extra-pages/student/StudentAssessmentGrading')));
const StudentProgressTracking = Loadable(lazy(() => import('pages/extra-pages/student/StudentProgressTracking')));
const StudentAIChatbot = Loadable(lazy(() => import('pages/extra-pages/student/StudentAIChatbot')));
const StudentProfile = Loadable(lazy(() => import('pages/extra-pages/student/StudentProfile')));
const StudentSettings = Loadable(lazy(() => import('pages/extra-pages/student/StudentSettings')));

// Teacher Pages
const TeacherDashboard = Loadable(lazy(() => import('pages/extra-pages/teacher/TeacherDashboard')));
const CourseManagement = Loadable(lazy(() => import('pages/extra-pages/teacher/CourseManagement')));
const TeacherCommunication = Loadable(lazy(() => import('pages/extra-pages/teacher/TeacherCommunication')));
const TeacherAssessmentGrading = Loadable(lazy(() => import('pages/extra-pages/teacher/TeacherAssessmentGrading')));
const TeacherProgressTracking = Loadable(lazy(() => import('pages/extra-pages/teacher/TeacherProgressTracking')));
const TeacherAIChatbot = Loadable(lazy(() => import('pages/extra-pages/teacher/TeacherAIChatbot')));
const TeacherProfile = Loadable(lazy(() => import('pages/extra-pages/teacher/TeacherProfile')));
const TeacherSettings = Loadable(lazy(() => import('pages/extra-pages/teacher/TeacherSettings')));

// Admin Pages
const AdminDashboard = Loadable(lazy(() => import('pages/extra-pages/admin/AdminDashboard')));
const TeacherManagement = Loadable(lazy(() => import('pages/extra-pages/admin/TeacherManagement')));
const UserManagement = Loadable(lazy(() => import('pages/extra-pages/admin/UserManagement')));
const Reports = Loadable(lazy(() => import('pages/extra-pages/admin/Reports')));
const Settings = Loadable(lazy(() => import('pages/extra-pages/admin/Settings')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <ProtectedRoute element={MainLayout} />,
  children: [
    // Student Routes
    {
      path: '/student/dashboard',
      element: <ProtectedRoute role="Student" element={StudentDashboard} />,
    },
    {
      path: '/student/courses',
      element: <ProtectedRoute role="Student" element={StudentCourses} />,
    },
    {
      path: '/student/communication',
      element: <ProtectedRoute role="Student" element={StudentCommunication} />,
    },
    {
      path: '/student/assessment-grading',
      element: <ProtectedRoute role="Student" element={StudentAssessmentGrading} />,
    },
    {
      path: '/student/progress-tracking',
      element: <ProtectedRoute role="Student" element={StudentProgressTracking} />,
    },
    {
      path: '/student/ai-chatbot',
      element: <ProtectedRoute role="Student" element={StudentAIChatbot} />,
    },
    {
      path: '/student/profile',
      element: <ProtectedRoute role="Student" element={StudentProfile} />,
    },
    {
      path: '/student/settings',
      element: <ProtectedRoute role="Student" element={StudentSettings} />,
    },

    // Teacher Routes
    {
      path: '/teacher/dashboard',
      element: <ProtectedRoute role="Teacher" element={TeacherDashboard} />,
    },
    {
      path: '/teacher/course-management',
      element: <ProtectedRoute role="Teacher" element={CourseManagement} />,
    },
    {
      path: '/teacher/communication',
      element: <ProtectedRoute role="Teacher" element={TeacherCommunication} />,
    },
    {
      path: '/teacher/assessment-grading',
      element: <ProtectedRoute role="Teacher" element={TeacherAssessmentGrading} />,
    },
    {
      path: '/teacher/progress-tracking',
      element: <ProtectedRoute role="Teacher" element={TeacherProgressTracking} />,
    },
    {
      path: '/teacher/ai-chatbot',
      element: <ProtectedRoute role="Teacher" element={TeacherAIChatbot} />,
    },
    {
      path: '/teacher/profile',
      element: <ProtectedRoute role="Teacher" element={TeacherProfile} />,
    },
    {
      path: '/teacher/settings',
      element: <ProtectedRoute role="Teacher" element={TeacherSettings} />,
    },

    // Admin Routes
    {
      path: '/admin/dashboard',
      element: <ProtectedRoute role="Admin" element={AdminDashboard} />,
    },
    {
      path: '/admin-teacher-management',
      element: <ProtectedRoute role="Admin" element={TeacherManagement} />,
    },
    {
      path: '/admin-user-management',
      element: <ProtectedRoute role="Admin" element={UserManagement} />,
    },
    {
      path: '/admin-reports',
      element: <ProtectedRoute role="Admin" element={Reports} />,
    },
    {
      path: '/admin-settings',
      element: <ProtectedRoute role="Admin" element={Settings} />,
    },
  ],
};

export default MainRoutes;