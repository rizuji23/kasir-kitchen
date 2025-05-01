import { Button, Card, CardBody, CardHeader, Chip, Divider, Spinner } from "@heroui/react";
import NavbarCustom from "../components/navbar";
import { useEffect, useState } from "react";
import { KitchenOrderType } from "../../electron/types";
import toast from "react-hot-toast";
import moment from "moment";
import DataTable, { TableColumn } from "react-data-table-component";

export function LoadingComponent() {
    return <div className="flex justify-center my-5">
        <Spinner />
    </div>
}

function TableOrder({ data }: { data: KitchenOrderType[] }) {
    const print_struk = async (data_kitchen: KitchenOrderType) => {
        try {
            await window.api.print_struk(data_kitchen);
        } catch (err) {
            toast.error(`Terjadi Kesalahan: ${err}`);
        }
    }

    const columns: TableColumn<KitchenOrderType>[] = [
        {
            name: "ID Order",
            selector: row => row.order[0].id_order_cafe,
            cell: row => <span className="font-bold">{row.order[0].id_order_cafe}</span>
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
            name: "Tanggal",
            selector: row => moment(row.created_at).format("DD/MM/YYYY HH:mm:ss"),
            wrap: true
        },
        {
            name: "Opsi",
            cell: row => <Button size="sm" color="success" onPress={() => print_struk(row)}>Print</Button>
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

    useEffect(() => {
        const get_all = async () => {
            try {
                const res = await window.api.history_list();

                if (res.status && res.data) {
                    console.log("res", res);
                    setAll(res.data.all);
                    setMinutes(res.data.one_minute);
                }
            } catch (err) {
                toast.error(`Terjadi kesalahan: ${err}`);
            }
        }

        get_all();
    }, []);

    return (
        <>
            <div>
                <NavbarCustom />
                <div className="my-5 grid gap-3 container mx-auto">
                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">History 1 Menit yang lalu</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <TableOrder data={minutes} />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">History Order</h3>
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