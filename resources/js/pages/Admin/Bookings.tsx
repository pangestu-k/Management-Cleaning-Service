import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Space, Modal, Select, Tag, message, Input } from "antd";
import { EyeOutlined, SyncOutlined } from "@ant-design/icons";
import { bookingsApi } from "../../api/bookings";
import { cleanersApi } from "../../api/cleaners";
import type { Booking, BookingStatus, Cleaner } from "../../types";
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
    pending: "Pending",
    approved: "Approved",
    on_progress: "On Progress",
    completed: "Completed",
    canceled: "Canceled",
};

export function Bookings() {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null
    );
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [search, setSearch] = useState("");
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-bookings", statusFilter, search],
        queryFn: () =>
            bookingsApi.admin.getAll({ status: statusFilter, search }),
    });

    const { data: cleanersData } = useQuery({
        queryKey: ["admin-cleaners-list"],
        queryFn: () => cleanersApi.getAll(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
            bookingsApi.admin.updateStatus(id, status),
        onSuccess: () => {
            message.success("Status berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
        },
        onError: () => message.error("Gagal memperbarui status"),
    });

    const assignCleanerMutation = useMutation({
        mutationFn: ({ id, cleanerId }: { id: number; cleanerId: number }) =>
            bookingsApi.admin.assignCleaner(id, cleanerId),
        onSuccess: () => {
            message.success("Cleaner berhasil di-assign");
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
        },
        onError: () => message.error("Gagal assign cleaner"),
    });

    const handleViewDetail = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsDetailOpen(true);
    };

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
                <span>
                    {dayjs(record.schedule?.date).format("DD MMM")}{" "}
                    {record.schedule?.start_time}
                </span>
            ),
        },
        {
            title: "Cleaner",
            key: "cleaner",
            render: (_, record) => (
                <Select
                    placeholder="Pilih Cleaner"
                    value={record.cleaner_id}
                    onChange={(cleanerId) =>
                        assignCleanerMutation.mutate({
                            id: record.id,
                            cleanerId,
                        })
                    }
                    style={{ width: 130 }}
                    size="small"
                >
                    {cleanersData?.data?.data?.map((cleaner: Cleaner) => (
                        <Select.Option key={cleaner.id} value={cleaner.id}>
                            {cleaner.user?.name}
                        </Select.Option>
                    ))}
                </Select>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string, record) => (
                <Select<BookingStatus>
                    value={status as BookingStatus}
                    onChange={(newStatus: BookingStatus) =>
                        updateStatusMutation.mutate({
                            id: record.id,
                            status: newStatus,
                        })
                    }
                    style={{ width: 130 }}
                    size="small"
                >
                    <Select.Option value="pending">
                        <Tag color="orange">Pending</Tag>
                    </Select.Option>
                    <Select.Option value="approved">
                        <Tag color="blue">Approved</Tag>
                    </Select.Option>
                    <Select.Option value="on_progress">
                        <Tag color="processing" icon={<SyncOutlined spin />}>
                            On Progress
                        </Tag>
                    </Select.Option>
                    <Select.Option value="completed">
                        <Tag color="green">Completed</Tag>
                    </Select.Option>
                    <Select.Option value="canceled">
                        <Tag color="red">Canceled</Tag>
                    </Select.Option>
                </Select>
            ),
        },
        {
            title: "Total",
            dataIndex: "total_price",
            key: "total_price",
            render: (price: number) => `Rp ${price?.toLocaleString("id-ID")}`,
        },
        {
            title: "Aksi",
            key: "action",
            render: (_, record) => (
                <Button
                    type="primary"
                    ghost
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                />
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Booking</h1>
                <Space>
                    <Input.Search
                        placeholder="Cari kode booking..."
                        onSearch={setSearch}
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="Filter Status"
                        allowClear
                        onChange={setStatusFilter}
                        style={{ width: 150 }}
                    >
                        <Select.Option value="pending">Pending</Select.Option>
                        <Select.Option value="approved">Approved</Select.Option>
                        <Select.Option value="on_progress">
                            On Progress
                        </Select.Option>
                        <Select.Option value="completed">
                            Completed
                        </Select.Option>
                        <Select.Option value="canceled">Canceled</Select.Option>
                    </Select>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={data?.data?.data || []}
                rowKey="id"
                loading={isLoading}
                scroll={{ x: 1000 }}
            />

            <Modal
                title="Detail Booking"
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={null}
                width={600}
            >
                {selectedBooking && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-500">Kode Booking</p>
                                <p className="font-semibold font-mono">
                                    {selectedBooking.booking_code}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Status</p>
                                <Tag
                                    color={statusColors[selectedBooking.status]}
                                >
                                    {statusLabels[selectedBooking.status]}
                                </Tag>
                            </div>
                            <div>
                                <p className="text-gray-500">Customer</p>
                                <p className="font-semibold">
                                    {selectedBooking.user?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email</p>
                                <p>{selectedBooking.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Layanan</p>
                                <p className="font-semibold">
                                    {selectedBooking.service?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Total</p>
                                <p className="font-semibold text-green-600">
                                    Rp{" "}
                                    {selectedBooking.total_price?.toLocaleString(
                                        "id-ID"
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Jadwal</p>
                                <p>
                                    {dayjs(
                                        selectedBooking.schedule?.date
                                    ).format("DD MMM YYYY")}{" "}
                                    {selectedBooking.schedule?.start_time}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Cleaner</p>
                                <p>
                                    {selectedBooking.cleaner?.user?.name || "-"}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500">Alamat</p>
                            <p className="bg-gray-50 p-3 rounded">
                                {selectedBooking.address}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
