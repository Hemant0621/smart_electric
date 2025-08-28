import { Bell, User } from "lucide-react";

export default function Topbar({user}) {
  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-3">
      <h1 className="text-xl font-semibold">Overview</h1>
      <div className="flex items-center gap-6">
        <Bell className="text-gray-600 cursor-pointer" />
        <div className="flex items-center gap-2 cursor-pointer">
          <User className="text-gray-600" />
          <span className="font-medium">{user}</span>
        </div>
      </div>
    </div>
  );
}
