import { Button, Card, CardBody, CardHeader, Divider, Input, Select, SelectItem, useDisclosure } from "@heroui/react";
import NavbarCustom from "../components/navbar";
import { useEffect, useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { ArrowUpDown, FileSpreadsheet, ListFilter } from "lucide-react";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import toast from "react-hot-toast";

export default function Analisis() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [export_type, setExportType] = useState<"today" | "weekly" | "monthly" | "annual" | "custom">("today");
    const [date_range, setDateRange] = useState<{ start_date: string, end_date: string }>({
        start_date: "",
        end_date: ""
    });

    const [menu, setMenu] = useState<{
        makanan: {
            name_menu: string;
            sum: number;
        }[];
        minuman: {
            name_menu: string;
            sum: number;
        }[];
    }>({
        makanan: [],
        minuman: [],
    });


    const [filteredMenu, setFilteredMenu] = useState<{
        makanan: {
            name_menu: string;
            sum: number;
        }[];
        minuman: {
            name_menu: string;
            sum: number;
        }[];
    }>({
        makanan: [],
        minuman: [],
    });

    const [searchTermMakanan, setSearchTermMakanan] = useState("");
    const [searchTermMinuman, setSearchTermMinuman] = useState("");

    const [sort, setSort] = useState<"most" | "least">("most");

    const handleGetBestSeller = async (is_filter = false) => {
        const res = await window.api.best_seller({ type_export: export_type, start_date: date_range.start_date, end_date: date_range.end_date, sort: sort });
        console.log("res", res)
        if (is_filter) {
            onOpenChange();
            if (res) {
                toast.success("Data berhasil difilter");
            } else {
                toast.error("Data kosong");
            }
        }

        setMenu(res);
        setFilteredMenu(res); // Initialize filteredMenu with all data
    };

    useEffect(() => {
        handleGetBestSeller();
    }, [sort]);

    useEffect(() => {
        if (searchTermMakanan.trim() === "") {
            setFilteredMenu(menu);
        } else {
            const filtered = menu.makanan.filter(item =>
                item.name_menu.toLowerCase().includes(searchTermMakanan.toLowerCase())
            );
            setFilteredMenu((prevState) => ({
                ...prevState,
                makanan: filtered
            }));
        }
    }, [searchTermMakanan, menu]);

    useEffect(() => {
        if (searchTermMinuman.trim() === "") {
            setFilteredMenu(menu);
        } else {
            const filtered = menu.minuman.filter(item =>
                item.name_menu.toLowerCase().includes(searchTermMinuman.toLowerCase())
            );
            setFilteredMenu((prevState) => ({
                ...prevState,
                minuman: filtered
            }));
        }
    }, [searchTermMinuman, menu]);

    const [loading_export, setLoadingExport] = useState<boolean>(false);

    const handleExport = async () => {
        setLoadingExport(true);
        try {
            const res = await window.api.best_seller_excel({ type_export: export_type, start_date: date_range.start_date, end_date: date_range.end_date, sort: sort });

            if (res.success) {
                toast.success("Export berhasil dilakukan");
            } else {
                toast.error("Terjadi kesalahan saat export excel");
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan: ${err}`);
        } finally {
            setLoadingExport(false)
        }
    }

    return (
        <>
            <div>
                <NavbarCustom />

                <div className="my-5 grid container mx-auto px-5 gap-5">
                    <Card>
                        <CardBody>
                            <div className="flex justify-between">
                                <div className="self-center">
                                    <h3 className="font-bold">Filter Data Kitchen</h3>
                                </div>
                                <div className="flex justify-end gap-3">
                                    {
                                        filteredMenu.makanan.length !== 0 || filteredMenu.minuman.length !== 0 ? <div>
                                            <Button isLoading={loading_export} onPress={() => handleExport()}><FileSpreadsheet className="w-4 h-4" /> Export Data Excel</Button>
                                        </div> : <></>
                                    }
                                    <div>
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <Button><ArrowUpDown className="w-4 h-4" /> Sort</Button>
                                            </DropdownTrigger>
                                            <DropdownMenu>
                                                <DropdownItem key="most" onPress={() => setSort("most")}>Terbayak</DropdownItem>
                                                <DropdownItem key="least" onPress={() => setSort("least")}>Tersedikit</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>

                                    <div>
                                        <Button className="w-full" color="secondary" onPress={onOpen}><ListFilter className="w-4 h-4" /> Filter Data</Button>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <div className="grid grid-cols-2 gap-5">
                        <Card>
                            <CardHeader className="!block">
                                <h3 className="font-bold self-center">Menu Terjual Makanan</h3>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <div className="grid gap-5">
                                    <div className="flex justify-end">
                                        <Input
                                            className="max-w-[300px]"
                                            placeholder="Cari Nama Menu...."
                                            value={searchTermMakanan}
                                            onChange={(e) => setSearchTermMakanan(e.target.value)}
                                        />
                                    </div>

                                    {
                                        filteredMenu.makanan.length === 0 ? <><div className="text-center my-10">
                                            <p>Data Kosong</p>
                                        </div></> : <Table aria-label="Example static collection table" removeWrapper>
                                            <TableHeader>
                                                <TableColumn>Menu Makanan</TableColumn>
                                                <TableColumn>Terjual</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {
                                                    filteredMenu.makanan.map((el, i) => {
                                                        return <TableRow key={i}>
                                                            <TableCell>{el.name_menu}</TableCell>
                                                            <TableCell>{el.sum}</TableCell>
                                                        </TableRow>
                                                    })
                                                }
                                            </TableBody>
                                        </Table>
                                    }
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardHeader className="!block">
                                <h3 className="font-bold self-center">Menu Terjual Minuman</h3>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <div className="grid gap-5">
                                    <div className="flex justify-end">
                                        <Input
                                            className="max-w-[300px]"
                                            placeholder="Cari Nama Menu...."
                                            value={searchTermMinuman}
                                            onChange={(e) => setSearchTermMinuman(e.target.value)}
                                        />
                                    </div>

                                    {
                                        filteredMenu.minuman.length === 0 ? <><div className="text-center my-10">
                                            <p>Data Kosong</p>
                                        </div></> : <Table aria-label="Example static collection table" removeWrapper>
                                            <TableHeader>
                                                <TableColumn>Menu Makanan</TableColumn>
                                                <TableColumn>Terjual</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {
                                                    filteredMenu.minuman.map((el, i) => {
                                                        return <TableRow key={i}>
                                                            <TableCell>{el.name_menu}</TableCell>
                                                            <TableCell>{el.sum}</TableCell>
                                                        </TableRow>
                                                    })
                                                }
                                            </TableBody>
                                        </Table>
                                    }
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Filter Menu Terjual</ModalHeader>
                            <ModalBody>
                                <div className="grid gap-5">
                                    <Select label="Pilih filter export" isRequired selectedKeys={[export_type]} onChange={(e) => setExportType(e.target.value as unknown as "today" | "weekly" | "monthly" | "annual" | "custom")}>
                                        <SelectItem key={"today"}>Hari Ini</SelectItem>
                                        <SelectItem key={"yesterday"}>Kemarin</SelectItem>
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
                                <Button color="primary" onPress={() => handleGetBestSeller(true)}>
                                    Filter
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}