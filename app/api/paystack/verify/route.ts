import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }

  try {
    const result = await verifyTransaction(reference);

    // Uses the admin client deliberately — regular users have no UPDATE
    // policy on orders (see supabase/migrations/0001_init.sql), and that's
    // by design. The payment being real, proven by verifyTransaction()
    // actually succeeding against Paystack's API, is the authorization for
    // this write — requiring a signed-in session on top of that just adds
    // a point of failure without adding real security.
    const supabase = createAdminClient();
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "in_escrow", paid_at: result.paidAt })
      .eq("paystack_reference", reference);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ status: "in_escrow", ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 402 });
  }
}


// import { NextRequest, NextResponse } from "next/server";
// import { verifyTransaction } from "@/lib/paystack";
// import { createAdminClient } from "@/lib/supabase/admin";
// import { createClient } from "@/lib/supabase/server";

// export async function GET(req: NextRequest) {
//   const reference = req.nextUrl.searchParams.get("reference");
//   if (!reference) {
//     return NextResponse.json({ error: "reference is required" }, { status: 400 });
//   }

//   try {
//     const result = await verifyTransaction(reference);

//     const supabase = await createClient();
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       return NextResponse.json({ error: "You need to be signed in to confirm this payment." }, { status: 401 });
//     }

//     const updatePayload = { status: "in_escrow" as const, paid_at: result.paidAt };

//     const { error: updateError } = await supabase
//       .from("orders")
//       .update(updatePayload)
//       .eq("paystack_reference", reference)
//       .eq("buyer_id", user.id);

//     if (updateError) {
//       const adminSupabase = createAdminClient();
//       const { error: adminUpdateError } = await adminSupabase
//         .from("orders")
//         .update(updatePayload)
//         .eq("paystack_reference", reference);

//       if (adminUpdateError) {
//         throw new Error(adminUpdateError.message);
//       }
//     }

//     return NextResponse.json({ status: "in_escrow", ...result });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 402 });
//   }
// }
