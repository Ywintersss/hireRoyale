export function scheduleLobbyCreation(eventId: string, lobbyName: string) {
    const now = new Date();
    const targetTime = new Date(now.getTime() + 20 * 1000); // 20 seconds later

    console.log(`Lobby creation scheduled at: ${targetTime.toISOString()}`);

    const delay = targetTime.getTime() - now.getTime(); // ~20000ms

    setTimeout(async () => {
        try {
            const response = await fetch("http://localhost:8000/events/create-lobby", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId: eventId, lobbyName: lobbyName }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            console.log("Lobby created successfully:", data);
        } catch (err) {
            console.error("Error creating lobby:", err);
        }
    }, delay);
}
