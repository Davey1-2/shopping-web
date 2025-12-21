// Debug script - Run this in browser console to reset everything
// Copy and paste into browser console (F12)

console.log("🔧 Starting frontend debug and reset...");

// 1. Clear localStorage
console.log("1️⃣ Clearing localStorage...");
localStorage.clear();
console.log("✅ localStorage cleared");

// 2. Check current config
console.log("2️⃣ Setting correct API config...");
const correctConfig = {
  useMockData: false,
  apiBaseUrl: "http://localhost:3001",
  userIdentity: "frontend-user",
};
localStorage.setItem("app-config", JSON.stringify(correctConfig));
console.log("✅ Config set:", correctConfig);

// 3. Test backend directly
console.log("3️⃣ Testing backend connection...");
fetch("http://localhost:3001/health")
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Backend health check:", data);

    // 4. Test create endpoint
    console.log("4️⃣ Testing create endpoint...");
    return fetch("http://localhost:3001/shoppingList/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-identity": "debug-user",
      },
      body: JSON.stringify({
        name: "Debug Test List " + Date.now(),
        category: "Debug",
      }),
    });
  })
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Create test successful:", data);
    console.log("🎉 Backend is working! Now reload the page (Ctrl+Shift+R)");
  })
  .catch((err) => {
    console.error("❌ Backend test failed:", err);
    console.log("⚠️ Make sure Docker backend is running:");
    console.log("   cd src/backend && docker-compose ps");
  });
