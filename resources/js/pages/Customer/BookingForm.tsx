import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Form,
    Select,
    Input,
    Button,
    Card,
    Steps,
    message,
    Spin,
    Empty,
    Tag,
} from "antd";
import {
    CalendarOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { servicesApi } from "../../api/services";
import { schedulesApi } from "../../api/schedules";
import { bookingsApi } from "../../api/bookings";
import type { Service, Schedule, BookingFormData } from "../../types";
import dayjs from "dayjs";

export function BookingForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<number | null>(
        null
    );
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const serviceIdFromUrl = searchParams.get("service");

    const { data: servicesData, isLoading: servicesLoading } = useQuery({
        queryKey: ["public-services"],
        queryFn: () => servicesApi.getPublicServices(),
    });

    const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
        queryKey: ["available-schedules"],
        queryFn: () => schedulesApi.getAvailable(),
    });

    const createBookingMutation = useMutation({
        mutationFn: (data: BookingFormData) =>
            bookingsApi.customer.create(data),
        onSuccess: (response) => {
            message.success("Booking berhasil dibuat!");
            navigate("/customer/bookings");
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err.response?.data?.message || "Gagal membuat booking"
            );
        },
    });

    // Set service from URL if provided
    useState(() => {
        if (serviceIdFromUrl) {
            setSelectedService(Number(serviceIdFromUrl));
        }
    });

    const handleNext = () => {
        if (currentStep === 0 && !selectedService) {
            message.warning("Pilih layanan terlebih dahulu");
            return;
        }
        if (currentStep === 1 && !selectedSchedule) {
            message.warning("Pilih jadwal terlebih dahulu");
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    const handleSubmit = async (values: { address: string }) => {
        if (!selectedService || !selectedSchedule) return;

        createBookingMutation.mutate({
            service_id: selectedService,
            schedule_id: selectedSchedule,
            address: values.address,
        });
    };

    const services = servicesData?.data || [];
    const schedules = (schedulesData?.data || []).filter(
        (s: Schedule) => s.status === "available"
    );
    const selectedServiceData = services.find(
        (s: Service) => s.id === selectedService
    );

    const steps = [
        { title: "Pilih Layanan", icon: <CheckCircleOutlined /> },
        { title: "Pilih Jadwal", icon: <CalendarOutlined /> },
        { title: "Alamat", icon: <EnvironmentOutlined /> },
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Booking Layanan</h1>

            <Steps current={currentStep} items={steps} className="mb-8" />

            <Card className="shadow-md">
                {/* Step 1: Select Service */}
                {currentStep === 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Pilih Layanan
                        </h3>
                        {servicesLoading ? (
                            <Spin />
                        ) : services.length === 0 ? (
                            <Empty description="Tidak ada layanan" />
                        ) : (
                            <Select
                                className="w-full"
                                placeholder="Pilih layanan..."
                                value={selectedService}
                                onChange={setSelectedService}
                                size="large"
                            >
                                {services.map((service: Service) => (
                                    <Select.Option
                                        key={service.id}
                                        value={service.id}
                                    >
                                        <div className="flex justify-between">
                                            <span>{service.name}</span>
                                            <span className="text-green-600">
                                                Rp{" "}
                                                {service.price?.toLocaleString(
                                                    "id-ID"
                                                )}
                                            </span>
                                        </div>
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </div>
                )}

                {/* Step 2: Select Schedule */}
                {currentStep === 1 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Pilih Jadwal
                        </h3>
                        {schedulesLoading ? (
                            <Spin />
                        ) : schedules.length === 0 ? (
                            <Empty description="Tidak ada jadwal tersedia" />
                        ) : (
                            <div className="space-y-2">
                                {schedules.map((schedule: Schedule) => (
                                    <Card
                                        key={schedule.id}
                                        size="small"
                                        className={`cursor-pointer transition-all ${
                                            selectedSchedule === schedule.id
                                                ? "border-blue-500 bg-blue-50"
                                                : "hover:border-blue-300"
                                        }`}
                                        onClick={() =>
                                            setSelectedSchedule(schedule.id)
                                        }
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-semibold">
                                                    {dayjs(
                                                        schedule.date
                                                    ).format(
                                                        "dddd, DD MMM YYYY"
                                                    )}
                                                </span>
                                                <span className="ml-4 text-gray-500">
                                                    {schedule.start_time} -{" "}
                                                    {schedule.end_time}
                                                </span>
                                            </div>
                                            <Tag color="green">
                                                Tersedia{" "}
                                                {schedule.remaining_capacity}{" "}
                                                slot
                                            </Tag>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Address */}
                {currentStep === 2 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Alamat Lengkap
                        </h3>

                        {/* Summary */}
                        <Card size="small" className="mb-4 bg-gray-50">
                            <p>
                                <strong>Layanan:</strong>{" "}
                                {selectedServiceData?.name}
                            </p>
                            <p>
                                <strong>Harga:</strong> Rp{" "}
                                {selectedServiceData?.price?.toLocaleString(
                                    "id-ID"
                                )}
                            </p>
                        </Card>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                        >
                            <Form.Item
                                name="address"
                                label="Alamat"
                                rules={[
                                    {
                                        required: true,
                                        message: "Alamat wajib diisi",
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Masukkan alamat lengkap..."
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={createBookingMutation.isPending}
                                className="w-full"
                                size="large"
                            >
                                Konfirmasi Booking
                            </Button>
                        </Form>
                    </div>
                )}

                {/* Navigation */}
                {currentStep < 2 && (
                    <div className="mt-6 flex justify-between">
                        <Button
                            disabled={currentStep === 0}
                            onClick={() => setCurrentStep(currentStep - 1)}
                        >
                            Kembali
                        </Button>
                        <Button type="primary" onClick={handleNext}>
                            Lanjut
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
