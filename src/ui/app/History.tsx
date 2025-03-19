import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import NavbarCustom from "../components/navbar";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { useEffect, useState } from "react";
import { KitchenOrderType } from "../../electron/types";
import toast from "react-hot-toast";
import moment from "moment";

function TableOrder({ data }: { data: KitchenOrderType[] }) {
    const print_struk = async (data_kitchen: KitchenOrderType) => {
        try {
            await window.api.print_struk(data_kitchen);
        } catch (err) {
            toast.error(`Terjadi Kesalahan: ${err}`);
        }
    }

    return (
        <>
            <Table removeWrapper>
                <TableHeader>
                    <TableColumn>ID Order</TableColumn>
                    <TableColumn>Nama Pelanggan</TableColumn>
                    <TableColumn>Nomor Meja</TableColumn>
                    <TableColumn>Tanggal</TableColumn>
                    <TableColumn>Opsi</TableColumn>
                </TableHeader>
                <TableBody>
                    {
                        data.map((el, i) => {
                            return <TableRow key={i}>
                                <TableCell>{el.order[0].id_order_cafe}</TableCell>
                                <TableCell>{el.order[0].name}</TableCell>
                                <TableCell>{el.order_type === "TABLE" ? el.no_billiard : el.no_meja}</TableCell>
                                <TableCell>{moment(el.created_at).format("DD/MM/YYYY HH:mm:ss")}</TableCell>
                                <TableCell>
                                    <Button size="sm" color="success" onPress={() => print_struk(el)}>Print</Button>
                                </TableCell>
                            </TableRow>
                        })
                    }

                </TableBody>
            </Table>
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