import { Button, Card, CardBody, CardFooter, CardHeader, Input } from "@heroui/react";
import NavbarCustom from "../components/navbar";
import AboutPage from "./section/About";
import PrinterApi from "./section/PrinterApi";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const [timer_food, setTimerFood] = useState<string>("");
    const [timer_drink, setTimerDrink] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const getTimer = async () => {
        try {
            const res = await window.api.get_timer();
            console.log("res", res)
            if (res.status) {
                const timerFood = res.data?.data_timer.filter((el) => el.id_settings === "TIMER_FOOD")[0]
                const timerDrink = res.data?.data_timer.filter((el) => el.id_settings === "TIMER_DRINK")[0]
                setTimerFood(timerFood?.content || "");
                setTimerDrink(timerDrink?.content || "");
            } else {
                setTimerDrink("");
                setTimerFood("");
            }

        } catch (err) {
            return err;
        }
    }

    const handleSaveFood = async () => {
        try {
            setLoading(true)
            if (timer_food.length === 0) {
                toast.error("Timer Makanan wajib diisi!");
                return
            }

            if (timer_food === "0") {
                toast.error("Timer Makanan tidak boleh nol!");
                return
            }

            const res = await window.api.save_timer_food(timer_food);

            if (res.status) {
                toast.success("Berhasil disimpan");
                getTimer();
            }


        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        } finally {
            setLoading(false);
        }
    }

    const handleSaveDrink = async () => {
        try {
            setLoading(true)
            if (timer_drink.length === 0) {
                toast.error("Timer Minuman wajib diisi!");
                return
            }

            if (timer_drink === "0") {
                toast.error("Timer Makanan tidak boleh nol!");
                return
            }


            const res = await window.api.save_timer_drink(timer_drink);

            if (res.status) {
                toast.success("Berhasil disimpan");
                getTimer();
            }


        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getTimer();
    }, [])

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
                                    <Input type="number" value={timer_food} onChange={(e) => setTimerFood(e.target.value)} placeholder="Masukkan timer dalam menit..." />
                                    <small className="text-gray-400">Timer dalam menit</small>
                                </div>
                            </CardBody>
                            <CardFooter className="justify-end">
                                <Button onPress={handleSaveFood} isLoading={loading}>Simpan Perubahan</Button>
                            </CardFooter>
                        </Card>
                        <Card className="h-fit">
                            <CardHeader className="font-bold">Set Timer Minuman</CardHeader>
                            <CardBody>
                                <div className="grid gap-3">
                                    <Input type="number" value={timer_drink} onChange={(e) => setTimerDrink(e.target.value)} placeholder="Masukkan timer dalam menit..." />
                                    <small className="text-gray-400">Timer dalam menit</small>
                                </div>
                            </CardBody>
                            <CardFooter className="justify-end">
                                <Button onPress={handleSaveDrink} isLoading={loading}>Simpan Perubahan</Button>
                            </CardFooter>
                        </Card>
                    </div>
                    <AboutPage />
                </div>
            </div>
        </>
    )
}