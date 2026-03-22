-- Migration to add functional notifications system
-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'appointment_new', 'appointment_cancelled', 'deposit_paid', 'review_new'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Les professionnels peuvent voir les notifications de leur établissement
CREATE POLICY "Establishment owners can view notifications" ON notifications
  FOR SELECT USING (
    establishment_id IN (
      SELECT id FROM establishments WHERE user_id = auth.uid()
    )
  );

-- Les professionnels peuvent marquer comme lu (update)
CREATE POLICY "Establishment owners can update notifications" ON notifications
  FOR UPDATE USING (
    establishment_id IN (
      SELECT id FROM establishments WHERE user_id = auth.uid()
    )
  );

-- 3. Notification Triggers

-- Trigger Function for Appointments
CREATE OR REPLACE FUNCTION notify_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
    est_name TEXT;
BEGIN
    SELECT name INTO est_name FROM establishments WHERE id = NEW.establishment_id;

    -- New Appointment
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO notifications (establishment_id, type, title, content, link)
        VALUES (
            NEW.establishment_id, 
            'appointment_new', 
            'Nouveau rendez-vous', 
            NEW.client_first_name || ' ' || NEW.client_last_name || ' a réservé une séance.',
            '/dashboard/agenda'
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
                    NEW.client_first_name || ' ' || NEW.client_last_name || ' a annulé son rendez-vous.',
                    '/dashboard/agenda'
                );
            ELSIF (NEW.status = 'confirmed' AND OLD.status = 'pending_deposit') THEN
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function for Reviews
CREATE OR REPLACE FUNCTION notify_review_new()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (establishment_id, type, title, content, link)
    VALUES (
        NEW.establishment_id, 
        'review_new', 
        'Nouvel avis reçu', 
        'Un client a laissé une note de ' || NEW.rating || ' étoiles.',
        '/dashboard/business'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Triggers
CREATE TRIGGER trigger_notify_appointment
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION notify_appointment_change();

CREATE TRIGGER trigger_notify_review
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION notify_review_new();
