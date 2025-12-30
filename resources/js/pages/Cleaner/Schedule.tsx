import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Card, Empty, Spin, Tag, Timeline, Typography } from "antd";
import { ClockCircleOutlined, UserOutlined, HomeOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { bookingsApi } from "../../api/bookings";
import { formatCurrency } from "../../utils/format";

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
    pending: "orange",
    approved: "blue",
    on_progress: "processing",
    completed: "green",
    canceled: "red",
};

const statusLabels: Record<string, string> = {
    pending: "Menunggu",
    approved: "Siap Dikerjakan",
    on_progress: "Sedang Dikerjakan",
    completed: "Selesai",
    canceled: "Dibatalkan",
};

export function CleanerSchedule() {
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());

    const { data, isLoading } = useQuery({
        queryKey: ["cleaner-schedule", currentMonth.year(), currentMonth.month() + 1],
        queryFn: () =>
            bookingsApi.cleaner.getSchedule({
                month: currentMonth.month() + 1,
                year: currentMonth.year(),
            }),
    });

    const { data: selectedDateData, isLoading: isLoadingSelectedDate } = useQuery({
        queryKey: ["cleaner-schedule-date", selectedDate.format("YYYY-MM-DD")],
        queryFn: () =>
            bookingsApi.cleaner.getSchedule({
                date: selectedDate.format("YYYY-MM-DD"),
            }),
        enabled: !!selectedDate,
    });

    const datesWithBookings = data?.data?.dates_with_bookings || [];
    const bookingsForSelectedDate =
        selectedDateData?.data?.bookings_by_date?.[selectedDate.format("YYYY-MM-DD")] || [];

    // Custom date cell renderer to show indicator for dates with bookings
    const dateCellRender = (value: Dayjs) => {
        const dateKey = value.format("YYYY-MM-DD");
        const hasBookings = datesWithBookings.includes(dateKey);

        return (
            <div className="relative h-full w-full flex items-center justify-center">
                {hasBookings && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
            </div>
        );
    };

    const onDateSelect = (value: Dayjs) => {
        setSelectedDate(value);
    };

    const onPanelChange = (value: Dayjs) => {
        setCurrentMonth(value);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Title level={2} className="mb-6">
                Jadwal Saya
            </Title>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <Card title="Kalender" className="h-fit">
                    <div className="cleaner-calendar-wrapper">
                        <Calendar
                            value={selectedDate}
                            onSelect={onDateSelect}
                            onPanelChange={onPanelChange}
                            dateCellRender={dateCellRender}
                            fullscreen={false}
                        />
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-gray-600">Ada pekerjaan</span>
                        </div>
                    </div>
                </Card>

                {/* Timeline */}
                <Card
                    title={`Timeline - ${selectedDate.format("DD MMMM YYYY")}`}
                    className="h-fit"
                >
                    {isLoadingSelectedDate ? (
                        <div className="flex justify-center items-center h-64">
                            <Spin size="large" />
                        </div>
                    ) : bookingsForSelectedDate.length === 0 ? (
                        <Empty
                            description="Tidak ada pekerjaan pada tanggal ini"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <Timeline
                            items={bookingsForSelectedDate.map((booking, index) => ({
                                key: booking.id,
                                color:
                                    booking.status === "completed"
                                        ? "green"
                                        : booking.status === "on_progress"
                                        ? "blue"
                                        : "orange",
                                children: (
                                    <div className="mb-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ClockCircleOutlined className="text-gray-500" />
                                                    <Text strong>
                                                        {booking.start_time} - {booking.end_time}
                                                    </Text>
                                                </div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <UserOutlined className="text-gray-500" />
                                                    <Text>{booking.customer_name}</Text>
                                                </div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <HomeOutlined className="text-gray-500" />
                                                    <Text type="secondary" className="text-sm">
                                                        {booking.service_name}
                                                    </Text>
                                                </div>
                                                <Text type="secondary" className="text-sm block mb-2">
                                                    {booking.address}
                                                </Text>
                                                <div className="flex items-center gap-2">
                                                    <Tag color={statusColors[booking.status]}>
                                                        {statusLabels[booking.status]}
                                                    </Tag>
                                                    <Text className="text-sm font-semibold text-green-600">
                                                        {formatCurrency(booking.total_price)}
                                                    </Text>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <Text
                                                    className="font-mono text-xs text-gray-400"
                                                    code
                                                >
                                                    {booking.booking_code}
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            }))}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
}

