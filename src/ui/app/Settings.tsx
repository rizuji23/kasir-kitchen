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
                    <AboutPage />
                </div>
            </div>
        </>
    )
}