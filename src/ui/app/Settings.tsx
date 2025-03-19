import NavbarCustom from "../components/navbar";
import PrinterApi from "./section/PrinterApi";
import UpdatePage from "./section/Update";

export default function SettingsPage() {
    return (
        <>
            <div>
                <NavbarCustom />
                <div className="my-2 container mx-auto grid gap-3">
                    <PrinterApi />
                    <UpdatePage />
                </div>
            </div>
        </>
    )
}