import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Chip } from "@heroui/react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";


export default function NavbarCustom() {
    const [localIp, setLocalIp] = useState<string>("");
    const pathname = useLocation()

    useEffect(() => {
        const local = window.api.get_local_network();
        setLocalIp(local);
    }, []);

    return <Navbar>
        <NavbarBrand>

            <p className="font-bold text-inherit">Dapur System</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <NavbarItem isActive={pathname.pathname === "/"}>
                <Link className="text-foreground" to="/">
                    Koneksi
                </Link>
            </NavbarItem>
            <NavbarItem isActive={pathname.pathname === "/history"}>
                <Link aria-current="page" to="/history">
                    Histori Order
                </Link>
            </NavbarItem>
            <NavbarItem isActive={pathname.pathname === "/settings"}>
                <Link className="text-foreground" to="/settings">
                    Pengaturan
                </Link>
            </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
            <NavbarItem>
                <Chip color="primary">{localIp}</Chip>
            </NavbarItem>
        </NavbarContent>
    </Navbar>
}