import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    Tag,
    Card,
    Button,
    message,
    Popconfirm,
    Empty,
    Spin,
} from "antd";
import {
    SyncOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import { bookingsApi } from "../../api/bookings";
import type { Booking } from "../../types";
import type { ColumnsType } from "antd/es/table";
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
    approved: "Siap Dikerjakan",
    on_progress: "Sedang Dikerjakan",
    completed: "Selesai",
    canceled: "Dibatalkan",
};

export function CleanerBookings() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["cleaner-bookings"],
        queryFn: () => bookingsApi.cleaner.getAll(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: number;
            status: "on_progress" | "completed";
        }) => bookingsApi.cleaner.updateStatus(id, status),
        onSuccess: () => {
            message.success("Status berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ["cleaner-bookings"] });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err.response?.data?.message || "Gagal memperbarui status"
            );
        },
    });

    const columns: ColumnsType<Booking> = [
        {
            title: "Kode Booking",
            dataIndex: "booking_code",
            key: "booking_code",
            render: (code: string) => (
                <span className="font-mono font-semibold text-green-600">
                    {code}
                </span>
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
            title: "Jadwal",
            key: "schedule",
            render: (_, record) => (
                <div>
                    <div className="font-semibold">
                        {dayjs(record.schedule?.date).format("DD MMM YYYY")}
                    </div>
                    <div className="text-gray-500 text-sm">
                        {record.schedule?.start_time} -{" "}
                        {record.schedule?.end_time}
                    </div>
                </div>
            ),
        },
        {
            title: "Alamat",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
            width: 200,
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
            title: "Aksi",
            key: "action",
            render: (_, record) => {
                if (record.status === "approved") {
                    return (
                        <Popconfirm
                            title="Mulai mengerjakan tugas ini?"
                            onConfirm={() =>
                                updateStatusMutation.mutate({
                                    id: record.id,
                                    status: "on_progress",
                                })
                            }
                            okText="Ya"
                            cancelText="Batal"
                        >
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                loading={updateStatusMutation.isPending}
                            >
                                Mulai
                            </Button>
                        </Popconfirm>
                    );
                }
                if (record.status === "on_progress") {
                    return (
                        <Popconfirm
                            title="Tandai tugas ini selesai?"
                            onConfirm={() =>
                                updateStatusMutation.mutate({
                                    id: record.id,
                                    status: "completed",
                                })
                            }
                            okText="Ya"
                            cancelText="Batal"
                        >
                            <Button
                                type="primary"
                                style={{ background: "#22c55e" }}
                                icon={<CheckCircleOutlined />}
                                loading={updateStatusMutation.isPending}
                            >
                                Selesai
                            </Button>
                        </Popconfirm>
                    );
                }
                return null;
            },
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
            <h1 className="text-2xl font-bold mb-6">Tugas Saya</h1>

            {bookings.length === 0 ? (
                <Card>
                    <Empty
                        description="Belum ada tugas yang di-assign"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            ) : (
                <Table
                    columns={columns}
                    dataSource={bookings}
                    rowKey="id"
                    scroll={{ x: 900 }}
                />
            )}
        </div>
    );
}
