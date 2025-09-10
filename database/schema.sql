-- MediConnect AI Database Schema
-- PostgreSQL Database for Telemedicine Platform

-- Create database (run this separately)
-- CREATE DATABASE mediconnect_ai;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'provider', 'admin');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE consultation_status AS ENUM ('waiting', 'active', 'ended', 'cancelled');
CREATE TYPE prescription_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('appointment', 'prescription', 'health_record', 'system', 'emergency');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');

-- Users table (base table for all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    phone_number VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Sri Lanka',
    preferred_language VARCHAR(10) DEFAULT 'en',
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    insurance_info JSONB,
    profile_picture_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Healthcare providers table
CREATE TABLE healthcare_providers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(50), -- Dr., Prof., etc.
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    years_of_experience INTEGER,
    education JSONB, -- Array of education details
    certifications JSONB, -- Array of certifications
    languages JSONB, -- Array of supported languages
    consultation_fee DECIMAL(10,2),
    availability_schedule JSONB, -- Weekly schedule
    bio TEXT,
    profile_picture_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_consultations INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    type VARCHAR(50) DEFAULT 'consultation', -- consultation, follow_up, emergency
    chief_complaint TEXT,
    notes TEXT,
    consultation_fee DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending',
    cancellation_reason TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_provider_datetime UNIQUE (provider_id, appointment_date, appointment_time)
);

-- Consultations table (video call sessions)
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    status consultation_status DEFAULT 'waiting',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_minutes INTEGER,
    consultation_notes TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    recording_url VARCHAR(500), -- If recording is enabled
    chat_transcript JSONB, -- Array of chat messages
    technical_issues TEXT,
    patient_satisfaction_rating INTEGER CHECK (patient_satisfaction_rating >= 1 AND patient_satisfaction_rating <= 5),
    provider_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health records table
CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES healthcare_providers(id),
    consultation_id UUID REFERENCES consultations(id),
    record_type VARCHAR(50) NOT NULL, -- vital_signs, lab_results, imaging, prescription, diagnosis
    title VARCHAR(200) NOT NULL,
    description TEXT,
    data JSONB, -- Structured data based on record type
    file_attachments JSONB, -- Array of file URLs
    date_recorded DATE DEFAULT CURRENT_DATE,
    is_critical BOOLEAN DEFAULT FALSE,
    tags JSONB, -- Array of tags for categorization
    privacy_level VARCHAR(20) DEFAULT 'private', -- private, provider_shared, emergency_shared
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id),
    prescription_date DATE DEFAULT CURRENT_DATE,
    status prescription_status DEFAULT 'active',
    medications JSONB NOT NULL, -- Array of medication objects
    instructions TEXT,
    duration_days INTEGER,
    refills_allowed INTEGER DEFAULT 0,
    refills_used INTEGER DEFAULT 0,
    pharmacy_name VARCHAR(200),
    pharmacy_contact VARCHAR(100),
    dispensed_date DATE,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority priority_level DEFAULT 'medium',
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    action_required BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    related_id UUID, -- ID of related record (appointment, prescription, etc.)
    metadata JSONB, -- Additional data
    sent_via JSONB, -- Methods used to send (email, sms, push)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Symptom assessments table
CREATE TABLE symptom_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    symptoms JSONB NOT NULL, -- Array of symptom objects
    severity_score INTEGER CHECK (severity_score >= 1 AND severity_score <= 10),
    duration VARCHAR(50),
    triggers JSONB, -- Array of potential triggers
    ai_assessment JSONB, -- AI-generated assessment results
    recommended_action VARCHAR(100), -- immediate_care, schedule_appointment, monitor, emergency
    urgency_level priority_level DEFAULT 'low',
    follow_up_appointment_id UUID REFERENCES appointments(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File uploads table
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_category VARCHAR(50), -- profile_picture, medical_document, prescription, lab_result
    related_id UUID, -- ID of related record
    is_public BOOLEAN DEFAULT FALSE,
    scan_status VARCHAR(20) DEFAULT 'pending', -- pending, clean, infected, failed
    encryption_key VARCHAR(255), -- If file is encrypted
    access_log JSONB, -- Array of access records
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Whether setting can be accessed by clients
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_name ON patients(first_name, last_name);
CREATE INDEX idx_providers_specialization ON healthcare_providers(specialization);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_consultations_appointment ON consultations(appointment_id);
CREATE INDEX idx_health_records_patient ON health_records(patient_id);
CREATE INDEX idx_health_records_type ON health_records(record_type);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON healthcare_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
('consultation_duration_default', '30', 'Default consultation duration in minutes', true),
('appointment_booking_advance_days', '30', 'Maximum days in advance appointments can be booked', true),
('appointment_cancellation_hours', '24', 'Minimum hours before appointment for cancellation', true),
('supported_languages', '["en", "si", "ta"]', 'Supported language codes', true),
('emergency_contact', '{"phone": "+94-11-1234567", "email": "emergency@mediconnect.lk"}', 'Emergency contact information', true),
('consultation_fees', '{"minimum": 500, "maximum": 5000, "currency": "LKR"}', 'Consultation fee ranges', true),
('file_upload_limits', '{"max_size_mb": 10, "allowed_types": ["pdf", "jpg", "jpeg", "png", "doc", "docx"]}', 'File upload restrictions', false);

-- Create view for appointment details
CREATE VIEW appointment_details AS
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.duration_minutes,
    a.status,
    a.type,
    a.chief_complaint,
    a.consultation_fee,
    a.payment_status,
    p.first_name as patient_first_name,
    p.last_name as patient_last_name,
    p.phone_number as patient_phone,
    hp.first_name as provider_first_name,
    hp.last_name as provider_last_name,
    hp.title as provider_title,
    hp.specialization as provider_specialization,
    a.created_at,
    a.updated_at
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN healthcare_providers hp ON a.provider_id = hp.id;

-- Create view for consultation summary
CREATE VIEW consultation_summary AS
SELECT 
    c.id,
    c.status,
    c.started_at,
    c.ended_at,
    c.duration_minutes,
    c.diagnosis,
    c.patient_satisfaction_rating,
    a.appointment_date,
    a.appointment_time,
    p.first_name as patient_first_name,
    p.last_name as patient_last_name,
    hp.first_name as provider_first_name,
    hp.last_name as provider_last_name,
    hp.specialization as provider_specialization
FROM consultations c
LEFT JOIN appointments a ON c.appointment_id = a.id
JOIN patients p ON c.patient_id = p.id
JOIN healthcare_providers hp ON c.provider_id = hp.id;
