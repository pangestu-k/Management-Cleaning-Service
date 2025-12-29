import { useQuery } from "@tanstack/react-query";
import { Table, Tag, Card, Empty, Spin, Button } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { bookingsApi } from "../../api/bookings";
import type { Booking } from "../../types";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
    pending: "orange",
    approved: "blue",
    on_progress: "processing",
    completed: "green",
    canceled: "red",
};

const statusLabels: Record<string, string> = {
    pending: "Menunggu",
    approved: "Disetujui",
    on_progress: "Sedang Dikerjakan",
    completed: "Selesai",
    canceled: "Dibatalkan",
};

export function MyBookings() {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["customer-bookings"],
        queryFn: () => bookingsApi.customer.getAll(),
    });

    const columns: ColumnsType<Booking> = [
        {
            title: "Kode Booking",
            dataIndex: "booking_code",
            key: "booking_code",
            render: (code: string) => (
                <span className="font-mono font-semibold text-blue-600">
                    {code}
                </span>
            ),
        },
        {
            title: "Layanan",
            dataIndex: ["service", "name"],
            key: "service",
        },
        {
            title: "Jadwal",
            key: "schedule",
            render: (_, record) => (
                <span>
                    {dayjs(record.schedule?.date).format("DD MMM YYYY")}
                    <br />
                    <span className="text-gray-500 text-sm">
                        {record.schedule?.start_time} -{" "}
                        {record.schedule?.end_time}
                    </span>
                </span>
            ),
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
            render: (price: number) => (
                <span className="font-semibold text-green-600">
                    Rp {price?.toLocaleString("id-ID")}
                </span>
            ),
        },
        {
            title: "Tanggal Order",
            dataIndex: "created_at",
            key: "created_at",
            render: (date: string) => dayjs(date).format("DD MMM YYYY HH:mm"),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    const bookings = data?.data?.data || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Pesanan Saya</h1>
                <Button
                    type="primary"
                    onClick={() => navigate("/customer/services")}
                >
                    Buat Pesanan Baru
                </Button>
            </div>

            {bookings.length === 0 ? (
                <Card>
                    <Empty
                        description="Belum ada pesanan"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button
                            type="primary"
                            onClick={() => navigate("/customer/services")}
                        >
                            Booking Sekarang
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <Table
                    columns={columns}
                    dataSource={bookings}
                    rowKey="id"
                    pagination={{
                        total: data?.data?.total,
                        pageSize: data?.data?.per_page,
                    }}
                />
            )}
        </div>
    );
}
