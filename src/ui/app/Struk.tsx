import { useEffect, useState } from "react";
import { KitchenOrderType } from "../../electron/types";
import moment from "moment";

function StripDivider() {
    return <p className="text-xs !font-black">--------------------------------</p>
}

export default function StrukPage() {
    const [struk, setStruk] = useState<KitchenOrderType | null>(null);

    useEffect(() => {
        window.api.onPrintStruk((data: KitchenOrderType) => {
            console.log("data", data)
            setStruk(data)
        });

        return () => {
            window.api.removePrintStruk();
        }
    }, []);

    return (
        <>
            {
                struk ? <div className="w-[219px] !font-mono !font-black my-2">
                    <div>
                        <h3 className="text-lg text-center font-bold">KITCHEN ORDER</h3>
                        <p className="text-center">({struk.order_type === "TABLE" ? "Meja Billiard" : "Cafe"})</p>
                    </div>
                    <StripDivider />
                    <div className="text-xs !font-black grid gap-1 px-2">
                        <div className="flex justify-between">
                            <p>ID Order:</p>
                            <p className="text-end">{struk.order[0].id_order_cafe}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Tanggal:</p>
                            <p className="text-end">{moment(struk.order[0].created_at).format("DD-MM-YYYY HH:mm")}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Nama Kustomer:</p>
                            <p className="text-end">{struk.order[0].name}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Kasir:</p>
                            <p className="text-end">{struk.name_cashier}</p>
                        </div>
                        {
                            struk.order_type === "TABLE" ? <div className="flex justify-between">
                                <p>Nomor Billiard:</p>
                                <p className="text-end">{struk.no_billiard}</p>
                            </div> : <div className="flex justify-between">
                                <p>Nomor Meja:</p>
                                <p className="text-end">{struk.no_meja}</p>
                            </div>
                        }

                    </div>
                    <StripDivider />
                    <p className="text-sm !font-black text-center">*Menu Item*</p>
                    <div className="text-sm !font-black grid gap-2 py-2 px-2">
                        {
                            struk.order_type === "CAFE" ? (struk.order || []).map((el, i) => {
                                return <div className="flex justify-between" key={i}>
                                    <div className="flex flex-col">
                                        <p>{el.menucafe.name || "-"}</p>
                                    </div>
                                    <p className="text-end self-end">{el.qty || "0"}x</p>
                                </div>
                            }) : (struk.item || []).map((el, i) => {
                                return <div className="flex justify-between" key={i}>
                                    <div className="flex flex-col">
                                        <p>{el.name_menu || "-"}</p>
                                    </div>
                                    <p className="text-end self-end">{el.qty || "0"}x</p>
                                </div>
                            })
                        }
                    </div>
                    <StripDivider />
                </div>
                    : <></>
            }
        </>
    )
}