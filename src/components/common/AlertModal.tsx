import React from "react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

interface AlertModalProps {
  open: boolean;
  type?: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}

export default function AlertModal({
  open,
  type = "info",
  message,
  onClose
}: AlertModalProps) {
  if (!open) return null;

  const icon =
    type === "success" ? <FiCheckCircle className="text-green-500" size={28} /> :
    type === "error"   ? <FiAlertCircle className="text-red-500" size={28} /> :
                         <FiAlertCircle className="text-blue-500" size={28} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs border border-blue-100 animate-fade-in flex flex-col items-center">
        <div className="mb-2">{icon}</div>
        <div className="mb-4 text-center text-gray-800 font-medium">{message}</div>
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        >
          <FiX size={16} />
          Fechar
        </button>
      </div>
    </div>
  );
}