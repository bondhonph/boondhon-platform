const fs = require('fs');
const filePath = 'H:/Data/boondhon-git/pages/api/messenger.js';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// Replace multiline double quotes with backticks
content = content.replace(
  'const reply = "🎁 ফ্রি নিকাহনামা অফার:\n\nআমাদের ২০০ পিস বা তার বেশি যেকোনো কার্ড অর্ডার করলেই ১টি আকর্ষণীয় ফ্রি নিকাহনামা উপহার পাবেন! 😍\n\nঅর্ডার করতে চাইলে নিচের বাটনে চাপুন! 😊";',
  'const reply = `🎁 ফ্রি নিকাহনামা অফার:\n\nআমাদের ২০০ পিস বা তার বেশি যেকোনো কার্ড অর্ডার করলেই ১টি আকর্ষণীয় ফ্রি নিকাহনামা উপহার পাবেন! 😍\n\nঅর্ডার করতে চাইলে নিচের বাটনে চাপুন! 😊`;'
);

content = content.replace(
  'const reply = "🎨 কাস্টম ডিজাইন সুবিধা:\n\nঅর্ডার কনফার্ম (৩০% অ্যাডভান্স) করার পর আমাদের ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে হোয়াটসঅ্যাপ/মেসেঞ্জারে চেক করাবে।\n\nআপনার পছন্দ ও ওকে হওয়ার পরই প্রিন্ট শুরু হবে! 😊";',
  'const reply = `🎨 কাস্টম ডিজাইন সুবিধা:\n\nঅর্ডার কনফার্ম (৩০% অ্যাডভান্স) করার পর আমাদের ডিজাইনার আপনার তথ্য দিয়ে কার্ডের ডিজাইন তৈরি করে আপনাকে হোয়াটসঅ্যাপ/মেসেঞ্জারে চেক করাবে।\n\nআপনার পছন্দ ও ওকে হওয়ার পরই প্রিন্ট শুরু হবে! 😊`;'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Backtick multiline strings fixed!');
