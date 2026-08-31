const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8');

const regex = /📦 প্রোডাক্ট ক্যাটালগ:[\s\S]*?২০০ পিস: ৯,০০০৳ \(৪৫৳\/পিস \+ ফ্রি নিকাহনামা 🎁\)/;

const replacement = `📦 প্রোডাক্ট ক্যাটালগ:
⚠️ গুরুত্বপূর্ণ: দুটো ক্যাটাগরির ডিজাইন ও মেটেরিয়াল হুবহু এক (লেজার কাট, ফয়েল, রিবন সবই থাকতে পারে), শুধু ফিজিক্যাল সাইজ আলাদা।

১. 💚 Affordable (সাশ্রয়ী) — ছোট সাইজ:
   - ৫০ পিস: ২,৭৫০৳ (৫৫৳/পিস)
   - ১০০ পিস: ৪,৫০০৳ (৪৫৳/পিস)
   - ২০০ পিস: ৭,০০০৳ (৩৫৳/পিস + ফ্রি নিকাহনামা 🎁)

২. ✨ Premium (প্রিমিয়াম/লাক্সারি) — বড় সাইজ:
   - ৫০ পিস: ৩,২৫০৳ (৬৫৳/পিস)
   - ১০০ পিস: ৫,৫০০৳ (৫৫৳/পিস)
   - ২০০ পিস: ৯,০০০৳ (৪৫৳/পিস + ফ্রি নিকাহনামা 🎁)`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('SUCCESS: System prompt updated successfully!');
} else {
  console.error('FAILED to find regex pattern');
}
