import { useQuery } from "@tanstack/react-query";
import { Row, Col, Card, Statistic, Table, Tag, Spin } from "antd";
import {
    ShoppingCartOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    SyncOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import { dashboardApi } from "../../api/dashboard";
import type { Booking } from "../../types";
import type { ColumnsType } from "antd/es/table";

const statusColors: Record<string, string> = {
    pending: "orange",
    approved: "blue",
    on_progress: "processing",
    completed: "green",
    canceled: "red",
};

const statusLabels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    on_progress: "On Progress",
    completed: "Completed",
    canceled: "Canceled",
};

export function Dashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: () => dashboardApi.getStatistics(),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    const stats = data?.data?.statistics;
    const recentBookings = data?.data?.recent_bookings || [];

    const columns: ColumnsType<Booking> = [
        {
            title: "Kode Booking",
            dataIndex: "booking_code",
            key: "booking_code",
            render: (code: string) => (
                <span className="font-mono font-semibold">{code}</span>
            ),
        },
        {
            title: "Customer",
            dataIndex: ["user", "name"],
            key: "customer",
        },
        {
            title: "Layanan",
            dataIndex: ["service", "name"],
            key: "service",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag
                    color={statusColors[status]}
                    icon={
                        status === "on_progress" ? (
                            <SyncOutlined spin />
                        ) : undefined
                    }
                >
                    {statusLabels[status]}
                </Tag>
            ),
        },
        {
            title: "Total",
            dataIndex: "total_price",
            key: "total_price",
            render: (price: number) => `Rp ${price?.toLocaleString("id-ID")}`,
        },
    ];

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-6 flex-shrink-0">Dashboard</h1>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6 flex-shrink-0">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <Statistic
                            title="Total Order"
                            value={stats?.total_orders || 0}
                            prefix={
                                <ShoppingCartOutlined className="text-blue-500" />
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <Statistic
                            title="Pending"
                            value={stats?.pending_orders || 0}
                            prefix={
                                <ClockCircleOutlined className="text-orange-500" />
                            }
                            valueStyle={{ color: "#f97316" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <Statistic
                            title="Selesai"
                            value={stats?.completed_orders || 0}
                            prefix={
                                <CheckCircleOutlined className="text-green-500" />
                            }
                            valueStyle={{ color: "#22c55e" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <Statistic
                            title="Total Revenue"
                            value={stats?.total_revenue || 0}
                            prefix={
                                <DollarOutlined className="text-emerald-500" />
                            }
                            formatter={(value) =>
                                `Rp ${Number(value).toLocaleString("id-ID")}`
                            }
                            valueStyle={{ color: "#10b981" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Additional Stats Row */}
            <Row gutter={[16, 16]} className="mb-6 flex-shrink-0">
                <Col xs={24} sm={8}>
                    <Card size="small" className="text-center">
                        <Statistic
                            title="Hari Ini"
                            value={stats?.today_orders || 0}
                            valueStyle={{ color: "#3b82f6" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small" className="text-center">
                        <Statistic
                            title="On Progress"
                            value={stats?.on_progress_orders || 0}
                            prefix={<SyncOutlined spin />}
                            valueStyle={{ color: "#8b5cf6" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small" className="text-center">
                        <Statistic
                            title="Dibatalkan"
                            value={stats?.canceled_orders || 0}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: "#ef4444" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Recent Bookings Table */}
            <Card 
                title="Booking Terbaru" 
                className="shadow-md flex-1 flex flex-col overflow-hidden"
                bodyStyle={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    padding: 0,
                    overflow: 'hidden',
                }}
            >
                <div className="p-6 flex-1 overflow-auto">
                    <Table
                        columns={columns}
                        dataSource={recentBookings}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        scroll={{ y: 'calc(100vh - 450px)' }}
                    />
                </div>
            </Card>
        </div>
    );
}
