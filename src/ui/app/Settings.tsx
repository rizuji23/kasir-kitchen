import NavbarCustom from "../components/navbar";
import PrinterApi from "./section/PrinterApi";

export default function SettingsPage() {
    return (
        <>
            <div>
                <NavbarCustom />
                <div className="my-2 container mx-auto">
                    <PrinterApi />
                </div>
            </div>
        </>
    )
}