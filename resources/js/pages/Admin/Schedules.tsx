import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    DatePicker,
    TimePicker,
    InputNumber,
    Select,
    Tag,
    message,
    Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { schedulesApi } from "../../api/schedules";
import type { Schedule, ScheduleFormData } from "../../types";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const statusColors: Record<string, string> = {
    available: "green",
    full: "orange",
    unavailable: "red",
};

export function Schedules() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(
        null
    );
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-schedules"],
        queryFn: () => schedulesApi.getAll({ upcoming: true }),
    });

    const createMutation = useMutation({
        mutationFn: (data: ScheduleFormData) => schedulesApi.create(data),
        onSuccess: () => {
            message.success("Jadwal berhasil dibuat");
            queryClient.invalidateQueries({ queryKey: ["admin-schedules"] });
            handleCloseModal();
        },
        onError: () => message.error("Gagal membuat jadwal"),
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Partial<ScheduleFormData>;
        }) => schedulesApi.update(id, data),
        onSuccess: () => {
            message.success("Jadwal berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ["admin-schedules"] });
            handleCloseModal();
        },
        onError: () => message.error("Gagal memperbarui jadwal"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => schedulesApi.delete(id),
        onSuccess: () => {
            message.success("Jadwal berhasil dihapus");
            queryClient.invalidateQueries({ queryKey: ["admin-schedules"] });
        },
        onError: () => message.error("Gagal menghapus jadwal"),
    });

    const handleOpenModal = (schedule?: Schedule) => {
        if (schedule) {
            setEditingSchedule(schedule);
            form.setFieldsValue({
                date: dayjs(schedule.date),
                start_time: dayjs(schedule.start_time, "HH:mm"),
                end_time: dayjs(schedule.end_time, "HH:mm"),
                capacity: schedule.capacity,
                status: schedule.status,
            });
        } else {
            setEditingSchedule(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSchedule(null);
        form.resetFields();
    };

    const handleSubmit = async (values: {
        date: dayjs.Dayjs;
        start_time: dayjs.Dayjs;
        end_time: dayjs.Dayjs;
        capacity: number;
        status?: string;
    }) => {
        const data: ScheduleFormData = {
            date: values.date.format("YYYY-MM-DD"),
            start_time: values.start_time.format("HH:mm"),
            end_time: values.end_time.format("HH:mm"),
            capacity: values.capacity,
            status: values.status as "available" | "full" | "unavailable",
        };

        if (editingSchedule) {
            updateMutation.mutate({ id: editingSchedule.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const columns: ColumnsType<Schedule> = [
        {
            title: "Tanggal",
            dataIndex: "date",
            key: "date",
            render: (date: string) => dayjs(date).format("DD MMM YYYY"),
        },
        {
            title: "Waktu",
            key: "time",
            render: (_, record) => `${record.start_time} - ${record.end_time}`,
        },
        {
            title: "Kapasitas",
            key: "capacity",
            render: (_, record) =>
                `${record.remaining_capacity}/${record.capacity}`,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={statusColors[status]}>
                    {status === "available"
                        ? "Tersedia"
                        : status === "full"
                        ? "Penuh"
                        : "Tidak Tersedia"}
                </Tag>
            ),
        },
        {
            title: "Aksi",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        ghost
                        icon={<EditOutlined />}
                        onClick={() => handleOpenModal(record)}
                    />
                    <Popconfirm
                        title="Hapus jadwal ini?"
                        onConfirm={() => deleteMutation.mutate(record.id)}
                        okText="Ya"
                        cancelText="Batal"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Jadwal</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenModal()}
                >
                    Tambah Jadwal
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data?.data?.data || []}
                rowKey="id"
                loading={isLoading}
            />

            <Modal
                title={editingSchedule ? "Edit Jadwal" : "Tambah Jadwal"}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ status: "available" }}
                >
                    <Form.Item
                        name="date"
                        label="Tanggal"
                        rules={[
                            { required: true, message: "Tanggal wajib diisi" },
                        ]}
                    >
                        <DatePicker className="w-full" format="DD MMM YYYY" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="start_time"
                            label="Waktu Mulai"
                            rules={[{ required: true, message: "Wajib diisi" }]}
                        >
                            <TimePicker className="w-full" format="HH:mm" />
                        </Form.Item>

                        <Form.Item
                            name="end_time"
                            label="Waktu Selesai"
                            rules={[{ required: true, message: "Wajib diisi" }]}
                        >
                            <TimePicker className="w-full" format="HH:mm" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="capacity"
                        label="Kapasitas"
                        rules={[
                            {
                                required: true,
                                message: "Kapasitas wajib diisi",
                            },
                        ]}
                    >
                        <InputNumber className="w-full" min={1} />
                    </Form.Item>

                    <Form.Item name="status" label="Status">
                        <Select>
                            <Select.Option value="available">
                                Tersedia
                            </Select.Option>
                            <Select.Option value="full">Penuh</Select.Option>
                            <Select.Option value="unavailable">
                                Tidak Tersedia
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item className="mb-0 flex justify-end">
                        <Space>
                            <Button onClick={handleCloseModal}>Batal</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                }
                            >
                                {editingSchedule ? "Simpan" : "Tambah"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
