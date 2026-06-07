const supabaseUrl = "https://apmiabucenklyfaewoun.supabase.co";
const supabaseKey = "sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu";

console.log("Testing Razorpay Payment Links API directly...\n");

// Test with minimal fields
const payload = {
  amount: 10000, // 100 INR in paise
  currency: "INR",
};

console.log("Sending minimal request:");
console.log(JSON.stringify(payload, null, 2));
console.log("");

try {
  const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-link`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log("✅ Success!");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(`❌ Error ${response.status}:`);
    console.log(JSON.stringify(data, null, 2));
  }
} catch (err) {
  console.error("Network error:", err.message);
}
