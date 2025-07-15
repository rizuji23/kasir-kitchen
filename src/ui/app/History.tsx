import { Button, Card, CardBody, CardHeader, Chip, Divider, Spinner } from "@heroui/react";
import NavbarCustom from "../components/navbar";
import { useEffect, useState } from "react";
import { KitchenOrderType } from "../../electron/types";
import toast from "react-hot-toast";
import moment from "moment";
import DataTable, { TableColumn } from "react-data-table-component";
import { useWebSocket } from "../components/context/WebsocketContext";

export function LoadingComponent() {
    return <div className="flex justify-center my-5">
        <Spinner />
    </div>
}

export function TableOrder({ data }: { data: KitchenOrderType[] }) {
    const print_struk = async (data_kitchen: KitchenOrderType, type_status: "ACCEPT" | "REJECT" | "DONE" | "PRINT") => {
        try {
            await window.api.print_struk(data_kitchen, type_status);
        } catch (err) {
            toast.error(`Terjadi Kesalahan: ${err}`);
        }
    }

    const columns: TableColumn<KitchenOrderType>[] = [
        {
            name: "ID Order",
            selector: row => row.order[0]?.id_order_cafe || "-",
            cell: row => <span className="font-bold">{row.order[0]?.id_order_cafe || "-"}</span>
        },
        {
            name: "Nama Pelanggan",
            selector: row => row.order[0].name,
        },
        {
            name: "Nomor Meja",
            selector: row => row.order_type,
            cell: row => row.order_type === "TABLE" ? <Chip size="sm" color="success">{row.no_billiard}</Chip> : <Chip size="sm" color="primary">{row.no_meja}</Chip>
        },
        {
            name: "Tipe Order",
            selector: row => row.order_type,
            cell: row => row.order_type === "TABLE" ? <Chip size="sm" color="success">{row.order_type}</Chip> : <Chip size="sm" color="primary">{row.order_type}</Chip>
        },
        {
            name: "Keterangan",
            selector: row => row.order[0]?.keterangan || "-",
            cell: row => row.order[0]?.keterangan || "-"
        },
        {
            name: "Status",
            selector: row => row.status_kitchen || "-",
            cell: row => row.status_kitchen || "-"
        },
        {
            name: "Tanggal",
            selector: row => moment(row.created_at).format("DD/MM/YYYY HH:mm:ss"),
            wrap: true
        },
        {
            name: "Opsi",
            cell: row => <div className="flex gap-3">
                {
                    row.status_kitchen === "NO_PROCESSED" ? <>
                        <Button size="sm" color="primary" onPress={() => print_struk(row, "ACCEPT")}>Terima</Button>
                        <Button size="sm" color="danger" onPress={() => print_struk(row, "REJECT")}>Tolak</Button>
                    </> : row.status_kitchen === "PROCESSED" ? <Button size="sm" color="secondary" onPress={() => print_struk(row, "DONE")}>Selesai</Button> : <Button size="sm" color="success" onPress={() => print_struk(row, "PRINT")}>Print</Button>
                }

            </div>
        }
    ]

    return (
        <>
            <DataTable columns={columns} pagination data={data} noDataComponent={<h3 className="font-bold text-md p-6">Data Kosong</h3>} progressComponent={<LoadingComponent />} />
        </>
    )
}

export default function HistoryPage() {
    const [all, setAll] = useState<KitchenOrderType[]>([]);
    const [minutes, setMinutes] = useState<KitchenOrderType[]>([]);
    const { data_incoming } = useWebSocket();
    const [data_kitchen_incoming, setDataKitchenIncoming] = useState<KitchenOrderType[]>([]);

    useEffect(() => {
        const get_all = async () => {
            try {
                const res = await window.api.history_list();

                if (res.status && res.data) {
                    console.log("res", res);
                    setAll(res.data.all);
                    setMinutes(res.data.one_hours);
                }
            } catch (err) {
                toast.error(`Terjadi kesalahan: ${err}`);
            }
        }

        console.log("data_kitchen", data_incoming);

        if (data_incoming !== null) {
            const new_data_incoming = data_kitchen_incoming;
            new_data_incoming.push(data_incoming)

            setDataKitchenIncoming(new_data_incoming);
        }

        get_all();
    }, [data_incoming]);

    return (
        <>
            <div>
                <NavbarCustom />
                <div className="my-5 grid gap-3 container mx-auto px-5">
                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">Pesanan Masuk</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <TableOrder data={data_kitchen_incoming} />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">History 1 Jam yang lalu</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <TableOrder data={minutes} />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">History Order Semua</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <TableOrder data={all} />
                        </CardBody>
                    </Card>
                </div>
            </div>
        </>
    )
}