import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const startTime = Date.now();
    // Query a single record from Supabase to register active database activity
    const { data, error } = await supabase.from("users").select("id").limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      console.warn("[Keep-Alive Cron] Supabase query returned an error:", error.message);
      return NextResponse.json(
        {
          success: false,
          service: "Supabase Keep-Alive Heartbeat",
          status: "Database query error",
          error: error.message,
          timestamp: new Date().toISOString(),
          latency: `${latency}ms`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      service: "Supabase Keep-Alive Heartbeat",
      status: "Supabase project is active and responding",
      timestamp: new Date().toISOString(),
      latency: `${latency}ms`,
      recordsTouched: data ? data.length : 0,
    });
  } catch (err: any) {
    console.error("[Keep-Alive Cron] Exception:", err);
    return NextResponse.json(
      {
        success: false,
        service: "Supabase Keep-Alive Heartbeat",
        error: err?.message || "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
