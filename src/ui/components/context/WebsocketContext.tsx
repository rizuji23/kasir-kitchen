import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "react-hot-toast";
import { Howl } from "howler";
import notification_masuk from "../../assets/notification_masuk.mp3";

interface WebSocketContextType {
    clientIPs: string[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
    const [clientIPs, setClientIPs] = useState<string[]>(() => {
        return JSON.parse(localStorage.getItem("clientIPs") || "[]");
    });

    // Create sound instance once and reuse it
    const notificationSound = new Howl({
        src: [notification_masuk],
        volume: 1,
    });

    useEffect(() => {
        if (window.api) {
            // Handle client connection updates
            window.api.receive("update_client_list", (newIPs: string[]) => {
                console.log("Updated client list:", newIPs);

                const previousIPs = JSON.parse(localStorage.getItem("clientIPs") || "[]");
                const addedClients = newIPs.filter(ip => !previousIPs.includes(ip));
                const removedClients = previousIPs.filter((ip: string) => !newIPs.includes(ip));

                addedClients.forEach(ip => {
                    toast.success(`Client connected: ${ip}`, { duration: 5000 });
                });

                removedClients.forEach((ip: string) => {
                    toast.error(`Client disconnected: ${ip}`, { duration: 5000 });
                });

                setClientIPs(newIPs);
                localStorage.setItem("clientIPs", JSON.stringify(newIPs));
            });

            window.api.onMessageChange((data: unknown) => {
                console.log("Received message:", data);

                if (notificationSound) {
                    notificationSound.play();
                } else {
                    console.warn("Audio file not loaded properly");
                }

                toast.success(`Pesanan Masuk`, { duration: 5000 });
            });
        }
    }, []); // Runs only once on mount

    return (
        <WebSocketContext.Provider value={{ clientIPs }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
}
