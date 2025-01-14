export default function Spinner({label}) {
    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-violet-500"></div>
            <p className="text-white">{label}</p>
        </div>
    );
}
