-- Migration to enforce notification preferences in appointment and review triggers

CREATE OR REPLACE FUNCTION notify_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
    est_name TEXT;
    owner_id UUID;
    prefs RECORD;
BEGIN
    SELECT name, user_id INTO est_name, owner_id FROM establishments WHERE id = NEW.establishment_id;
    
    -- Load preferences for the establishment owner (default to true if not found)
    SELECT * INTO prefs FROM notification_preferences WHERE user_id = owner_id;
    IF NOT FOUND THEN
        -- Fallback if row doesn't exist
        prefs := row(owner_id, true, true, true, true, true, now(), now())::notification_preferences;
    END IF;

    -- New Appointment
    IF (TG_OP = 'INSERT') THEN
        IF prefs.app_new_booking THEN
            INSERT INTO notifications (establishment_id, type, title, content, link)
            VALUES (
                NEW.establishment_id, 
                'appointment_new', 
                'Nouveau rendez-vous', 
                NEW.client_first_name || ' ' || NEW.client_last_name || ' a réservé une séance.',
                '/dashboard/agenda'
            );
        END IF;
    
    -- Status Change
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.status != NEW.status) THEN
            IF (NEW.status = 'cancelled') THEN
                IF prefs.app_new_booking THEN
                    INSERT INTO notifications (establishment_id, type, title, content, link)
                    VALUES (
                        NEW.establishment_id, 
                        'appointment_cancelled', 
                        'Rendez-vous annulé', 
                        NEW.client_first_name || ' ' || NEW.client_last_name || ' a annulé son rendez-vous.',
                        '/dashboard/agenda'
                    );
                END IF;
            ELSIF (NEW.status = 'confirmed' AND OLD.status = 'pending_deposit') THEN
                IF prefs.app_deposit THEN
                    INSERT INTO notifications (establishment_id, type, title, content, link)
                    VALUES (
                        NEW.establishment_id, 
                        'deposit_paid', 
                        'Acompte reçu', 
                        'L''acompte pour ' || NEW.client_first_name || ' ' || NEW.client_last_name || ' a été validé.',
                        '/dashboard/agenda'
                    );
                END IF;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_review_new()
RETURNS TRIGGER AS $$
DECLARE
    owner_id UUID;
    prefs RECORD;
BEGIN
    SELECT user_id INTO owner_id FROM establishments WHERE id = NEW.establishment_id;
    
    SELECT * INTO prefs FROM notification_preferences WHERE user_id = owner_id;
    IF NOT FOUND THEN
        prefs := row(owner_id, true, true, true, true, true, now(), now())::notification_preferences;
    END IF;

    IF prefs.app_review THEN
        INSERT INTO notifications (establishment_id, type, title, content, link)
        VALUES (
            NEW.establishment_id, 
            'review_new', 
            'Nouvel avis reçu', 
            'Un client a laissé une note de ' || NEW.rating || ' étoiles.',
            '/dashboard/business'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
