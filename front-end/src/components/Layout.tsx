import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./SideBar";

export default function Layout() {
  const [notesKey, setNotesKey] = useState(0);

  return (
    <div className="sm:flex">
      <Sidebar />
      <div className="w-full">
        <Navbar onNotesSaved={() => setNotesKey((k) => k + 1)} />
        <Outlet context={{ notesKey }} />
      </div>
    </div>
  );
}
