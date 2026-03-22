-- Update notification links to include date and view parameters
CREATE OR REPLACE FUNCTION notify_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
    client_name_val TEXT;
    target_date TEXT;
BEGIN
    client_name_val := COALESCE(NEW.client_first_name || ' ' || NEW.client_last_name, NEW.client_name, 'Un client');
    target_date := TO_CHAR(NEW.start_time, 'YYYY-MM-DD');

    -- New Appointment
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO notifications (establishment_id, type, title, content, link)
        VALUES (
            NEW.establishment_id, 
            'appointment_new', 
            'Nouveau rendez-vous', 
            client_name_val || ' a réservé une séance.',
            '/dashboard/agenda?date=' || target_date || '&view=day'
        );
    
    -- Status Change
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.status != NEW.status) THEN
            IF (NEW.status = 'cancelled') THEN
                INSERT INTO notifications (establishment_id, type, title, content, link)
                VALUES (
                    NEW.establishment_id, 
                    'appointment_cancelled', 
                    'Rendez-vous annulé', 
                    client_name_val || ' a annulé son rendez-vous.',
                    '/dashboard/agenda?date=' || target_date || '&view=day'
                );
            ELSIF (NEW.status = 'confirmed' AND OLD.status = 'pending_deposit') THEN
                INSERT INTO notifications (establishment_id, type, title, content, link)
                VALUES (
                    NEW.establishment_id, 
                    'deposit_paid', 
                    'Acompte reçu', 
                    'L''acompte pour ' || client_name_val || ' a été validé.',
                    '/dashboard/agenda?date=' || target_date || '&view=day'
                );
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
