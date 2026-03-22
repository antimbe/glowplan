-- Migration to add appointment reminders tracking

CREATE TABLE IF NOT EXISTS appointment_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'email_24h', 'sms_24h', 'manual'
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Les propriétaires peuvent voir les rappels de leur établissement
CREATE POLICY "Establishment owners can view reminders" ON appointment_reminders
  FOR SELECT USING (
    establishment_id IN (
      SELECT id FROM establishments WHERE user_id = auth.uid()
    )
  );

-- Les propriétaires peuvent créer des rappels manuels pour leur établissement
CREATE POLICY "Establishment owners can insert reminders" ON appointment_reminders
  FOR INSERT WITH CHECK (
    establishment_id IN (
      SELECT id FROM establishments WHERE user_id = auth.uid()
    )
  );
