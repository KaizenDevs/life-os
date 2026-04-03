import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useToast } from "../context/ToastContext";

const STYLES = {
  success: "bg-green-600 text-white",
  error:   "bg-red-600 text-white",
  info:    "bg-gray-800 text-white",
};

const ICONS = {
  success: <CheckCircle size={16} />,
  error:   <XCircle size={16} />,
  info:    <Info size={16} />,
};

export function Toasts() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm max-w-xs animate-in ${STYLES[t.type]}`}
        >
          {ICONS[t.type]}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100 ml-1">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
