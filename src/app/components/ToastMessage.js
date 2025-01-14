import { useEffect, useState } from 'react';

export default function ToastMessage({ message, type, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isVisible) {
            const fadeOutTimer = setTimeout(onClose, 1000);
            return () => clearTimeout(fadeOutTimer);
        }
    }, [isVisible, onClose]);

    return (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg transition-opacity duration-1000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'} ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {message}
        </div>
    );
}
