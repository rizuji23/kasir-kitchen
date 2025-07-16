import { Button, Card, CardBody, CardFooter, CardHeader, Input } from "@heroui/react";
import NavbarCustom from "../components/navbar";
import AboutPage from "./section/About";
import PrinterApi from "./section/PrinterApi";

export default function SettingsPage() {
    return (
        <>
            <div>
                <NavbarCustom />
                <div className="my-5 container mx-auto px-5 grid gap-3">
                    <PrinterApi title="Printer Kitchen" type_printer="KITCHEN" />
                    <PrinterApi title="Printer Bar" type_printer="BAR" />
                    <div className="grid grid-cols-2 gap-3">
                        <Card className="h-fit">
                            <CardHeader className="font-bold">Set Timer Makanan</CardHeader>
                            <CardBody>
                                <div className="grid gap-3">
                                    <Input type="number" placeholder="Masukkan timer dalam menit..." />
                                </div>
                            </CardBody>
                            <CardFooter className="justify-end">
                                <Button type="submit">Simpan Perubahan</Button>
                            </CardFooter>
                        </Card>
                        <Card className="h-fit">
                            <CardHeader className="font-bold">Set Timer Minuman</CardHeader>
                            <CardBody>
                                <div className="grid gap-3">
                                    <Input type="number" placeholder="Masukkan timer dalam menit..." />
                                </div>
                            </CardBody>
                            <CardFooter className="justify-end">
                                <Button type="submit">Simpan Perubahan</Button>
                            </CardFooter>
                        </Card>
                    </div>
                    <AboutPage />
                </div>
            </div>
        </>
    )
}