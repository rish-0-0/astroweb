import { ComponentChildren, JSX } from 'preact';
import { createContext } from 'preact';
import { useContext, useState, useCallback } from 'preact/hooks';

// Define available notification types.
export type NotificationType = 'success' | 'info' | 'error' | 'warning' | 'debug';

// Define the structure of a toast item.
interface ToastItem {
    id: number;
    type: NotificationType;
    message: string;
    duration: number; // Duration in milliseconds.
}

// Define the context type.
interface ToastContextType {
    displayToast: (type: NotificationType, message: string, duration?: number) => void;
}

// Create the ToastContext.
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ToastProvider component that wraps your application and renders active toasts.
export const ToastProvider = ({ children }: { children: ComponentChildren }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    // displayToast exposes a method to add a new toast message.
    const displayToast = useCallback(
        (type: NotificationType, message: string, duration = 3000) => {
            const id = Date.now();
            const newToast: ToastItem = { id, type, message, duration };
            setToasts((prev) => [...prev, newToast]);

            // Remove the toast after the specified duration.
            setTimeout(() => {
                setToasts((prev) => prev.filter((toast) => toast.id !== id));
            }, duration);
        },
        []
    );

    return (
        <ToastContext.Provider value={{ displayToast }}>
            {children}

            {/* Toast Container: Bottom right of the screen */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '1rem',
                    right: '1rem',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                }}
            >
                {toasts.map((toast) => (
                    <Toast key={toast.id} type={toast.type} message={toast.message} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

// Custom hook that components can use to access displayToast.
export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Simple Toast component that styles each toast based on its type.
interface ToastProps {
    type: NotificationType;
    message: string;
}

const Toast = ({ type, message }: ToastProps) => {
    let borderColor = '';

    // Choose a really bright color for the left border based on the type.
    switch (type) {
        case 'success':
            borderColor = '#28a745'; // bright green
            break;
        case 'info':
            borderColor = '#17a2b8'; // bright blue
            break;
        case 'error':
            borderColor = '#dc3545'; // bright red
            break;
        case 'warning':
            borderColor = '#ffc107'; // bright yellow/orange
            break;
        case 'debug':
            borderColor = '#6c757d'; // bright grey/purple-ish
            break;
        default:
            borderColor = '#cccccc';
    }

    const toastStyle: JSX.CSSProperties = {
        minWidth: '250px',
        padding: '1rem',
        borderLeft: `1px solid ${borderColor}`,
        fontWeight: 'bold',
        backgroundColor: 'white',
        color: 'black',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        fontSize: '0.5rem',
    };

    return <div style={toastStyle}>{message}</div>;
};
