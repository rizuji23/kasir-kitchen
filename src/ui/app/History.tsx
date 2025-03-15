import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import NavbarCustom from "../components/navbar";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";

function TableOrder() {
    return (
        <>
            <Table removeWrapper>
                <TableHeader>
                    <TableColumn>ID Order</TableColumn>
                    <TableColumn>Nama Pelanggan</TableColumn>
                    <TableColumn>Tanggal</TableColumn>
                    <TableColumn>Opsi</TableColumn>
                </TableHeader>
                <TableBody>
                    <TableRow key="1">
                        <TableCell>Tony Reichert</TableCell>
                        <TableCell>CEO</TableCell>
                        <TableCell>Active</TableCell>
                        <TableCell>
                            <Button size="sm" color="success">Print</Button>
                        </TableCell>
                    </TableRow>

                </TableBody>
            </Table>
        </>
    )
}

export default function HistoryPage() {
    return (
        <>
            <div>
                <NavbarCustom />
                <div className="my-2 grid gap-3 container mx-auto">
                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">History 1 Menit yang lalu</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <TableOrder />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="font-bold">History Order</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody>

                        </CardBody>
                    </Card>
                </div>
            </div>
        </>
    )
}