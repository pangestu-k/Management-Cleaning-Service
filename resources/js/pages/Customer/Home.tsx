import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Button, Typography } from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    SafetyCertificateOutlined,
    ArrowRightOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const features = [
    {
        icon: <CheckCircleOutlined className="text-4xl text-blue-500" />,
        title: "Layanan Profesional",
        description: "Tim cleaner terlatih dan berpengalaman",
    },
    {
        icon: <ClockCircleOutlined className="text-4xl text-green-500" />,
        title: "Jadwal Fleksibel",
        description: "Pilih waktu yang sesuai dengan kebutuhan Anda",
    },
    {
        icon: (
            <SafetyCertificateOutlined className="text-4xl text-purple-500" />
        ),
        title: "Terjamin & Aman",
        description: "Kepuasan pelanggan adalah prioritas kami",
    },
];

export function Home() {
    const navigate = useNavigate();

    return (
        <div>
            {/* Hero Section */}
            <div
                className="text-center py-16 px-4 rounded-xl mb-8"
                style={{
                    background:
                        "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                }}
            >
                <Title className="!text-white !mb-4">
                    Layanan Kebersihan Profesional
                </Title>
                <Paragraph className="!text-blue-100 text-lg max-w-2xl mx-auto">
                    Bersihkan rumah atau kantor Anda dengan layanan cleaning
                    service terpercaya. Booking online, cepat, dan mudah.
                </Paragraph>
                <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate("/customer/services")}
                    className="mt-4"
                    style={{
                        background: "white",
                        color: "#1e3a8a",
                        fontWeight: "bold",
                    }}
                >
                    Lihat Layanan
                </Button>
            </div>

            {/* Features */}
            <Row gutter={[24, 24]} className="mb-8">
                {features.map((feature, index) => (
                    <Col xs={24} md={8} key={index}>
                        <Card className="text-center h-full shadow-md hover:shadow-lg transition-shadow">
                            <div className="mb-4">{feature.icon}</div>
                            <Title level={4}>{feature.title}</Title>
                            <Paragraph type="secondary">
                                {feature.description}
                            </Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* CTA Section */}
            <Card className="text-center bg-gradient-to-r from-blue-50 to-blue-100">
                <Title level={3}>Siap untuk memesan?</Title>
                <Paragraph type="secondary">
                    Pilih layanan yang Anda butuhkan dan booking sekarang!
                </Paragraph>
                <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate("/customer/services")}
                >
                    Booking Sekarang
                </Button>
            </Card>
        </div>
    );
}
