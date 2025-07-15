import { useWebSocket } from "../components/context/WebsocketContext";
import NavbarCustom from "../components/navbar";
import { Chip } from "@heroui/react";

export default function HomePage() {
    const { clientIPs } = useWebSocket();

    return (
        <div>
            <NavbarCustom />
            <div className="my-5 container mx-auto">
                <div className="flex justify-center">
                    <div className="grid gap-3 min-w-[300px]">
                        <h3 className="font-bold text-center text-xl">Kasir Yang Terkoneksi:</h3>
                        {clientIPs.map((el, i) => (
                            <div key={i} className="w-full h-fit bg-slate-300/50 p-3 rounded-md flex gap-3 justify-between">
                                <p>{el}</p>
                                <Chip size="sm" color="success">Connected</Chip>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
