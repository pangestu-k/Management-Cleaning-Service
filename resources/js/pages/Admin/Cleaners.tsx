import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    Tag,
    message,
    Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { cleanersApi } from "../../api/cleaners";
import type { Cleaner, CleanerFormData } from "../../types";
import type { ColumnsType } from "antd/es/table";

export function Cleaners() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCleaner, setEditingCleaner] = useState<Cleaner | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-cleaners"],
        queryFn: () => cleanersApi.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: (data: CleanerFormData) => cleanersApi.create(data),
        onSuccess: () => {
            message.success("Cleaner berhasil dibuat");
            queryClient.invalidateQueries({ queryKey: ["admin-cleaners"] });
            handleCloseModal();
        },
        onError: () => message.error("Gagal membuat cleaner"),
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Partial<CleanerFormData>;
        }) => cleanersApi.update(id, data),
        onSuccess: () => {
            message.success("Cleaner berhasil diperbarui");
            queryClient.invalidateQueries({ queryKey: ["admin-cleaners"] });
            handleCloseModal();
        },
        onError: () => message.error("Gagal memperbarui cleaner"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => cleanersApi.delete(id),
        onSuccess: () => {
            message.success("Cleaner berhasil dihapus");
            queryClient.invalidateQueries({ queryKey: ["admin-cleaners"] });
        },
        onError: () => message.error("Gagal menghapus cleaner"),
    });

    const handleOpenModal = (cleaner?: Cleaner) => {
        if (cleaner) {
            setEditingCleaner(cleaner);
            form.setFieldsValue({
                name: cleaner.user?.name,
                email: cleaner.user?.email,
                phone: cleaner.phone,
                status: cleaner.status,
            });
        } else {
            setEditingCleaner(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCleaner(null);
        form.resetFields();
    };

    const handleSubmit = async (values: CleanerFormData) => {
        if (editingCleaner) {
            updateMutation.mutate({ id: editingCleaner.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const columns: ColumnsType<Cleaner> = [
        {
            title: "Nama",
            dataIndex: ["user", "name"],
            key: "name",
            render: (name: string) => (
                <span className="font-semibold">{name}</span>
            ),
        },
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email",
        },
        {
            title: "Telepon",
            dataIndex: "phone",
            key: "phone",
            render: (phone: string) => phone || "-",
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
                        title="Hapus cleaner ini?"
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
                <h1 className="text-2xl font-bold">Manajemen Cleaner</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenModal()}
                >
                    Tambah Cleaner
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data?.data?.data || []}
                rowKey="id"
                loading={isLoading}
            />

            <Modal
                title={editingCleaner ? "Edit Cleaner" : "Tambah Cleaner"}
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
                        label="Nama"
                        rules={[
                            { required: true, message: "Nama wajib diisi" },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Email wajib diisi" },
                            {
                                type: "email",
                                message: "Format email tidak valid",
                            },
                        ]}
                    >
                        <Input disabled={!!editingCleaner} />
                    </Form.Item>

                    {!editingCleaner && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: "Password wajib diisi",
                                },
                                {
                                    min: 8,
                                    message: "Password minimal 8 karakter",
                                },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Form.Item name="phone" label="Telepon">
                        <Input />
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
                                {editingCleaner ? "Simpan" : "Tambah"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
