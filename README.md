# 🏡 Claude Agent Village

หมู่บ้านพิกเซลที่แสดงว่า agent ของ Claude Code กำลังทำอะไรอยู่ มี 3 ธีมให้สลับ: 🎄 หมู่บ้านคริสต์มาส (เอลฟ์กับซานต้า), 🍳 ครัวร้านอาหาร และ 🛶 ตลาดน้ำ

*A pixel-art village that visualises what your Claude Code agents are doing. Display-only, runs entirely on your own machine.*

![Claude Agent Village: Christmas village, restaurant kitchen and Thai floating market themes (demo mode)](docs/demo.gif)

## ทำอะไรได้บ้าง

- **🔴 Live**: เห็น session ของ Claude Code จริง (Desktop / terminal / IDE) เป็นตัวละครในฉาก เดินไปจุดต่างๆ ตามเครื่องมือที่ใช้ (อ่านไฟล์, แก้ไฟล์, รันคำสั่ง, ค้นเว็บ ฯลฯ)
- **Agent Activity**: ดูว่าคุณพิมพ์อะไร Claude ใช้เครื่องมืออะไร และตอบว่าอะไร (ย่อสั้น) มีปุ่ม 🙈 ซ่อนข้อความก่อนแคปหน้าจอ
- **🎲 จำลอง**: ข้อมูลสุ่มในหน้าเว็บ ไว้ดูเล่น ไม่เกี่ยวกับ Claude เลย
- หัวหน้า (ซานต้า / หัวหน้าเชฟ / ป้าแดง) ตรวจงานทุกชิ้น ทักทาย agent ใหม่ และเดินตรวจตอนว่าง

## ความปลอดภัยและค่าใช้จ่าย

- **ไม่เสียเงินเพิ่ม ไม่กิน usage**: หน้านี้ไม่เรียก Claude เลย hook เป็นแค่ `command` ที่ส่งสรุปเหตุการณ์มาให้หน้าเว็บ (ไม่ใช้ hook แบบ `prompt` หรือ `agent`) และไม่พิมพ์อะไรกลับเข้า context ของ Claude
- **ข้อมูลไม่ออกนอกเครื่อง**: เซิร์ฟเวอร์ฟังแค่ `127.0.0.1` (พอร์ต 5179 ถ้าไม่ได้เปลี่ยน) hook ส่งไปที่ `127.0.0.1` เท่านั้น
- **ไม่อ่าน token หรือรหัสผ่าน**: อ่านแค่อีเมลบัญชีกับประเภทบัญชีจาก `~/.claude.json` เพื่อแสดง (ปิดบางส่วนไว้)
- **ส่งไปเท่าที่จำเป็น**: ชื่อเครื่องมือ, ชื่อไฟล์ (ไม่ใช่เนื้อหา), 120 ตัวอักษรแรกของ prompt, 150 ตัวอักษรแรกของคำตอบ ไม่ส่งเนื้อหาไฟล์, diff หรือผลลัพธ์คำสั่ง
- **ไม่เก็บลงดิสก์**: ประวัติอยู่ในหน่วยความจำ ปิดเซิร์ฟเวอร์แล้วหายหมด
- ถ้าไม่ได้เปิดเซิร์ฟเวอร์ Claude ก็ใช้งานได้ปกติ hook แค่ส่งไม่ถึงแล้วเงียบไป

## ติดตั้ง

ต้องมี [Node.js](https://nodejs.org) 18 ขึ้นไป ไม่ต้อง `npm install` (ไม่มี dependency)

```bash
git clone <url ของ repo นี้>
cd claude-agent-village
node install.js
```

`install.js` จะ backup `~/.claude/settings.json` ก่อน แล้วคัดลอก `hooks/` ไปไว้ที่ `~/.claude/agent-village` และลงทะเบียน hook (ถ้ามี status line เดิมอยู่แล้วจะไม่แตะ)

## ใช้งาน

- **Windows**: ดับเบิลคลิก `start.bat` เปิดหน้าต่างค้างไว้ระหว่างใช้ ปิดหน้าต่าง = หยุด
- **ทุกระบบ**: `npm start` แล้วเปิด <http://localhost:5179>

### เปลี่ยนพอร์ต

ถ้ามีโปรแกรมอื่นใช้พอร์ต 5179 อยู่ (ขึ้น `EADDRINUSE`) ให้เลือกพอร์ตใหม่ แล้วเปิด `start.bat` ใหม่:

```
node install.js --port 15179
```

พอร์ตจะถูกเก็บไว้ที่ `~/.claude/agent-village/config.json` ทั้งเซิร์ฟเวอร์และ hook อ่านจากไฟล์เดียวกัน ถ้าจะกลับไปใช้พอร์ตเดิมก็รัน `node install.js --port 5179`

## ถอนการติดตั้ง

```bash
node install.js --remove
```

ลบ hook และ status line ของ Agent Village ออกจาก settings และลบไฟล์ใน `~/.claude/agent-village`

## หมายเหตุ

- % โควต้า 5 ชั่วโมง / 7 วัน มาจาก status line ซึ่งทำงานเฉพาะตอนใช้ `claude` ใน terminal (Claude Desktop ไม่ส่งตัวเลขนี้)

## โครงสร้าง

```
index.html          หน้าเว็บ
js/engine.js        ตัวละคร, โหมด Live/จำลอง, activity log
js/pixel.js         ตัวช่วยวาดพิกเซล + ระบบธีม
themes/*.js         ธีมแต่ละแบบ
assets/sprites/     สไปรต์ของธีม Floating Market HD (ต้นฉบับอยู่ใน src/)
tools/build-sprites.py  แปลงภาพต้นฉบับเป็นสไปรต์
server.js           เซิร์ฟเวอร์ local (127.0.0.1, พอร์ตตาม port.js)
port.js             เลือกพอร์ต: PORT env > config.json > 5179
hooks/hook.js       hook ที่ส่งสรุปเหตุการณ์มาที่เซิร์ฟเวอร์
hooks/statusline.js status line (terminal เท่านั้น)
install.js          ติดตั้ง / ถอน hook
start.bat           ดับเบิลคลิกเพื่อเปิด (Windows)
```

## ที่มาของภาพ

- ธีม Christmas Village, Restaurant Kitchen และ Floating Market วาดด้วยโค้ด (`js/pixel.js`, `themes/*.js`)
- ตัวละครในธีม **Floating Market HD** (แม่ค้า พ่อค้า และป้าแดง) **สร้างด้วย AI (Google Gemini)** ไม่ได้วาดด้วยมือ
  แล้วแปลงเป็นสไปรต์ด้วย `tools/build-sprites.py` (ตัดพื้นหลัง ย่อขนาด ลดสี เปลี่ยนสีเสื้อตาม agent)
  ภาพต้นฉบับจาก Gemini เก็บไว้ใน `assets/sprites/src/`

## License

MIT สำหรับโค้ด ภาพที่สร้างด้วย AI ใน `assets/sprites/` อาจไม่มีลิขสิทธิ์คุ้มครองในบางประเทศ
ใช้ได้ภายใต้[เงื่อนไขของ Google](https://policies.google.com/terms) และ[นโยบายการใช้ Generative AI](https://policies.google.com/terms/generative-ai/use-policy)
