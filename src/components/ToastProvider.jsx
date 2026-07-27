import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const typeStyles = {
  success: { bg: "bg-white", border: "border-doctor-DEFAULT", icon: "✅", text: "text-doctor-dark" },
  info: { bg: "bg-white", border: "border-brand-DEFAULT", icon: "ℹ️", text: "text-brand-dark" },
  error: { bg: "bg-white", border: "border-red-400", icon: "⚠️", text: "text-red-600" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
        {toasts.map((t) => {
          const style = typeStyles[t.type] || typeStyles.success;
          return (
            <div
              key={t.id}
              className={`${style.bg} ${style.border} border-l-4 shadow-card-hover rounded-lg px-4 py-3 flex items-center gap-2.5 min-w-[240px] max-w-sm animate-toast-in`}
            >
              <span className="text-base">{style.icon}</span>
              <span className={`text-sm font-medium ${style.text}`}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}