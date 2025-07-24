import { Badge, Card, CardBody, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { KitchenOrderType } from "../../electron/types";
import { formatCurrency } from "../lib/utils";


export default function TableMenu({ data }: { data: KitchenOrderType | null }) {
    return <Card>
        <CardBody>
            <Table>
                <TableHeader>
                    <TableColumn>Menu</TableColumn>
                    <TableColumn>Kategori</TableColumn>
                    <TableColumn className="text-center">Qty</TableColumn>
                    <TableColumn className="text-right">Harga</TableColumn>
                    <TableColumn className="text-right">Subtotal</TableColumn>
                    <TableColumn>Keterangan</TableColumn>
                </TableHeader>
                <TableBody>
                    {(data?.order || []).map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div>
                                    <p className="font-medium">{item.menucafe.name}</p>
                                    <p className="text-xs text-muted-foreground">Order ID: {item.id_order_cafe}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="solid">{item.menucafe.category_name}</Badge>
                            </TableCell>
                            <TableCell className="text-center">{item.qty}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.menucafe.price)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                            <TableCell>
                                {item.keterangan && (
                                    <p className="text-xs text-muted-foreground max-w-32" title={item.keterangan}>
                                        {item.keterangan}
                                    </p>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardBody>
    </Card>
}