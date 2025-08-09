import { Badge, Button, Card, CardBody, CardHeader, Chip, Divider, Input, Spinner } from "@heroui/react";
import NavbarCustom from "../components/navbar";
import { SetStateAction, useEffect, useState } from "react";
import { KitchenOrderType } from "../../electron/types";
import toast from "react-hot-toast";
import moment from "moment";
import DataTable, { TableColumn } from "react-data-table-component";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon } from "lucide-react";
import { formatDateTime, getStatusBadge } from "../lib/utils";
import TableMenu from "./TableMenu";


export function LoadingComponent() {
    return <div className="flex justify-center my-5">
        <Spinner />
    </div>
}

export function TableOrder({ data, api, setOpen, loading = false }: { data: KitchenOrderType[], loading?: boolean, api: () => Promise<void>, setOpen: React.Dispatch<SetStateAction<{ open: boolean, row: KitchenOrderType | null }>> }) {
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
            cell: row => <span className="font-bold text-blue-500 underline cursor-pointer" onClick={() => setOpen({ open: true, row: row })}>{row.order[0]?.id_order_cafe || "-"}</span>
        },
        {
            name: "Nama Pelanggan",
            selector: row => row.order[0]?.name,
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
            cell: row => <Chip size="sm">{row.status_kitchen || "-"}</Chip>
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
            <DataTable columns={columns} pagination progressPending={loading} data={data} noDataComponent={<h3 className="font-bold text-md p-6">Data Kosong</h3>} progressComponent={<LoadingComponent />} />
        </>
    )
}

export default function HistoryPage() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [all, setAll] = useState<KitchenOrderType[]>([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [open, setOpen] = useState<{ open: boolean, row: KitchenOrderType | null }>({
        open: false,
        row: null
    })

    const [export_type, setExportType] = useState<"today" | "weekly" | "monthly" | "annual" | "custom">("today");
    const [date_range, setDateRange] = useState<{ start_date: string, end_date: string }>({
        start_date: "",
        end_date: ""
    });

    const [loading_export, setLoadingExport] = useState<boolean>(false);

    const handleExport = async () => {
        setLoadingExport(true);
        try {
            const res = await window.api.exportExcel({ type_export: export_type, start_date: date_range.start_date, end_date: date_range.end_date });

            if (res.code === 201) {
                toast.success("Export berhasil dilakukan");
            } else {
                toast.error(res.detail_message);
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        } finally {
            setLoadingExport(false)
        }
    }

    const [loading, setLoading] = useState<boolean>(true)

    const get_all = async () => {
        setLoading(true)
        try {
            const res = await window.api.history_list();

            if (res.status && res.data) {
                console.log("res", res);
                setAll(res.data.all);
            }
        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        get_all();
    }, []);

    const filteredData = all.filter(item => {
        if (!searchQuery) return true;

        const searchTerm = searchQuery.toLowerCase();
        return (
            item.order[0]?.id_order_cafe?.toLowerCase().includes(searchTerm) ||
            item.order[0]?.name?.toLowerCase().includes(searchTerm)
        );
    });

    return (
        <>
            <div>
                <NavbarCustom />
                <div className="my-5 grid gap-3 container mx-auto px-5">
                    {/* <Card>
                        <CardHeader>
                            <h3 className="font-bold">History 1 Jam yang lalu</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <TableOrder data={minutes} api={get_all} />
                        </CardBody>
                    </Card> */}

                    <Card>
                        <CardHeader className="!block">
                            <div className="flex justify-between">
                                <h3 className="font-bold self-center">History Order</h3>
                                <div className="flex gap-3">
                                    <Button className="w-full" color="secondary" onPress={onOpen}>Export Data</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <div className="flex justify-end">
                                <Input className="max-w-[300px]" onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari ID Order atau Nama Pelanggan...." />
                            </div>
                            <TableOrder data={filteredData} setOpen={setOpen} api={get_all} loading={loading} />
                        </CardBody>
                    </Card>
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Export Data Order</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-5">
                                    <Select label="Pilih filter export" isRequired selectedKeys={[export_type]} onChange={(e) => setExportType(e.target.value as unknown as "today" | "weekly" | "monthly" | "annual" | "custom")}>
                                        <SelectItem key={"today"}>Hari Ini</SelectItem>
                                        <SelectItem key={"weekly"}>Minggu Ini</SelectItem>
                                        <SelectItem key={"monthly"}>Bulan Ini</SelectItem>
                                        <SelectItem key={"annual"}>Tahun Ini</SelectItem>
                                        <SelectItem key={"custom"}>Custom</SelectItem>
                                    </Select>
                                    {
                                        export_type === "custom" && <div className="grid grid-cols-2 gap-5">
                                            <div className="flex flex-col gap-2 text-gray-500">
                                                <label className="text-sm">Dari Tanggal</label>
                                                <Input onChange={(e) => setDateRange((prevState) => ({
                                                    ...prevState,
                                                    start_date: e.target.value
                                                }))} value={date_range.start_date} placeholder="Dari Tanggal" type="date" />
                                            </div>
                                            <div className="flex flex-col gap-2 text-gray-500">
                                                <label className="text-sm">Sampai Tanggal</label>
                                                <Input onChange={(e) => setDateRange((prevState) => ({
                                                    ...prevState,
                                                    end_date: e.target.value
                                                }))} value={date_range.end_date} placeholder="Sampai Tanggal" type="date" />
                                            </div>
                                        </div>
                                    }
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Tutup
                                </Button>
                                <Button color="primary" onPress={handleExport} isLoading={loading_export}>
                                    Export
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

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