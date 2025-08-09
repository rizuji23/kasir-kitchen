import { Badge, Button, Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import NavbarCustom from "../components/navbar";
import { SetStateAction, useEffect, useState } from "react";
import { KitchenOrderType } from "../../electron/types";
import toast from "react-hot-toast";
import { useWebSocket } from "../components/context/WebsocketContext";
import DataTable, { TableColumn } from "react-data-table-component";
import moment from "moment";
import { LoadingComponent } from "./History";
import PesananTimer from "./PesananTimer";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon } from "lucide-react";
import { formatDateTime, getStatusBadge } from "../lib/utils";
import TableMenu from "./TableMenu";


export function TableOrder({ data, api, setOpen }: { data: KitchenOrderType[], api: () => Promise<void>, setOpen: React.Dispatch<SetStateAction<{ open: boolean, row: KitchenOrderType | null }>> }) {
    const [loading, setLoading] = useState<boolean>(false);
    const print_struk = async (data_kitchen: KitchenOrderType, type_status: "ACCEPT" | "REJECT" | "DONE" | "PRINT") => {
        if (confirm("Apakah anda yakin?")) {
            setLoading(true);
            try {
                await window.api.print_struk(data_kitchen, type_status);
                await api();
            } catch (err) {
                toast.error(`Terjadi Kesalahan: ${err}`);
            } finally {
                setLoading(false)
            }
        }
    }

    const columns: TableColumn<KitchenOrderType>[] = [
        {
            name: "ID Order",
            selector: row => row.order[0]?.id_order_cafe || "-",
            cell: row => <span className="font-bold text-blue-500 underline cursor-pointer" onClick={() => setOpen({ open: true, row: row })}>{row.order[0]?.id_order_cafe || "-"}</span>
        },
        {
            name: "Nama Pelanggan",
            selector: row => row.order[0]?.name || "-",
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
            name: "Kasir",
            selector: row => row.name_cashier,
            cell: row => row.name_cashier
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
                        <Button size="sm" color="primary" onPress={() => print_struk(row, "ACCEPT")} isLoading={loading}>Terima</Button>
                        <Button size="sm" color="danger" onPress={() => print_struk(row, "REJECT")} isLoading={loading}>Tolak</Button>
                    </> : row.status_kitchen === "PROCESSED" ? <Button size="sm" color="secondary" onPress={() => print_struk(row, "DONE")} isLoading={loading}>Selesai</Button> : <Button size="sm" color="success" onPress={() => print_struk(row, "PRINT")} isLoading={loading}>Print</Button>
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
    const [open, setOpen] = useState<{ open: boolean, row: KitchenOrderType | null }>({
        open: false,
        row: null
    })

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
    }, [data_incoming]);

    useEffect(() => {
        console.log(open)
    }, [open]);

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
                            <TableOrder data={new_order} api={get_api} setOpen={setOpen} />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">Pesanan Sedang Diproses</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <TableOrder data={on_progress} api={get_api} setOpen={setOpen} />
                        </CardBody>
                    </Card>
                </div>
            </div>

            <Modal size="3xl" isOpen={open.open} onOpenChange={(e) => setOpen({
                open: e,
                row: null
            })} scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Detail Pesanan ({open.row?.order[0]?.id_order_cafe})</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Card>
                                            <CardBody className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Kasir</span>
                                                </div>
                                                <p className="text-sm">{open.row?.name_cashier}</p>
                                            </CardBody>
                                        </Card>

                                        <Card>
                                            <CardBody className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Meja</span>
                                                </div>
                                                <p className="text-sm">Meja {open.row?.no_meja}</p>
                                                {open.row?.no_billiard && <p className="text-xs text-muted-foreground">{open.row?.no_billiard}</p>}
                                            </CardBody>
                                        </Card>

                                        <Card>
                                            <CardBody className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Status Dapur</span>
                                                </div>
                                                <Badge color={getStatusBadge(open.row?.status_kitchen as unknown as string).variant}>
                                                    {getStatusBadge(open.row?.status_kitchen as unknown as string).label}
                                                </Badge>
                                            </CardBody>
                                        </Card>

                                        <Card>
                                            <CardBody className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Waktu Pesan</span>
                                                </div>
                                                <p className="text-xs">{formatDateTime(open.row?.created_at as unknown as string)}</p>
                                            </CardBody>
                                        </Card>
                                    </div>

                                    <TableMenu data={open.row} />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardBody className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>IP Address:</span>
                                                    <span className="font-mono">{open.row?.ip}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Tipe Pesanan:</span>
                                                    <Badge variant="solid">{open.row?.order_type}</Badge>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Status Timer:</span>
                                                    <Badge color={getStatusBadge(open.row?.status_timer as unknown as string).variant}>
                                                        {getStatusBadge(open.row?.status_timer as unknown as string).label}
                                                    </Badge>
                                                </div>
                                            </CardBody>
                                        </Card>

                                        <Card>
                                            <CardBody className="space-y-2">
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Dibuat:</span>
                                                    <p className="font-medium">{formatDateTime(open.row?.created_at as unknown as string)}</p>
                                                </div>
                                                {open.row?.start_timer && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">Timer Mulai:</span>
                                                        <p className="font-medium">{formatDateTime(open.row?.start_timer)}</p>
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Tutup
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}