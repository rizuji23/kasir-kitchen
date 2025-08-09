import { useWebSocket } from "../components/context/WebsocketContext";
import NavbarCustom from "../components/navbar";
import { Card, CardBody, Chip } from "@heroui/react";

export default function HomePage() {
    const { clientIPs } = useWebSocket();



    return (
        <div>
            <NavbarCustom />
            <div className="my-5 container mx-auto px-5">
                <div className="flex justify-center">
                    <div className="grid gap-3 min-w-[300px]">
                        <h3 className="font-bold text-center text-xl">Kasir Yang Terkoneksi:</h3>
                        {
                            clientIPs.length === 0 ? <>
                                <Card className="mt-5">
                                    <CardBody className="py-10">
                                        <p className="text-center font-bold">Koneksi Tidak Ditemukan</p>
                                    </CardBody>
                                </Card>
                            </> :
                                clientIPs.map((el, i) => (
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
