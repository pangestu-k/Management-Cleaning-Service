import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    Descriptions,
    Tag,
    Button,
    Spin,
    Empty,
    Space,
    Divider,
    Form,
    Input,
    Upload,
    Modal,
    message,
    Image,
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
    UploadOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
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
    const queryClient = useQueryClient();
    const [complaintModalOpen, setComplaintModalOpen] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();

    const { data, isLoading, error } = useQuery({
        queryKey: ["customer-booking", id],
        queryFn: () => bookingsApi.customer.getById(Number(id)),
        enabled: !!id,
    });

    const submitComplaintMutation = useMutation({
        mutationFn: ({
            id: bookingId,
            complaintImage,
            description,
        }: {
            id: number;
            complaintImage: File;
            description: string;
        }) =>
            bookingsApi.customer.submitComplaint(
                bookingId,
                complaintImage,
                description,
            ),
        onSuccess: () => {
            message.success(
                "Keluhan berhasil dikirim. Admin akan meninjau keluhan Anda.",
            );
            queryClient.invalidateQueries({
                queryKey: ["customer-booking", id],
            });
            setComplaintModalOpen(false);
            setFileList([]);
            form.resetFields();
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err.response?.data?.message || "Gagal mengirim keluhan",
            );
        },
    });

    const handleOpenComplaintModal = () => {
        setComplaintModalOpen(true);
        setFileList([]);
        form.resetFields();
    };

    const handleCloseComplaintModal = () => {
        setComplaintModalOpen(false);
        setFileList([]);
        form.resetFields();
    };

    const handleUploadChange: UploadProps["onChange"] = (info) => {
        let newFileList = [...info.fileList];

        // Limit to 1 file
        newFileList = newFileList.slice(-1);

        // Validate file size (2MB)
        newFileList = newFileList
            .map((file) => {
                if (file.originFileObj) {
                    const isLt2M = file.originFileObj.size / 1024 / 1024 < 2;
                    if (!isLt2M) {
                        message.error("Ukuran file maksimal 2MB!");
                        return null;
                    }
                }
                return file;
            })
            .filter(Boolean) as UploadFile[];

        setFileList(newFileList);
    };

    const handleSubmitComplaint = async (values: {
        customer_complaint_desc: string;
    }) => {
        if (fileList.length === 0) {
            message.error("Silakan upload bukti foto terlebih dahulu");
            return;
        }

        const file = fileList[0].originFileObj;
        if (!file || !id) return;

        // Validate file type
        const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(
            file.type,
        );
        if (!isValidType) {
            message.error("Format file harus JPG, JPEG, atau PNG");
            return;
        }

        submitComplaintMutation.mutate({
            id: Number(id),
            complaintImage: file,
            description: values.customer_complaint_desc,
        });
    };

    const uploadProps: UploadProps = {
        beforeUpload: () => false, // Prevent auto upload
        onChange: handleUploadChange,
        fileList,
        accept: "image/jpeg,image/jpg,image/png",
        maxCount: 1,
    };

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
                                  "dddd, DD MMMM YYYY",
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
                            "dddd, DD MMMM YYYY HH:mm",
                        )}
                    </Descriptions.Item>
                </Descriptions>

                {/* Evidence from Cleaner */}
                {booking.evidence_cleaner && (
                    <>
                        <Divider />
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">
                                Bukti Foto dari Cleaner
                            </h3>
                            <div className="w-full overflow-hidden">
                                <Image
                                    src={`/storage/${booking.evidence_cleaner}`}
                                    alt="Evidence from cleaner"
                                    className="rounded border w-full"
                                    style={{
                                        maxHeight: 400,
                                        maxWidth: "100%",
                                        objectFit: "contain",
                                    }}
                                    preview={{
                                        mask: "Lihat Detail",
                                    }}
                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3a0DVQHBH2A5M3xK5v1YChuXMe6HP4rWPqUwF85SilA9f/q5QPAVJFklAAUddHOvNQckQ3DYgqk0hAEZy2y2xDespIArH0C2o9CgJGmgoSuYtOeTgtEnzJGU6bi6tSge8T8yACDLZcngUHyS6Oo9hGyGjBb7lCT+AHQql3DVQ9g3SWA8C1UyM3DYEG7fIEDQ1QXxo1g+EFnGxYYkPAOcTtBSFhQW6QmNdTgOGUfYWJybjEwRKayFjiIh4yO8xIxylgrx9PMws6wM0r13UxT4D2YuQWJAzoHhJ0dBYlEi3AGM31iK04yNIGzu7QwMrNP+//scz4LA0kcb2D0//v7//+99///v8zYwMCvZWA4UAlgDhKvAbwKkKgAAAGxlWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAACQAAAAAQAAAJAAAAABAAKgAgAEAAAAAQAAAMKgAwAEAAAAAQAAAMKAAAAA"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Customer Complaint */}
                {booking.status === "completed" && (
                    <>
                        <Divider />
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-3">
                                Keluhan Pelanggan
                            </h3>
                            {booking.customer_complaint ? (
                                <Card>
                                    <div className="mb-3 w-full overflow-hidden">
                                        <Image
                                            src={`/storage/${booking.customer_complaint}`}
                                            alt="Complaint evidence"
                                            className="rounded border w-full"
                                            style={{
                                                maxHeight: 300,
                                                maxWidth: "100%",
                                                objectFit: "contain",
                                            }}
                                            preview={{
                                                mask: "Lihat Detail",
                                            }}
                                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3a0DVQHBH2A5M3xK5v1YChuXMe6HP4rWPqUwF85SilA9f/q5QPAVJFklAAUddHOvNQckQ3DYgqk0hAEZy2y2xDespIArH0C2o9CgJGmgoSuYtOeTgtEnzJGU6bi6tSge8T8yACDLZcngUHyS6Oo9hGyGjBb7lCT+AHQql3DVQ9g3SWA8C1UyM3DYEG7fIEDQ1QXxo1g+EFnGxYYkPAOcTtBSFhQW6QmNdTgOGUfYWJybjEwRKayFjiIh4yO8xIxylgrx9PMws6wM0r13UxT4D2YuQWJAzoHhJ0dBYlEi3AGM31iK04yNIGzu7QwMrNP+//scz4LA0kcb2D0//v7//+99///v8zYwMCvZWA4UAlgDhKvAbwKkKgAAAGxlWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAACQAAAAAQAAAJAAAAABAAKgAgAEAAAAAQAAAMKgAwAEAAAAAQAAAMKAAAAA"
                                        />
                                    </div>
                                    {booking.customer_complaint_desc && (
                                        <div className="mt-3">
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {
                                                    booking.customer_complaint_desc
                                                }
                                            </p>
                                        </div>
                                    )}
                                    <Tag color="orange" className="mt-2">
                                        Keluhan telah dikirim, menunggu tinjauan
                                        admin
                                    </Tag>
                                </Card>
                            ) : (
                                // <Card>
                                //     <p className="text-gray-600 mb-4">
                                //         Jika Anda tidak puas dengan hasil
                                //         pekerjaan, silakan ajukan keluhan dengan
                                //         mengupload bukti foto dan deskripsi
                                //         keluhan.
                                //     </p>
                                //     <Button
                                //         type="primary"
                                //         danger
                                //         size="large"
                                //         icon={<ExclamationCircleOutlined />}
                                //         onClick={handleOpenComplaintModal}
                                //     >
                                //         Ajukan Keluhan
                                //     </Button>
                                // </Card>
                                <></>
                            )}
                        </div>
                    </>
                )}

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

            {/* Complaint Modal */}
            <Modal
                title="Ajukan Keluhan"
                open={complaintModalOpen}
                onCancel={handleCloseComplaintModal}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitComplaint}
                >
                    <Form.Item
                        label="Upload Bukti Foto Keluhan"
                        name="customer_complaint"
                        required
                        rules={[
                            {
                                validator: () => {
                                    if (fileList.length === 0) {
                                        return Promise.reject(
                                            "Bukti foto keluhan wajib diupload",
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
                            <Image
                                src={URL.createObjectURL(
                                    fileList[0].originFileObj as File,
                                )}
                                alt="Preview"
                                className="w-full max-h-64 object-contain rounded border"
                            />
                        </div>
                    )}

                    <Form.Item
                        label="Deskripsi Keluhan"
                        name="customer_complaint_desc"
                        rules={[
                            {
                                required: true,
                                message: "Deskripsi keluhan wajib diisi",
                            },
                            {
                                min: 10,
                                message: "Deskripsi minimal 10 karakter",
                            },
                        ]}
                    >
                        <Input.TextArea
                            rows={6}
                            placeholder="Jelaskan keluhan Anda secara detail (minimal 10 karakter)..."
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <Form.Item>
                        <div className="flex justify-end gap-2">
                            <Button onClick={handleCloseComplaintModal}>
                                Batal
                            </Button>
                            <Button
                                type="primary"
                                danger
                                htmlType="submit"
                                loading={submitComplaintMutation.isPending}
                                icon={<ExclamationCircleOutlined />}
                            >
                                Kirim Keluhan
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
