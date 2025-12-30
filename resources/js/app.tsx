import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import idID from "antd/locale/id_ID";

import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/Layout/AdminLayout";
import { CustomerLayout } from "./components/Layout/CustomerLayout";
import { CleanerLayout } from "./components/Layout/CleanerLayout";

// Auth Pages
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { RegisterAdmin } from "./pages/Auth/RegisterAdmin";

// Admin Pages
import { Dashboard } from "./pages/Admin/Dashboard";
import { Services } from "./pages/Admin/Services";
import { Cleaners } from "./pages/Admin/Cleaners";
import { Schedules } from "./pages/Admin/Schedules";
import { Bookings as AdminBookings } from "./pages/Admin/Bookings";
import { Profile } from "./pages/Profile";

// Customer Pages
import { Home } from "./pages/Customer/Home";
import { ServiceList } from "./pages/Customer/ServiceList";
import { BookingForm } from "./pages/Customer/BookingForm";
import { MyBookings } from "./pages/Customer/MyBookings";
import { BookingDetail } from "./pages/Customer/BookingDetail";

// Cleaner Pages
import { CleanerBookings } from "./pages/Cleaner/Bookings";
import { CleanerSchedule } from "./pages/Cleaner/Schedule";

import "../css/app.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider locale={idID}>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/register/admin"
                                element={<RegisterAdmin />}
                            />

                            {/* Admin Routes */}
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                        <AdminLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<Dashboard />} />
                                <Route path="services" element={<Services />} />
                                <Route path="cleaners" element={<Cleaners />} />
                                <Route
                                    path="schedules"
                                    element={<Schedules />}
                                />
                                <Route
                                    path="bookings"
                                    element={<AdminBookings />}
                                />
                                <Route path="profile" element={<Profile />} />
                            </Route>

                            {/* Customer Routes */}
                            <Route
                                path="/customer"
                                element={
                                    <ProtectedRoute allowedRoles={["customer"]}>
                                        <CustomerLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<Home />} />
                                <Route
                                    path="services"
                                    element={<ServiceList />}
                                />
                                <Route
                                    path="booking"
                                    element={<BookingForm />}
                                />
                                <Route
                                    path="bookings"
                                    element={<MyBookings />}
                                />
                                <Route
                                    path="bookings/:id"
                                    element={<BookingDetail />}
                                />
                                <Route path="profile" element={<Profile />} />
                            </Route>

                            {/* Cleaner Routes */}
                            <Route
                                path="/cleaner"
                                element={
                                    <ProtectedRoute allowedRoles={["cleaner"]}>
                                        <CleanerLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<CleanerSchedule />} />
                                <Route
                                    path="bookings"
                                    element={<CleanerBookings />}
                                />
                                <Route path="profile" element={<Profile />} />
                            </Route>

                            {/* Default redirect */}
                            <Route
                                path="/"
                                element={<Navigate to="/login" replace />}
                            />
                            <Route
                                path="*"
                                element={<Navigate to="/login" replace />}
                            />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </ConfigProvider>
        </QueryClientProvider>
    );
}

createRoot(document.getElementById("app")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
