import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, theme } from "antd";
import {
    CalendarOutlined,
    FileTextOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import type { MenuProps } from "antd";

const { Header, Content, Footer } = Layout;

export function CleanerLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const menuItems = [
        {
            key: "/cleaner",
            icon: <CalendarOutlined />,
            label: "Jadwal Saya",
        },
        {
            key: "/cleaner/bookings",
            icon: <FileTextOutlined />,
            label: "Tugas",
        },
    ];

    const handleMenuClick = (e: { key: string }) => {
        navigate(e.key);
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const dropdownItems: MenuProps["items"] = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: user?.name,
            disabled: true,
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
            onClick: handleLogout,
        },
    ];

    return (
        <Layout className="min-h-screen">
            <Header
                className="flex items-center justify-between px-6 sticky top-0 z-50"
                style={{
                    background:
                        "linear-gradient(90deg, #065f46 0%, #10b981 100%)",
                }}
            >
                <div className="flex items-center gap-8">
                    <h1 className="text-white font-bold text-xl m-0">
                        CleanService - Cleaner
                    </h1>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={handleMenuClick}
                        className="!bg-transparent !border-none"
                        theme="dark"
                    />
                </div>
                <Dropdown
                    menu={{ items: dropdownItems }}
                    placement="bottomRight"
                >
                    <Avatar
                        className="cursor-pointer bg-white text-green-600"
                        icon={<UserOutlined />}
                    />
                </Dropdown>
            </Header>
            <Content className="p-6" style={{ background: "#f5f5f5" }}>
                <div
                    className="max-w-5xl mx-auto p-6 rounded-lg shadow-sm"
                    style={{ background: colorBgContainer }}
                >
                    <Outlet />
                </div>
            </Content>
            <Footer className="text-center bg-gray-100">
                CleanService ©{new Date().getFullYear()} - Portal Cleaner
            </Footer>
        </Layout>
    );
}
