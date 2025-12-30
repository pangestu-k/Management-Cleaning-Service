import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    Form,
    Input,
    Button,
    message,
    Descriptions,
    Divider,
    Space,
    Avatar,
    Tag,
    Spin,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api/auth";

export function Profile() {
    const { user, isLoading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(false);

    // Show loading if auth is still loading or user is not loaded yet
    if (authLoading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    const updateProfileMutation = useMutation({
        mutationFn: authApi.updateProfile,
        onSuccess: async (response) => {
            message.success("Profil berhasil diperbarui!");
            queryClient.setQueryData(["auth", "me"], response);
            setIsEditing(false);
            form.resetFields();
            
            // Update user in localStorage
            if (response.data?.user) {
                localStorage.setItem("user", JSON.stringify(response.data.user));
                // Reload page to update auth context
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err.response?.data?.message || "Gagal memperbarui profil"
            );
        },
    });

    const handleSubmit = (values: {
        name?: string;
        email?: string;
        password?: string;
        current_password?: string;
    }) => {
        // Only include fields that have values
        const updateData: {
            name?: string;
            email?: string;
            password?: string;
            current_password?: string;
        } = {};

        if (values.name && values.name !== user?.name) {
            updateData.name = values.name;
        }
        if (values.email && values.email !== user?.email) {
            updateData.email = values.email;
        }
        if (values.password) {
            updateData.password = values.password;
            updateData.current_password = values.current_password;
        }

        if (Object.keys(updateData).length === 0) {
            message.info("Tidak ada perubahan yang perlu disimpan.");
            setIsEditing(false);
            return;
        }

        updateProfileMutation.mutate(updateData);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>

            <Card className="shadow-md">
                {!isEditing ? (
                    <>
                        <div className="flex items-center gap-6 mb-6">
                            <Avatar
                                size={80}
                                icon={<UserOutlined />}
                                className="bg-blue-500"
                            />
                            <div>
                                <h2 className="text-xl font-bold mb-1">
                                    {user?.name}
                                </h2>
                                <p className="text-gray-500">{user?.email}</p>
                                <Tag
                                    color={
                                        user?.role === "admin"
                                            ? "red"
                                            : user?.role === "cleaner"
                                            ? "green"
                                            : "blue"
                                    }
                                    className="mt-2"
                                >
                                    {user?.role === "admin"
                                        ? "Administrator"
                                        : user?.role === "cleaner"
                                        ? "Cleaner"
                                        : "Customer"}
                                </Tag>
                            </div>
                        </div>

                        <Divider />

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Nama">
                                {user?.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {user?.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Role">
                                {user?.role === "admin"
                                    ? "Administrator"
                                    : user?.role === "cleaner"
                                    ? "Cleaner"
                                    : "Customer"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Terdaftar">
                                {user?.created_at
                                    ? new Date(
                                          user.created_at
                                      ).toLocaleDateString("id-ID", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })
                                    : "-"}
                            </Descriptions.Item>
                        </Descriptions>

                        <div className="mt-6">
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profil
                            </Button>
                        </div>
                    </>
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            name: user?.name,
                            email: user?.email,
                        }}
                    >
                        <Form.Item
                            label="Nama"
                            name="name"
                            rules={[
                                { required: true, message: "Nama wajib diisi!" },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Nama Lengkap"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Email wajib diisi!" },
                                {
                                    type: "email",
                                    message: "Format email tidak valid!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="Email"
                            />
                        </Form.Item>

                        <Divider>Ubah Password (Opsional)</Divider>

                        <Form.Item
                            label="Password Baru"
                            name="password"
                            rules={[
                                {
                                    min: 8,
                                    message: "Password minimal 8 karakter!",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Kosongkan jika tidak ingin mengubah"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password Lama"
                            name="current_password"
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (
                                            !getFieldValue("password") ||
                                            value
                                        ) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error(
                                                "Password lama wajib diisi jika ingin mengubah password!"
                                            )
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Masukkan password lama"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={updateProfileMutation.isPending}
                                >
                                    Simpan
                                </Button>
                                <Button onClick={() => setIsEditing(false)}>
                                    Batal
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                )}
            </Card>
        </div>
    );
}

