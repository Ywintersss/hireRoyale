export default function Home() {
    return (
        <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6" style={{ color: '#1E3A8A' }}>
                    Dashboard
                </h1>
                <p className="text-gray-600 mb-8">
                    Welcome to your dashboard. Use the sidebar to navigate between different sections.
                </p>

                {/* Demo Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="bg-white rounded-lg p-6 shadow-md border-l-4"
                            style={{ borderLeftColor: item % 3 === 0 ? '#F97316' : item % 2 === 0 ? '#0EA5E9' : '#1E3A8A' }}
                        >
                            <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E3A8A' }}>
                                Card Title {item}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                This is a sample card to demonstrate the layout with the sidebar.
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
