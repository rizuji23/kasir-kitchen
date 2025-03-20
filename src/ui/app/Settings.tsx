import NavbarCustom from "../components/navbar";
import AboutPage from "./section/About";
import PrinterApi from "./section/PrinterApi";

export default function SettingsPage() {
    return (
        <>
            <div>
                <NavbarCustom />
                <div className="my-2 container mx-auto grid gap-3">
                    <PrinterApi />
                    <AboutPage />
                </div>
            </div>
        </>
    )
}