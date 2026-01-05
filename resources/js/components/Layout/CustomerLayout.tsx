import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Avatar, Dropdown, theme } from "antd";
import {
    HomeOutlined,
    AppstoreOutlined,
    FileTextOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import type { MenuProps } from "antd";

const { Header, Content, Footer } = Layout;

export function CustomerLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const menuItems = [
        {
            key: "/customer",
            icon: <HomeOutlined />,
            label: "Beranda",
        },
        {
            key: "/customer/services",
            icon: <AppstoreOutlined />,
            label: "Layanan",
        },
        {
            key: "/customer/bookings",
            icon: <FileTextOutlined />,
            label: "Pesanan Saya",
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
            label: "Profil",
            onClick: () => navigate("/customer/profile"),
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
        <Layout className="min-h-screen" style={{ overflow: 'auto' }}>
            <Header
                className="flex items-center justify-between px-6 sticky top-0 z-50"
                style={{
                    background:
                        "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)",
                }}
            >
                <div className="flex items-center gap-8 flex-1 min-w-0">
                    <h1 className="text-white font-bold text-xl m-0 flex-shrink-0">
                        CleanService
                    </h1>
                    <div className="flex items-center gap-4 flex-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.key;
                            return (
                                <div
                                    key={item.key}
                                    onClick={() =>
                                        handleMenuClick({ key: item.key })
                                    }
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded cursor-pointer transition-colors
                                        ${
                                            isActive
                                                ? "bg-blue-400 text-white"
                                                : "text-white hover:bg-blue-700"
                                        }
                                    `}
                                    style={{ lineHeight: "normal" }}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Dropdown
                    menu={{ items: dropdownItems }}
                    placement="bottomRight"
                >
                    <Avatar
                        className="cursor-pointer bg-white text-blue-600"
                        icon={<UserOutlined />}
                    />
                </Dropdown>
            </Header>
            <Content className="p-6" style={{ background: "#f5f5f5", overflowY: 'auto' }}>
                <div
                    className="max-w-7xl mx-auto p-6 rounded-lg shadow-sm"
                    style={{ background: colorBgContainer }}
                >
                    <Outlet />
                </div>
            </Content>
            <Footer className="text-center bg-gray-100">
                CleanService ©{new Date().getFullYear()} - Layanan Kebersihan
                Profesional
            </Footer>
        </Layout>
    );
}
