import { BiHome } from "react-icons/bi";
import { FaBars } from "react-icons/fa6";
import { LuBrain } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const items = [{ title: "Notes", icon: <BiHome />, path: "/" }];

  return (
    <div className="sm:h-screen sm:w-[300px] sm:border-r-2">
      <div className="container p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:ml-5">
            <LuBrain className="text-3xl text-purple-500" />
            <h1 className="text-3xl font-bold leading-none tracking-tight">SecondBrain</h1>
          </div>
          <span className="text-2xl sm:hidden">
            <FaBars />
          </span>
        </div>

        <div className="mt-12 hidden flex-col gap-6 sm:flex">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="cursor-pointer rounded-xl px-5 py-2 transition-all duration-200 ease-in-out hover:bg-purple-100"
            >
              <span className="inline-flex items-center justify-center gap-4 text-2xl">
                {item.icon}
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
