import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message, Divider, Alert } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";

const { Title, Text } = Typography;

export function RegisterAdmin() {
    const [loading, setLoading] = useState(false);
    const { registerAdmin } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        admin_secret_key: string;
    }) => {
        setLoading(true);
        try {
            await registerAdmin(
                values.name,
                values.email,
                values.password,
                values.password_confirmation,
                values.admin_secret_key
            );
            message.success("Registrasi admin berhasil!");
            navigate("/admin");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err.response?.data?.message ||
                    "Registrasi admin gagal. Silakan coba lagi."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                background:
                    "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
            }}
        >
            <Card
                className="w-full max-w-md shadow-2xl"
                style={{ borderRadius: 16 }}
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserOutlined className="text-2xl text-white" />
                    </div>
                    <Title level={2} className="!mb-2">
                        Daftar Admin
                    </Title>
                    <Text type="secondary">Buat akun administrator baru</Text>
                </div>

                <Alert
                    message="Admin Registration"
                    description="Anda memerlukan admin secret key untuk membuat akun admin. Hubungi administrator sistem untuk mendapatkan secret key."
                    type="warning"
                    showIcon
                    className="mb-6"
                />

                <Form
                    name="registerAdmin"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="name"
                        rules={[
                            { required: true, message: "Nama wajib diisi!" },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Nama Lengkap"
                        />
                    </Form.Item>

                    <Form.Item
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
                            prefix={<MailOutlined className="text-gray-400" />}
                            placeholder="Email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Password wajib diisi!",
                            },
                            { min: 8, message: "Password minimal 8 karakter!" },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password_confirmation"
                        dependencies={["password"]}
                        rules={[
                            {
                                required: true,
                                message: "Konfirmasi password wajib diisi!",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        getFieldValue("password") === value
                                    ) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("Password tidak cocok!")
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Konfirmasi Password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="admin_secret_key"
                        rules={[
                            {
                                required: true,
                                message: "Admin secret key wajib diisi!",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<SafetyOutlined className="text-gray-400" />}
                            placeholder="Admin Secret Key"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="w-full h-12 text-lg font-semibold"
                            style={{
                                background:
                                    "linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)",
                                borderRadius: 8,
                            }}
                        >
                            Daftar sebagai Admin
                        </Button>
                    </Form.Item>
                </Form>

                <Divider>
                    <Text type="secondary">Sudah punya akun?</Text>
                </Divider>

                <div className="text-center space-y-2">
                    <Link to="/login">
                        <Button type="link" size="large">
                            Masuk
                        </Button>
                    </Link>
                    <div>
                        <Text type="secondary">Atau </Text>
                        <Link to="/register">
                            <Button type="link" size="large">
                                Daftar sebagai Customer
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}

