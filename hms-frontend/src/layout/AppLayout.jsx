import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import CommandPalette from './CommandPalette.jsx';

export default function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onOpenCommand={() => setCmdOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto animate-fade-up">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
    </div>
  );
}
