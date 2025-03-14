import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Chip } from "@heroui/react";
import { Link } from "react-router";


export default function NavbarCustom() {
    return <Navbar>
        <NavbarBrand>

            <p className="font-bold text-inherit">Dapur System</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem>
                <Link className="text-foreground" to="/">
                    Koneksi
                </Link>
            </NavbarItem>
            <NavbarItem isActive>
                <Link aria-current="page" to="/history">
                    Histori Order
                </Link>
            </NavbarItem>
            <NavbarItem>
                <Link className="text-foreground" to="/settings">
                    Pengaturan
                </Link>
            </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
            <NavbarItem>
                <Chip color="primary">192.168.18.2</Chip>
            </NavbarItem>
        </NavbarContent>
    </Navbar>
}