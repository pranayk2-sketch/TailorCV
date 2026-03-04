import { createBrowserRouter, Navigate } from 'react-router';
import { HomePage } from './pages/HomePage';
import { ExperiencePage } from './pages/ExperiencePage';
import { AssistantPage } from './pages/AssistantPage';
import { InternshipsPage } from './pages/InternshipsPage';
import { InternshipDetailsPage } from './pages/InternshipDetailsPage';
import { VariantDetailPage } from './pages/VariantDetailPage';
import { ResumesPage } from './pages/ResumesPage';
import { UploadResumePage } from './pages/UploadResumePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/login', Component: LoginPage },
  { path: '/signup', Component: SignupPage },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, Component: HomePage },
      { path: 'experience', Component: ExperiencePage },
      { path: 'assistant', Component: AssistantPage },
      { path: 'internships', Component: InternshipsPage },
      { path: 'internships/:id', Component: InternshipDetailsPage },
      { path: 'variants/:id', Component: VariantDetailPage },
      { path: 'resumes', Component: ResumesPage },
      { path: 'upload', Component: UploadResumePage },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
