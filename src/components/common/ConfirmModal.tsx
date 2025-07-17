import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Confirmação",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm border border-blue-100 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <FiAlertTriangle className="text-yellow-500" size={22} />
          <span className="font-bold text-blue-900 text-lg">{title}</span>
        </div>
        <div className="mb-5 text-gray-700 text-sm">{message}</div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}