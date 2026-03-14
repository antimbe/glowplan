import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testBooking() {
  const { data: { user } } = await supabase.auth.signInWithPassword({
    email: "jean.dupont@email.com",
    password: "password123" // I don't know the password, but maybe I don't need auth if the RPC takes anon?
  });
  
  // Actually, let's just use the server role key or just anon key
  // We can pass p_user_id = null
  const payload = [
    {
      service_id: "00000000-0000-0000-0000-000000000000", // Will fail but we want to see the error
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      client_name: "Test User",
      client_email: "test@test.com",
      client_phone: "0000000000",
      client_first_name: "Test",
      client_last_name: "User",
      client_profile_id: null
    }
  ];

  const { data, error } = await supabase.rpc("process_booking_cart", {
    p_establishment_id: "098c351a-69f9-49be-83cd-b4f8a07800cc",
    p_items: payload,
    p_user_id: null
  });

  console.log("Response:", { data, error });
}

testBooking();
