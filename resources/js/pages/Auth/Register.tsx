import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message, Divider } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";

const { Title, Text } = Typography;

export function Register() {
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
    }) => {
        setLoading(true);
        try {
            await register(
                values.name,
                values.email,
                values.password,
                values.password_confirmation
            );
            message.success("Registrasi berhasil!");
            navigate("/customer");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err.response?.data?.message ||
                    "Registrasi gagal. Silakan coba lagi."
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
                    "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #93c5fd 100%)",
            }}
        >
            <Card
                className="w-full max-w-md shadow-2xl"
                style={{ borderRadius: 16 }}
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserOutlined className="text-2xl text-white" />
                    </div>
                    <Title level={2} className="!mb-2">
                        Daftar Akun
                    </Title>
                    <Text type="secondary">Buat akun CleanService baru</Text>
                </div>

                <Form
                    name="register"
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

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="w-full h-12 text-lg font-semibold"
                            style={{
                                background:
                                    "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)",
                                borderRadius: 8,
                            }}
                        >
                            Daftar
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
                        <Link to="/register/admin">
                            <Button type="link" size="large">
                                Daftar sebagai Admin
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}
