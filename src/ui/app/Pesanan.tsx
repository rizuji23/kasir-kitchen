import { Button, Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import NavbarCustom from "../components/navbar";
import { useEffect, useState } from "react";
import { KitchenOrderType } from "../../electron/types";
import toast from "react-hot-toast";
import { useWebSocket } from "../components/context/WebsocketContext";
import DataTable, { TableColumn } from "react-data-table-component";
import moment from "moment";
import { LoadingComponent } from "./History";
import PesananTimer from "./PesananTimer";

export function TableOrder({ data, api }: { data: KitchenOrderType[], api: () => Promise<void> }) {
    const print_struk = async (data_kitchen: KitchenOrderType, type_status: "ACCEPT" | "REJECT" | "DONE" | "PRINT") => {
        try {
            await window.api.print_struk(data_kitchen, type_status);
            await api();
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
            name: "Timer",
            cell: row => <>
                {
                    row.status_timer === "NO_STARTED" ? <Chip>Belum Dimulai</Chip> : <>
                        <PesananTimer data={row} />
                    </>
                }
            </>
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

export default function PesananPage() {
    const [new_order, setNewOrder] = useState<KitchenOrderType[]>([]);
    const [on_progress, setOnProgress] = useState<KitchenOrderType[]>([]);

    const { data_incoming } = useWebSocket();

    const get_api = async () => {
        try {
            const res = await window.api.order_list();

            if (res.status && res.data) {
                console.log("res", res);
                setNewOrder(res.data.new_order);
                setOnProgress(res.data.on_progress);
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        }
    }

    useEffect(() => {
        get_api();
    }, [data_incoming])

    return (
        <>
            <div>
                <NavbarCustom />
                <div className="my-5 grid gap-5 container mx-auto px-5">
                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">Pesanan Masuk</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <TableOrder data={new_order} api={get_api} />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">Pesanan Sedang Diproses</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <TableOrder data={on_progress} api={get_api} />
                        </CardBody>
                    </Card>
                </div>
            </div>
        </>
    )
}