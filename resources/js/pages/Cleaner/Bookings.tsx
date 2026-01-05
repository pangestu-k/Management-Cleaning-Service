import { useState } from "react";
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
    Modal,
    Upload,
    Form,
} from "antd";
import {
    SyncOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    UploadOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
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
    const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();

    const { data, isLoading } = useQuery({
        queryKey: ["cleaner-bookings"],
        queryFn: () => bookingsApi.cleaner.getAll(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({
            id,
            status,
            evidenceFile,
        }: {
            id: number;
            status: "on_progress" | "completed";
            evidenceFile?: File;
        }) => bookingsApi.cleaner.updateStatus(id, status, evidenceFile),
        onSuccess: () => {
            message.success("Status berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ["cleaner-bookings"] });
            setEvidenceModalOpen(false);
            setFileList([]);
            setSelectedBooking(null);
            form.resetFields();
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err.response?.data?.message || "Gagal memperbarui status"
            );
        },
    });

    const handleOpenEvidenceModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setEvidenceModalOpen(true);
        setFileList([]);
        form.resetFields();
    };

    const handleCloseEvidenceModal = () => {
        setEvidenceModalOpen(false);
        setFileList([]);
        setSelectedBooking(null);
        form.resetFields();
    };

    const handleUploadChange: UploadProps["onChange"] = (info) => {
        let newFileList = [...info.fileList];

        // Limit to 1 file
        newFileList = newFileList.slice(-1);

        // Validate file size (2MB)
        newFileList = newFileList.map((file) => {
            if (file.originFileObj) {
                const isLt2M = file.originFileObj.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                    message.error("Ukuran file maksimal 2MB!");
                    return null;
                }
            }
            return file;
        }).filter(Boolean) as UploadFile[];

        setFileList(newFileList);
    };

    const handleSubmitEvidence = async () => {
        if (fileList.length === 0) {
            message.error("Silakan upload bukti foto terlebih dahulu");
            return;
        }

        const file = fileList[0].originFileObj;
        if (!file || !selectedBooking) return;

        // Validate file type
        const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(
            file.type
        );
        if (!isValidType) {
            message.error("Format file harus JPG, JPEG, atau PNG");
            return;
        }

        updateStatusMutation.mutate({
            id: selectedBooking.id,
            status: "completed",
            evidenceFile: file,
        });
    };

    const uploadProps: UploadProps = {
        beforeUpload: () => false, // Prevent auto upload
        onChange: handleUploadChange,
        fileList,
        accept: "image/jpeg,image/jpg,image/png",
        maxCount: 1,
    };

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
            width: 180,
            render: (status: string) => (
                <>
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
                </>
            ),
        },
        {
            title: "Aksi",
            key: "action",
            width: 150,
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
                        <Button
                            type="primary"
                            style={{ background: "#22c55e" }}
                            icon={<CheckCircleOutlined />}
                            loading={updateStatusMutation.isPending}
                            onClick={() => handleOpenEvidenceModal(record)}
                        >
                            Selesai
                        </Button>
                    );
                }

                return "-";
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

            {/* Evidence Upload Modal */}
            <Modal
                title="Upload Bukti Foto Penyelesaian"
                open={evidenceModalOpen}
                onCancel={handleCloseEvidenceModal}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmitEvidence}>
                    <Form.Item
                        label="Upload Bukti Foto"
                        required
                        rules={[
                            {
                                validator: () => {
                                    if (fileList.length === 0) {
                                        return Promise.reject(
                                            "Bukti foto wajib diupload"
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Upload {...uploadProps} listType="picture-card">
                            {fileList.length < 1 && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                        <div className="text-gray-500 text-sm mt-2">
                            Format: JPG, JPEG, atau PNG (Maks. 2MB)
                        </div>
                    </Form.Item>

                    {fileList.length > 0 && (
                        <div className="mb-4">
                            <img
                                src={URL.createObjectURL(
                                    fileList[0].originFileObj as File
                                )}
                                alt="Preview"
                                className="w-full max-h-64 object-contain rounded border"
                            />
                        </div>
                    )}

                    <Form.Item>
                        <div className="flex justify-end gap-2">
                            <Button onClick={handleCloseEvidenceModal}>
                                Batal
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={updateStatusMutation.isPending}
                                icon={<CheckCircleOutlined />}
                            >
                                Konfirmasi Selesai
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
