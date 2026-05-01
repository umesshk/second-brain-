import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import Sign from "./components/Sign";
import Layout from "./components/Layout";
import NotesPage from "./components/NotesPage";
import PublicSharePage from "./components/PublicSharePage";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" theme="colored" />
      <Routes>
        <Route path="/share/:token" element={<PublicSharePage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<NotesPage />} />
        </Route>
        <Route path="/register" element={<Sign />} />
        <Route path="/login" element={<Sign text="login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
