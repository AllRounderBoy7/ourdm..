# 🚀 OurDM - Complete Setup Guide

## ⚠️ Database Error Fix

Aapko ye error aa raha hai:
```
error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user
```

**Kyu aa raha hai?** 
- Google OAuth kaam kar raha hai ✅
- Lekin database tables nahi bane hain ❌

---

## ✅ STEP-BY-STEP FIX (5 minutes)

### **Step 1: Supabase Dashboard kholo**

1. Browser mein jao: https://supabase.com/dashboard
2. Login karo
3. Apna project select karo: `nyevygppwrhadxegqqvl`

---

### **Step 2: SQL Editor kholo**

1. Left sidebar mein **"SQL Editor"** pe click karo
2. Ya directly jao: https://supabase.com/dashboard/project/nyevygppwrhadxegqqvl/sql

---

### **Step 3: SQL Code copy karo**

1. Is project mein **`QUICK_DATABASE_SETUP.sql`** file kholo
2. **Pura SQL code** copy karo (Ctrl+A, Ctrl+C)

---

### **Step 4: SQL Execute karo**

1. SQL Editor mein **"New Query"** button click karo
2. SQL code **paste** karo (Ctrl+V)
3. **"Run"** button pe click karo (ya Ctrl+Enter press karo)
4. Wait karo 10-15 seconds
5. Success message dikhega: **"Database setup completed successfully!"**

---

### **Step 5: Google OAuth Enable karo**

1. Left sidebar mein **"Authentication"** → **"Providers"** pe jao
2. Ya directly: https://supabase.com/dashboard/project/nyevygppwrhadxegqqvl/auth/providers
3. **"Google"** pe click karo
4. Toggle ko **ON** karo

**Google Cloud Console se credentials lao:**

1. Jao: https://console.cloud.google.com/apis/credentials
2. "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: **Web application**
4. **Authorized redirect URIs** mein add karo:
   ```
   https://nyevygppwrhadxegqqvl.supabase.co/auth/v1/callback
   ```
5. **Client ID** aur **Client Secret** copy karo
6. Wapas Supabase mein paste karo
7. **Save** karo

---

### **Step 6: Test karo!**

1. Apna app refresh karo
2. **"Continue with Google"** button pe click karo
3. Google account select karo
4. Login hoga ✅
5. Profile automatic create hoga ✅
6. Dashboard dikhega ✅

---

## 🎯 Agar Phir Bhi Error Aaye

### **Error 1: "Database error saving new user"**

**Fix:**
- Step 4 repeat karo (SQL fir se run karo)
- Check karo ki sab 11 tables bane hain
- Supabase → "Table Editor" → 11 tables dikhne chahiye

### **Error 2: "Invalid redirect URL"**

**Fix:**
- Supabase → Authentication → URL Configuration
- Add karo: 
  - Site URL: `http://localhost:5173` (development ke liye)
  - Redirect URLs: `http://localhost:5173/**`

### **Error 3: "OAuth provider not configured"**

**Fix:**
- Google OAuth phir se enable karo (Step 5)
- Credentials dobara check karo

---

## 📋 Database Tables (Check Karne Ke Liye)

Ye 11 tables ban jane chahiye:

1. ✅ **profiles** - User profiles
2. ✅ **friendships** - Friend requests
3. ✅ **chats** - Chat rooms
4. ✅ **chat_participants** - Who's in which chat
5. ✅ **messages** - All messages
6. ✅ **message_reactions** - Emoji reactions
7. ✅ **message_status** - Read receipts
8. ✅ **stories** - Instagram-like stories
9. ✅ **story_views** - Who viewed stories
10. ✅ **calls** - Call history
11. ✅ **call_participants** - Call members

**Kaise check karein?**
- Supabase → **Table Editor** pe jao
- Left sidebar mein sab tables dikhne chahiye

---

## 🔥 Features Jo Ab Kaam Karenge

### **✅ After Setup:**

1. **Google Login** - Gmail se instant login
2. **Auto Profile Creation** - First login pe profile ban jayega
3. **Real-time Messaging** - Instant message delivery
4. **Friend Requests** - Search aur add friends
5. **Online Status** - Kaun online hai dikhega
6. **Read Receipts** - Blue checkmarks
7. **Typing Indicators** - "Typing..." status
8. **Stories** - 24-hour Instagram-style stories
9. **Call History** - All calls saved
10. **Settings Sync** - Settings database mein save

---

## 🎨 Username System

**Instagram jaisa:**
- ❌ No phone numbers
- ✅ Username only (`@username`)
- ✅ Auto-generated from email
- ✅ Unique usernames
- ✅ Search by username
- ✅ Verified badges

**Example:**
- Email: `john.doe@gmail.com`
- Auto username: `johndoe` or `johndoe123`

---

## 🔐 Security (RLS Enabled)

**Row Level Security:**
- ✅ Users sirf apne friends dekh sakte hain
- ✅ Messages sirf participants dekh sakte hain
- ✅ Private data protected
- ✅ Read/Write permissions proper

---

## 📱 Mobile-Friendly

**Perfect on phones:**
- ✅ Responsive design
- ✅ Touch-optimized buttons
- ✅ Bottom navigation
- ✅ Swipe gestures ready
- ✅ PWA ready (install kar sakte ho)

---

## 🆘 Help Chahiye?

### **Check These:**

1. **Supabase Dashboard** - All green?
2. **SQL ran successfully?** - Success message dikha?
3. **Google OAuth enabled?** - Provider ON hai?
4. **Credentials correct?** - Client ID/Secret sahi hai?

### **Common Issues:**

| Problem | Solution |
|---------|----------|
| White screen after login | SQL run karo fir se |
| Login button not working | Google OAuth enable karo |
| "Invalid credentials" | Google credentials dobara check karo |
| No messages sending | Tables check karo (Table Editor) |
| Profile not created | Trigger check karo (SQL mein hai) |

---

## ✨ Final Checklist

Setup karne ke baad ye check karo:

- [ ] SQL successfully run hua
- [ ] 11 tables ban gaye
- [ ] Google OAuth enabled
- [ ] Redirect URL added
- [ ] App mein login kar paye
- [ ] Profile create hua
- [ ] Dashboard dikh raha hai

**Sab ✅ hai to app ready hai!** 🎉

---

## 🚀 Next Steps

1. **Login karo** - Google se sign in
2. **Profile complete karo** - Bio, avatar add karo
3. **Friends add karo** - Username search karke
4. **Messages bhejo** - Real-time chatting!
5. **Stories post karo** - 24-hour stories
6. **Settings explore karo** - 56 options!

---

## 📞 Troubleshooting

**Agar kuch nahi chal raha:**

1. Browser console kholo (F12)
2. Errors dekho
3. Supabase logs dekho:
   - Dashboard → Logs → Recent Logs
4. SQL Editor mein ye query run karo:
   ```sql
   SELECT * FROM profiles LIMIT 1;
   ```
   - Agar error aaye to tables nahi bane

**Quick Reset:**

```sql
-- Sab tables delete karo
DROP TABLE IF EXISTS public.call_participants CASCADE;
DROP TABLE IF EXISTS public.calls CASCADE;
DROP TABLE IF EXISTS public.story_views CASCADE;
DROP TABLE IF EXISTS public.stories CASCADE;
DROP TABLE IF EXISTS public.message_status CASCADE;
DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_participants CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Fir QUICK_DATABASE_SETUP.sql fir se run karo
```

---

## ✅ Done!

Ab app **100% real backend** ke sath kaam kar raha hai!

- ❌ No fake data
- ✅ Real Supabase
- ✅ Real authentication
- ✅ Real-time updates
- ✅ Production ready

**Happy Chatting!** 💬🎉
