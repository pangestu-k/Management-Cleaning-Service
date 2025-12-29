import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Avatar, Dropdown, theme } from "antd";
import {
    DashboardOutlined,
    ToolOutlined,
    TeamOutlined,
    CalendarOutlined,
    FileTextOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;

const menuItems = [
    {
        key: "/admin",
        icon: <DashboardOutlined />,
        label: "Dashboard",
    },
    {
        key: "/admin/services",
        icon: <ToolOutlined />,
        label: "Layanan",
    },
    {
        key: "/admin/cleaners",
        icon: <TeamOutlined />,
        label: "Cleaner",
    },
    {
        key: "/admin/schedules",
        icon: <CalendarOutlined />,
        label: "Jadwal",
    },
    {
        key: "/admin/bookings",
        icon: <FileTextOutlined />,
        label: "Booking",
    },
];

export function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

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
        <Layout className="h-screen overflow-hidden">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="!bg-gradient-to-b !from-blue-900 !to-blue-800"
                style={{ 
                    height: '100vh',
                    overflow: 'auto',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div className="h-16 flex items-center justify-center border-b border-blue-700">
                    <h1
                        className={`text-white font-bold transition-all ${
                            collapsed ? "text-sm" : "text-xl"
                        }`}
                    >
                        {collapsed ? "CS" : "CleanService"}
                    </h1>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    className="!bg-transparent !border-0"
                />
            </Sider>
            <Layout 
                className="flex-1"
                style={{ 
                    marginLeft: collapsed ? 80 : 200,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Header
                    className="flex items-center justify-between px-6 !h-16 flex-shrink-0"
                    style={{ background: colorBgContainer }}
                >
                    <Button
                        type="text"
                        icon={
                            collapsed ? (
                                <MenuUnfoldOutlined />
                            ) : (
                                <MenuFoldOutlined />
                            )
                        }
                        onClick={() => setCollapsed(!collapsed)}
                    />
                    <Dropdown
                        menu={{ items: dropdownItems }}
                        placement="bottomRight"
                    >
                        <Avatar
                            className="cursor-pointer bg-blue-500"
                            icon={<UserOutlined />}
                        />
                    </Dropdown>
                </Header>
                <Content
                    className="p-6 flex-1 overflow-auto"
                    style={{
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
