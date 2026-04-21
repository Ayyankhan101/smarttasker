import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
    const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
    const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, success, error, info }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 animate-slide-in ${
                            toast.type === 'success' ? 'bg-green-600' :
                            toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
                        }`}
                    >
                        {toast.type === 'success' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {toast.type === 'error' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}