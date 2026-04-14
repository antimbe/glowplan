import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, getBaseUrl } from '@/lib/mail';
import { EmailTemplates } from '@/lib/mail/templates';

export async function POST(req: Request) {
    try {
        const { type, reviewId } = await req.json();

        if (!type || !reviewId) {
            return NextResponse.json({ error: "Missing type or reviewId" }, { status: 400 });
        }

        const supabase = await createClient();
        const baseUrl = getBaseUrl();

        const { data: review, error } = await supabase.from('reviews').select(`
            *,
            establishments(name, email, slug),
            client_profiles(first_name, last_name, user_id),
            appointments(services(name))
        `).eq('id', reviewId).single();

        if (error || !review) {
            console.error("Could not fetch review for email notification:", error);
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        if (type === 'new_review') {
            if (!review.establishments?.email) {
                return NextResponse.json({ error: "Establishment has no email" }, { status: 400 });
            }

            const template = EmailTemplates.newReviewPro({
                provider_name: review.establishments.name,
                client_name: review.client_profiles 
                    ? `${review.client_profiles.first_name} ${review.client_profiles.last_name?.charAt(0)}.` 
                    : review.client_name || "Un client",
                service_name: Array.isArray(review.appointments?.services) ? review.appointments.services[0]?.name : review.appointments?.services?.name,
                rating: review.rating,
                comment: review.comment || undefined,
                dashboard_link: `${baseUrl}/dashboard/business?tab=avis`
            });

            await sendEmail({
                to: review.establishments.email,
                subject: template.subject,
                html: template.html
            });

            return NextResponse.json({ success: true, message: "Email sent to pro" });
        }

        if (type === 'new_reply') {
            if (!review.client_profiles?.user_id) {
                return NextResponse.json({ error: "Client profile user_id not found" }, { status: 400 });
            }

            // We need to fetch the user's actual email via Admin API because auth.users is protected
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(review.client_profiles.user_id);
            
            if (authError || !authUser?.user?.email) {
                console.error("Could not fetch client auth email:", authError);
                return NextResponse.json({ error: "Client email not found" }, { status: 400 });
            }

            const slug = review.establishments.slug || review.establishment_id;
            const template = EmailTemplates.reviewReplyClient({
                client_name: review.client_profiles.first_name || "Client",
                provider_name: review.establishments.name,
                provider_reply: review.provider_reply || "",
                establishment_link: `${baseUrl}/establishment/${slug}#avis`
            });

            await sendEmail({
                to: authUser.user.email,
                subject: template.subject,
                html: template.html
            });

            return NextResponse.json({ success: true, message: "Email sent to client" });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    } catch (error: any) {
        console.error("Error sending review notification:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
