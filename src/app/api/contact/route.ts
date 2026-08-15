import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, organization, message } = await req.json();

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: "Full Name, Email, and Message are required." },
        { status: 400 }
      );
    }

    console.log("New Contact Inquiry Received:", {
      fullName,
      email,
      phone,
      organization,
      message,
      timestamp: new Date().toISOString(),
    });

    // Optionally send email alert via Resend if API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "Beacon Contact Inquiry <notifications@beaconcapital.site>",
          to: ["admin@beaconcapital.site"],
          subject: `New Institutional Inquiry from ${fullName} (${organization || "Independent"})`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1a1c1c;">
              <h2 style="color: #af0017;">New Contact Submission - Beacon Capital</h2>
              <p><strong>Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || "N/A"}</p>
              <p><strong>Organization:</strong> ${organization || "N/A"}</p>
              <hr style="border: 1px solid #e2e2e2; margin: 20px 0;" />
              <p><strong>Message:</strong></p>
              <p style="background: #f9f9f9; padding: 15px; border: 1px solid #e2e2e2;">${message}</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send contact notification email via Resend:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out. An institutional advisor will respond within 24 hours.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
