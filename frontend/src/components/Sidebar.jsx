import { Home, BarChart3, Settings } from "lucide-react";

export default function Sidebar({tab}) {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        ⚡ Energy Dash
      </div>
      <nav className="flex-1 p-4 space-y-4">
        <a href="#" onClick={()=>tab("dashboard")} className="flex items-center gap-2 hover:text-yellow-400">
          <Home size={20} /> Dashboard
        </a>
        <a href="#" onClick={()=>tab("settings")} className="flex items-center gap-2 hover:text-yellow-400">
          <Settings size={20} /> Settings
        </a>
      </nav>
    </div>
  );
}
