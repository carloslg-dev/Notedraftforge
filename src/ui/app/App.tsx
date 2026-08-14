import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkListPage } from '@/ui/features/work-list/WorkListPage';
import { WorkViewPage } from '@/ui/features/work-view/WorkViewPage';
import { WorkspacePage } from '@/ui/features/workspace/WorkspacePage';
import { AuditionPage } from '@/ui/features/workspace/AuditionPage';
import { Toaster } from '@/ui/components/ui/toaster';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<WorkListPage />} />
        <Route path="/work/:pieceId" element={<WorkViewPage />} />
        <Route path="/workspace/:flowId" element={<WorkspacePage />} />
        <Route path="/workspace/:flowId/audition" element={<AuditionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </HashRouter>
  );
}

