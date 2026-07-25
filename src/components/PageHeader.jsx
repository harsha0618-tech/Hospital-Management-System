import { useNavigate } from "react-router-dom";

function PageHeader({ title, subtitle, icon, colorClass = "brand" }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl bg-${colorClass}-light flex items-center justify-center text-2xl shadow-soft`}
        >
          {icon}
        </div>
        <div>
          <h1 className={`text-2xl font-bold text-${colorClass}-dark`}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full shadow-soft hover:shadow-card-hover hover:text-gray-900 transition-all"
      >
        ← Home
      </button>
    </div>
  );
}

export default PageHeader;