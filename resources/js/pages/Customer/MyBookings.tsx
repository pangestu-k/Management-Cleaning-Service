import { useQuery } from "@tanstack/react-query";
import { Card, Row, Col, Tag, Empty, Spin, Button } from "antd";
import { 
    SyncOutlined, 
    CalendarOutlined, 
    DollarOutlined,
    ClockCircleOutlined 
} from "@ant-design/icons";
import { bookingsApi } from "../../api/bookings";
import { formatCurrency } from "../../utils/format";
import type { Booking } from "../../types";
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
            <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>

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
                <Row gutter={[16, 16]}>
                    {bookings.map((booking: Booking) => (
                        <Col xs={24} sm={12} lg={8} key={booking.id}>
                            <Card
                                className="h-full shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                                actions={[
                                    <Button
                                        type="link"
                                        onClick={() => navigate(`/customer/bookings/${booking.id}`)}
                                    >
                                        Lihat Detail
                                    </Button>,
                                ]}
                            >
                                <div className="mb-3">
                                    <span className="font-mono font-semibold text-blue-600 text-lg">
                                        {booking.booking_code}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold mb-2">
                                    {booking.service?.name || "Layanan"}
                                </h3>
                                
                                <div className="mb-3">
                                    <Tag
                                        color={statusColors[booking.status]}
                                        icon={
                                            booking.status === "on_progress" ? (
                                                <SyncOutlined spin />
                                            ) : undefined
                                        }
                                        className="mb-2"
                                    >
                                        {statusLabels[booking.status]}
                                    </Tag>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-gray-600">
                                        <CalendarOutlined className="mr-2" />
                                        <span className="text-sm">
                                            {dayjs(booking.schedule?.date).format("DD MMM YYYY")}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <ClockCircleOutlined className="mr-2" />
                                        <span className="text-sm">
                                            {booking.schedule?.start_time} - {booking.schedule?.end_time}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <DollarOutlined className="mr-2 text-green-600" />
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(booking.total_price)}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 border-t pt-2">
                                    Order: {dayjs(booking.created_at).format("DD MMM YYYY HH:mm")}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
}
