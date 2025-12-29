import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Row, Col, Button, Tag, Spin, Empty } from "antd";
import { ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { servicesApi } from "../../api/services";
import type { Service } from "../../types";

export function ServiceList() {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["public-services"],
        queryFn: () => servicesApi.getPublicServices(),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    const services = data?.data || [];

    if (services.length === 0) {
        return <Empty description="Tidak ada layanan tersedia" />;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Pilih Layanan</h1>

            <Row gutter={[16, 16]}>
                {services.map((service: Service) => (
                    <Col xs={24} sm={12} lg={8} key={service.id}>
                        <Card
                            className="h-full shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                            actions={[
                                <Button
                                    type="primary"
                                    onClick={() =>
                                        navigate(
                                            `/customer/booking?service=${service.id}`
                                        )
                                    }
                                >
                                    Pilih Layanan
                                </Button>,
                            ]}
                        >
                            <h3 className="text-lg font-bold mb-2">
                                {service.name}
                            </h3>
                            <p className="text-gray-500 mb-4 min-h-[48px]">
                                {service.description ||
                                    "Layanan kebersihan profesional"}
                            </p>
                            <div className="flex justify-between items-center">
                                <Tag color="green" icon={<DollarOutlined />}>
                                    Rp {service.price?.toLocaleString("id-ID")}
                                </Tag>
                                <Tag icon={<ClockCircleOutlined />}>
                                    {service.duration_minutes} menit
                                </Tag>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
