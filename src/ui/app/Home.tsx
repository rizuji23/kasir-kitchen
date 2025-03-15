import { useEffect, useState } from "react";
import NavbarCustom from "../components/navbar";
import { Chip } from "@heroui/react";

export default function HomePage() {
    const [clientIPs, setClientIPs] = useState<string[]>(() => {
        return JSON.parse(localStorage.getItem("clientIPs") || "[]");
    });

    useEffect(() => {
        if (window.api) {
            window.api.receive("update_client_list", (ips: string[]) => {
                console.log("Updated client list:", ips);
                setClientIPs(ips);
                localStorage.setItem("clientIPs", JSON.stringify(ips));
            });
        }
    }, []);

    return (
        <>
            <div>
                <NavbarCustom />
                <div className="my-5 container mx-auto">
                    <div className="flex justify-center">
                        <div className="grid gap-3">
                            <h3 className="font-bold text-center text-xl">Websocket Connected Clients</h3>
                            {
                                clientIPs.map((el, i) => {
                                    return <div key={i} className="w-full h-fit bg-slate-300/50 p-3 rounded-md flex gap-3 justify-between">
                                        <p>{el}</p>
                                        <Chip size="sm" color="success">Connected</Chip>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}