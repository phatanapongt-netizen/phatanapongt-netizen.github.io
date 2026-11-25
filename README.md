# วิธีทำ APK จาก Apps Script web app (GitHub Pages + PWABuilder)

## ขั้นที่ 0: แก้ Apps Script ก่อน (จำเป็น)

**0.1 อนุญาตให้ฝังใน iframe**: ในฟังก์ชัน `doGet` ให้เพิ่ม `.setXFrameOptionsMode(...)` ต่อท้าย

```javascript
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')   // หรือ createTemplateFromFile(...).evaluate()
    .setTitle('iBerry App')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

**0.2 ตั้งค่าการเข้าถึง**: Deploy → Manage deployments → ✏️ แก้ deployment เดิม
- Execute as: **Me**
- Who has access: **Anyone** (ถ้ามีให้เลือก)
- Version: **New version** → Deploy (ลิงก์ /exec เดิมจะไม่เปลี่ยน)

> ⚠️ ลิงก์นี้เป็นของ Google Workspace (iberrygroup.com) ถ้าตั้งเป็น "Anyone within iberrygroup.com"
> ผู้ใช้ต้องล็อกอิน ซึ่งมักใช้ไม่ได้ภายใน iframe ของแอป ถ้าเมนูไม่มีตัวเลือก "Anyone"
> แปลว่าผู้ดูแลระบบ Workspace ปิดไว้ ต้องขอให้แอดมินเปิดให้

**0.3 ทดสอบ**: เปิดลิงก์ /exec ในหน้าต่างไม่ระบุตัวตน (Incognito) ถ้าเข้าได้โดยไม่ต้องล็อกอินก็พร้อมแล้ว

## ขั้นที่ 1: อัปไฟล์ขึ้น GitHub Pages

1. สมัคร/ล็อกอิน github.com
2. สร้าง repository ใหม่ชื่อ **`<ชื่อผู้ใช้>.github.io`** (ต้องใช้ชื่อนี้ เพื่อให้ไฟล์ `.well-known` อยู่ที่ root ของโดเมน), ตั้งเป็น Public
3. กด **Add file → Upload files** แล้วลากไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้นไป
   **รวมถึงโฟลเดอร์ `.well-known` และไฟล์ `.nojekyll`** (ไฟล์ที่ขึ้นต้นด้วยจุดอาจถูกซ่อนบนเครื่อง
   ใน Windows ให้เปิด View → Hidden items, ใน Mac กด Cmd+Shift+.)
4. Settings → Pages → Source: *Deploy from a branch*, Branch: `main` / `(root)` → Save
5. รอ 1-2 นาที แล้วเปิด `https://<ชื่อผู้ใช้>.github.io` ควรเห็นแอปขึ้นมา

## ขั้นที่ 2: สร้าง APK ด้วย PWABuilder

1. ไปที่ **pwabuilder.com** ใส่ `https://<ชื่อผู้ใช้>.github.io` → Start
2. กด **Package For Stores → Android → Generate Package**
   - Package ID: เช่น `com.iberrygroup.app` (ห้ามเปลี่ยนภายหลัง)
   - Signing key: เลือก **Create new** แล้วใส่ข้อมูล
3. ดาวน์โหลดไฟล์ zip ซึ่งจะมี:
   - `*.apk`: ไฟล์สำหรับติดตั้งบนมือถือ
   - `*.aab`: ไฟล์สำหรับลง Play Store (ถ้าจะลง)
   - `signing.keystore` + `signing-key-info.txt`: **เก็บไว้ให้ดี** ถ้าหายจะอัปเดตแอปเดิมไม่ได้
   - `assetlinks.json`: ใช้ในขั้นที่ 3

## ขั้นที่ 3: ซ่อนแถบ URL ด้านบน

ถ้าไม่ทำขั้นนี้ แอปจะใช้ได้ แต่มีแถบที่อยู่เว็บแสดงอยู่ด้านบน

1. เปิด `assetlinks.json` ที่ได้จาก PWABuilder
2. ใน GitHub เปิด `.well-known/assetlinks.json` → ✏️ แก้ไข → วางเนื้อหาจากไฟล์ใหม่ทับทั้งหมด → Commit
3. ตรวจสอบ: เปิด `https://<ชื่อผู้ใช้>.github.io/.well-known/assetlinks.json` ต้องเห็น package id ของคุณ
4. ถอนแอปแล้วติดตั้งใหม่บนมือถือ แถบ URL จะหายไป

## ขั้นที่ 4: ติดตั้งบนมือถือ

ส่งไฟล์ `.apk` ไปที่มือถือ (Line/Drive/สาย USB) → เปิดไฟล์ → อนุญาต "ติดตั้งจากแหล่งที่ไม่รู้จัก" → ติดตั้ง

## เปลี่ยนชื่อ/ไอคอน

- ชื่อแอป: แก้ `name` และ `short_name` ใน `manifest.json` และ `<title>` ใน `index.html`
- ไอคอน: แทนที่ไฟล์ในโฟลเดอร์ `icons/` ด้วยรูป PNG ขนาดเดียวกัน (192×192, 512×512)
  ไฟล์ `maskable-512.png` ควรมีขอบว่างรอบ ๆ ประมาณ 20% เพราะ Android จะตัดเป็นวงกลม
- ถ้าแก้หลังจากสร้าง APK แล้ว ต้องสร้าง APK ใหม่ใน PWABuilder (ใช้ keystore เดิม)

## การอัปเดตในอนาคต

- **แก้โค้ด Apps Script**: Deploy โดย*แก้ deployment เดิม* (Manage deployments → ✏️ → New version)
  แอปบนมือถือจะได้เวอร์ชันใหม่ทันที **ไม่ต้องสร้าง APK ใหม่**
- ห้ามกด "New deployment" เพราะจะได้ลิงก์ใหม่ และแอปจะยังชี้ไปที่ลิงก์เดิม
