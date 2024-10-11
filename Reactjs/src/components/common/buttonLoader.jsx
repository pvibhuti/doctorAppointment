
function LoaderButton({ isLoading, buttonText = "Submit", loadingText = "Submitting.."}) {
    return (
        <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-500 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center
            ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"}`}
        >
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                    </svg>
                    {loadingText}
                </>
            ) : (
                buttonText
            )}
        </button>
    );
}

export default LoaderButton;