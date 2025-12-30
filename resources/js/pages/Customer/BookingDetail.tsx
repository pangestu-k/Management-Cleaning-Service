import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    Descriptions,
    Tag,
    Button,
    Spin,
    Empty,
    Space,
    Divider,
} from "antd";
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    UserOutlined,
    ToolOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import { bookingsApi } from "../../api/bookings";
import { formatCurrency } from "../../utils/format";
import dayjs from "dayjs";

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

export function BookingDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery({
        queryKey: ["customer-booking", id],
        queryFn: () => bookingsApi.customer.getById(Number(id)),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (error || !data?.data) {
        return (
            <Card>
                <Empty
                    description="Booking tidak ditemukan"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button onClick={() => navigate("/customer/bookings")}>
                        Kembali ke Daftar Pesanan
                    </Button>
                </Empty>
            </Card>
        );
    }

    const booking = data.data;

    return (
        <div>
            <div className="mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/customer/bookings")}
                    className="mb-4"
                >
                    Kembali
                </Button>
                <h1 className="text-2xl font-bold">Detail Pesanan</h1>
            </div>

            <Card className="shadow-md">
                <Descriptions
                    title={
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-lg text-blue-600">
                                {booking.booking_code}
                            </span>
                            <Tag
                                color={statusColors[booking.status]}
                                icon={
                                    booking.status === "on_progress" ? (
                                        <SyncOutlined spin />
                                    ) : undefined
                                }
                                className="text-sm"
                            >
                                {statusLabels[booking.status]}
                            </Tag>
                        </div>
                    }
                    bordered
                    column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                >
                    <Descriptions.Item
                        label={
                            <Space>
                                <ToolOutlined />
                                <span>Layanan</span>
                            </Space>
                        }
                    >
                        <strong>{booking.service?.name || "-"}</strong>
                        {booking.service?.description && (
                            <div className="text-gray-500 text-sm mt-1">
                                {booking.service.description}
                            </div>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item
                        label={
                            <Space>
                                <DollarOutlined />
                                <span>Total Harga</span>
                            </Space>
                        }
                    >
                        <span className="font-semibold text-green-600 text-lg">
                            {formatCurrency(booking.total_price)}
                        </span>
                    </Descriptions.Item>

                    <Descriptions.Item
                        label={
                            <Space>
                                <CalendarOutlined />
                                <span>Tanggal</span>
                            </Space>
                        }
                    >
                        {booking.schedule?.date
                            ? dayjs(booking.schedule.date).format(
                                  "dddd, DD MMMM YYYY"
                              )
                            : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item
                        label={
                            <Space>
                                <ClockCircleOutlined />
                                <span>Waktu</span>
                            </Space>
                        }
                    >
                        {booking.schedule?.start_time &&
                        booking.schedule?.end_time
                            ? `${booking.schedule.start_time} - ${booking.schedule.end_time}`
                            : "-"}
                    </Descriptions.Item>

                    <Descriptions.Item
                        label={
                            <Space>
                                <EnvironmentOutlined />
                                <span>Alamat</span>
                            </Space>
                        }
                        span={2}
                    >
                        {booking.address || "-"}
                    </Descriptions.Item>

                    {booking.cleaner && (
                        <Descriptions.Item
                            label={
                                <Space>
                                    <UserOutlined />
                                    <span>Cleaner</span>
                                </Space>
                            }
                            span={2}
                        >
                            <div>
                                <strong>
                                    {booking.cleaner.user?.name || "-"}
                                </strong>
                                {booking.cleaner.phone && (
                                    <div className="text-gray-500 text-sm mt-1">
                                        {booking.cleaner.phone}
                                    </div>
                                )}
                            </div>
                        </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Tanggal Pemesanan" span={2}>
                        {dayjs(booking.created_at).format(
                            "dddd, DD MMMM YYYY HH:mm"
                        )}
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                <div className="flex justify-end gap-2">
                    <Button onClick={() => navigate("/customer/bookings")}>
                        Kembali ke Daftar
                    </Button>
                    {booking.status === "pending" && (
                        <Button
                            type="primary"
                            onClick={() => navigate("/customer/services")}
                        >
                            Buat Pesanan Baru
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}

