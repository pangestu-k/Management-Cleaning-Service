import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message, Divider } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";

const { Title, Text } = Typography;

export function Login() {
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            await login(values.email, values.password);
            message.success("Login berhasil!");

            // Get user after login and redirect based on role
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const redirectPath =
                storedUser.role === "admin"
                    ? "/admin"
                    : storedUser.role === "cleaner"
                    ? "/cleaner"
                    : "/customer";
            navigate(redirectPath);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err.response?.data?.message ||
                    "Login gagal. Cek email dan password Anda."
            );
        } finally {
            setLoading(false);
        }
    };

    // If already logged in, redirect
    if (user) {
        const redirectPath =
            user.role === "admin"
                ? "/admin"
                : user.role === "cleaner"
                ? "/cleaner"
                : "/customer";
        navigate(redirectPath);
        return null;
    }

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
                        Selamat Datang
                    </Title>
                    <Text type="secondary">
                        Masuk ke akun CleanService Anda
                    </Text>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
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
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Password"
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
                            Masuk
                        </Button>
                    </Form.Item>
                </Form>

                <Divider>
                    <Text type="secondary">Belum punya akun?</Text>
                </Divider>

                <div className="text-center">
                    <Link to="/register">
                        <Button type="link" size="large">
                            Daftar Sekarang
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
