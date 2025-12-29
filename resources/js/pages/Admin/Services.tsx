import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Tag,
    message,
    Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { servicesApi } from "../../api/services";
import type { Service, ServiceFormData } from "../../types";
import type { ColumnsType } from "antd/es/table";

export function Services() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-services"],
        queryFn: () => servicesApi.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: (data: ServiceFormData) => servicesApi.create(data),
        onSuccess: () => {
            message.success("Layanan berhasil dibuat");
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            handleCloseModal();
        },
        onError: () => message.error("Gagal membuat layanan"),
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Partial<ServiceFormData>;
        }) => servicesApi.update(id, data),
        onSuccess: () => {
            message.success("Layanan berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
            handleCloseModal();
        },
        onError: () => message.error("Gagal memperbarui layanan"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => servicesApi.delete(id),
        onSuccess: () => {
            message.success("Layanan berhasil dihapus");
            queryClient.invalidateQueries({ queryKey: ["admin-services"] });
        },
        onError: () => message.error("Gagal menghapus layanan"),
    });

    const handleOpenModal = (service?: Service) => {
        if (service) {
            setEditingService(service);
            form.setFieldsValue(service);
        } else {
            setEditingService(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
        form.resetFields();
    };

    const handleSubmit = async (values: ServiceFormData) => {
        if (editingService) {
            updateMutation.mutate({ id: editingService.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const columns: ColumnsType<Service> = [
        {
            title: "Nama Layanan",
            dataIndex: "name",
            key: "name",
            render: (name: string) => (
                <span className="font-semibold">{name}</span>
            ),
        },
        {
            title: "Deskripsi",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Harga",
            dataIndex: "price",
            key: "price",
            render: (price: number) => `Rp ${price?.toLocaleString("id-ID")}`,
        },
        {
            title: "Durasi",
            dataIndex: "duration_minutes",
            key: "duration_minutes",
            render: (minutes: number) => `${minutes} menit`,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "active" ? "green" : "red"}>
                    {status === "active" ? "Aktif" : "Tidak Aktif"}
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
                        title="Hapus layanan ini?"
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
                <h1 className="text-2xl font-bold">Manajemen Layanan</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenModal()}
                >
                    Tambah Layanan
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data?.data?.data || []}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    total: data?.data?.total,
                    pageSize: data?.data?.per_page,
                    showSizeChanger: false,
                }}
            />

            <Modal
                title={editingService ? "Edit Layanan" : "Tambah Layanan"}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ status: "active" }}
                >
                    <Form.Item
                        name="name"
                        label="Nama Layanan"
                        rules={[
                            { required: true, message: "Nama wajib diisi" },
                        ]}
                    >
                        <Input placeholder="Contoh: Deep Cleaning" />
                    </Form.Item>

                    <Form.Item name="description" label="Deskripsi">
                        <Input.TextArea
                            rows={3}
                            placeholder="Deskripsi layanan..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Harga (Rp)"
                        rules={[
                            { required: true, message: "Harga wajib diisi" },
                        ]}
                    >
                        <InputNumber
                            className="w-full"
                            min={0}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="duration_minutes"
                        label="Durasi (menit)"
                        rules={[
                            { required: true, message: "Durasi wajib diisi" },
                        ]}
                    >
                        <InputNumber className="w-full" min={1} />
                    </Form.Item>

                    <Form.Item name="status" label="Status">
                        <Select>
                            <Select.Option value="active">Aktif</Select.Option>
                            <Select.Option value="inactive">
                                Tidak Aktif
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
                                {editingService ? "Simpan" : "Tambah"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
