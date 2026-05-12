const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const honorifics = ["I", "Ni"];

function generateNip(birthDate, entryYear, entryMonth, gender, seq) {
  const bd = birthDate.toISOString().slice(0, 10).replace(/-/g, "");
  const em = String(entryMonth).padStart(2, "0");
  const g = gender === "L" ? "1" : "2";
  const s = String(seq).padStart(3, "0");
  return `${bd}${entryYear}${em}${g}${s}`;
}

function getFirstWord(name) {
  const parts = name.split(" ").filter(Boolean);
  const meaningful = parts.filter((p) => !honorifics.includes(p));
  return (meaningful[0] || parts[0]).toLowerCase();
}

function getLastWord(name) {
  const parts = name.split(" ").filter(Boolean);
  return parts[parts.length - 1].toLowerCase();
}

const dosenData = [
  { nama: "I Wayan Sudarsana", gender: "L", birth: new Date(1975, 4, 15), entryYear: 2003, entryMonth: 3, noHp: "081234567890" },
  { nama: "Ni Made Suryani", gender: "P", birth: new Date(1980, 7, 22), entryYear: 2005, entryMonth: 8, noHp: "081234567891" },
  { nama: "I Putu Adi Saputra", gender: "L", birth: new Date(1978, 11, 3), entryYear: 2002, entryMonth: 1, noHp: "081234567892" },
  { nama: "Ni Ketut Artini", gender: "P", birth: new Date(1982, 2, 18), entryYear: 2006, entryMonth: 6, noHp: "081234567893" },
  { nama: "I Gede Surya Dharma", gender: "L", birth: new Date(1976, 9, 10), entryYear: 2002, entryMonth: 11, noHp: "081234567894" },
  { nama: "I Nyoman Ari Wijaya", gender: "L", birth: new Date(1979, 1, 27), entryYear: 2004, entryMonth: 4, noHp: "081234567895" },
  { nama: "Ni Komang Ayu Pertiwi", gender: "P", birth: new Date(1983, 5, 14), entryYear: 2007, entryMonth: 7, noHp: "081234567896" },
  { nama: "I Kadek Dwi Prayoga", gender: "L", birth: new Date(1981, 8, 30), entryYear: 2005, entryMonth: 9, noHp: "081234567897" },
  { nama: "Ni Putu Eka Lestari", gender: "P", birth: new Date(1984, 6, 5), entryYear: 2008, entryMonth: 2, noHp: "081234567898" },
  { nama: "I Dewa Gede Wirawan", gender: "L", birth: new Date(1977, 3, 21), entryYear: 2001, entryMonth: 10, noHp: "081234567899" },
  { nama: "Ni Nyoman Ratna Dewi", gender: "P", birth: new Date(1985, 10, 12), entryYear: 2009, entryMonth: 5, noHp: "081234567800" },
  { nama: "I Gusti Bagus Sudarma", gender: "L", birth: new Date(1974, 0, 8), entryYear: 2000, entryMonth: 12, noHp: "081234567801" },
  { nama: "Ni Kadek Wahyuni", gender: "P", birth: new Date(1986, 1, 25), entryYear: 2008, entryMonth: 3, noHp: "081234567802" },
  { nama: "I Wayan Artawan", gender: "L", birth: new Date(1973, 6, 17), entryYear: 1999, entryMonth: 7, noHp: "081234567803" },
  { nama: "Ni Made Puspita Sari", gender: "P", birth: new Date(1987, 4, 9), entryYear: 2010, entryMonth: 1, noHp: "081234567804" },
  { nama: "I Putu Hendra Gunawan", gender: "L", birth: new Date(1980, 11, 28), entryYear: 2006, entryMonth: 4, noHp: "081234567805" },
  { nama: "Ni Ketut Supartini", gender: "P", birth: new Date(1982, 9, 16), entryYear: 2007, entryMonth: 8, noHp: "081234567806" },
  { nama: "I Gede Putra Sanjaya", gender: "L", birth: new Date(1978, 2, 13), entryYear: 2003, entryMonth: 2, noHp: "081234567807" },
  { nama: "Ni Wayan Sumiani", gender: "P", birth: new Date(1984, 8, 20), entryYear: 2009, entryMonth: 6, noHp: "081234567808" },
  { nama: "I Komang Suwastika", gender: "L", birth: new Date(1976, 7, 4), entryYear: 2001, entryMonth: 9, noHp: "081234567809" },
  { nama: "Ni Putu Sri Wahyuni", gender: "P", birth: new Date(1988, 3, 11), entryYear: 2011, entryMonth: 3, noHp: "081234567810" },
  { nama: "I Dewa Ayu Manik", gender: "P", birth: new Date(1981, 1, 19), entryYear: 2004, entryMonth: 11, noHp: "081234567811" },
  { nama: "I Wayan Gede Widiada", gender: "L", birth: new Date(1972, 10, 2), entryYear: 1998, entryMonth: 5, noHp: "081234567812" },
  { nama: "Ni Made Ayu Kartika", gender: "P", birth: new Date(1985, 12, 26), entryYear: 2010, entryMonth: 10, noHp: "081234567813" },
  { nama: "I Nyoman Suyasa", gender: "L", birth: new Date(1979, 5, 7), entryYear: 2005, entryMonth: 12, noHp: "081234567814" },
  { nama: "Ni Kadek Dewi Anggreni", gender: "P", birth: new Date(1986, 0, 15), entryYear: 2011, entryMonth: 2, noHp: "081234567815" },
  { nama: "I Putu Agus Eka Putra", gender: "L", birth: new Date(1983, 8, 23), entryYear: 2008, entryMonth: 7, noHp: "081234567816" },
  { nama: "Ni Komang Tri Indrawati", gender: "P", birth: new Date(1987, 7, 31), entryYear: 2012, entryMonth: 4, noHp: "081234567817" },
  { nama: "I Gusti Ngurah Oka", gender: "L", birth: new Date(1975, 3, 11), entryYear: 2000, entryMonth: 8, noHp: "081234567818" },
  { nama: "Ni Luh Gede Eka Sari", gender: "P", birth: new Date(1989, 6, 6), entryYear: 2013, entryMonth: 1, noHp: "081234567819" },
];

const mahasiswaNames = [
  "I Made Adi Wirawan",
  "Ni Ketut Dewi Purnama Sari",
  "I Kadek Surya Wiguna",
  "Ni Wayan Ayu Lestari",
  "I Nyoman Ari Gunawan",
  "Ni Putu Indah Pratiwi",
  "I Komang Agus Saputra",
  "Ni Made Ayu Puspita",
  "I Gede Ari Winata",
  "Ni Luh Putu Ratna Dewi",
  "I Wayan Darma Yuda",
  "Ni Kadek Mega Sari",
  "I Putu Eka Satria",
  "Ni Nyoman Tri Handayani",
  "I Kadek Adi Prayoga",
  "Ni Made Citra Lestari",
  "I Wayan Gede Ardana",
  "Ni Putu Ayu Wulandari",
  "I Nyoman Surya Negara",
  "Ni Komang Ayu Permata Sari",
  "I Gede Putra Wijaya",
  "Ni Luh Gede Indah Sari",
  "I Kadek Dwi Payana",
  "Ni Wayan Sri Wahyuni",
  "I Putu Adi Sanjaya",
  "Ni Made Ayu Sudarmini",
  "I Nyoman Gede Artawan",
  "Ni Ketut Puspita Dewi",
  "I Wayan Adi Suarjana",
  "Ni Kadek Ayu Pradnya",
  "I Putu Eka Wijaya Kusuma",
  "Ni Luh Putu Sari Dewi",
  "I Gede Arya Wicaksana",
  "Ni Wayan Eka Sari",
  "I Komang Adi Wiguna",
  "Ni Putu Mega Lestari",
  "I Nyoman Yuda Pratama",
  "Ni Made Ari Indrawati",
  "I Kadek Gede Artana",
  "Ni Ketut Ayu Widiastuti",
  "I Wayan Agus Wirawan",
  "Ni Putu Eka Pratiwi",
  "I Gede Putra Yana",
  "Ni Luh Gede Ayu Sri",
  "I Kadek Surya Adi",
  "Ni Made Ayu Pradnya",
  "I Nyoman Gede Yasa",
  "Ni Wayan Ratna Dewi Sakti",
  "I Putu Ari Gunarta",
  "Ni Komang Mega Puspita",
  "I Gede Adi Saputra",
  "Ni Kadek Ayu Indah",
  "I Wayan Suyasa",
  "Ni Putu Sri Utami",
  "I Nyoman Eka Putra",
  "Ni Made Ayu Wulandari",
  "Putu Arya Ekananda Kusuma Negara",
  "I Kadek Yuda Pratama",
  "Ni Luh Putu Suryani",
  "I Gede Arya Kusuma",
  "Ni Wayan Mega Astuti",
  "I Putu Agus Wiradana",
  "Ni Ketut Eka Purnami",
  "I Komang Gede Artawan",
  "Ni Made Ayu Lestari",
  "I Nyoman Surya Dharma",
  "Ni Putu Dewi Ratna Sari",
  "I Wayan Gede Yudha",
  "Ni Kadek Ari Artini",
  "I Putu Eka Adnyana",
  "Ni Luh Gede Sri Purnami",
  "I Gede Putu Wirawan",
  "Ni Made Ayu Sumiani",
  "I Kadek Agus Gunawan",
  "Ni Wayan Eka Pratiwi",
  "I Nyoman Gede Suyasa",
  "Ni Ketut Ayu Wardani",
  "I Putu Surya Wiguna",
  "Ni Komang Indah Lestari",
  "I Gede Ari Subawa",
  "Ni Luh Putu Ayu Sari",
  "I Wayan Eka Saputra",
  "Ni Made Mega Wahyuni",
  "I Kadek Adi Yasa",
  "Ni Putu Ayu Sri Wahyuni",
  "I Nyoman Gede Putra",
  "Ni Wayan Ayu Suryani",
  "I Putu Gede Artama",
  "Ni Ketut Pradnya Paramita",
  "I Komang Surya Wirawan",
  "Ni Made Ayu Aryani",
  "I Gede Putu Adi",
  "Ni Luh Gede Mega Sari",
  "I Kadek Eka Prayoga",
  "Ni Wayan Ratna Kumala",
  "I Putu Nyoman Yasa",
  "Ni Ketut Ayu Sintya",
  "I Wayan Ari Kusuma",
  "Ni Made Ayu Pradnyani",
  "I Kadek Dwi Santika",
];

async function main() {
  const SALT_ROUNDS = 8;

  // ── Admin ──
  const adminPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
  await prisma.user.upsert({
    where: { email: "admin@krs.com" },
    update: {},
    create: {
      email: "admin@krs.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created (admin@krs.com / admin123)");

  // ── Dosen ──
  let dosenCount = 0;
  for (const d of dosenData) {
    const first = getFirstWord(d.nama);
    const last = getLastWord(d.nama);
    const email = `${first}.${last}@unud.ac.id`;
    const password = `${first}123`;
    const nip = generateNip(d.birth, d.entryYear, d.entryMonth, d.gender, dosenCount + 1);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) continue;

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await prisma.$transaction(async (tx) => {
      const dosen = await tx.dosen.create({ data: { nama: d.nama, nip, noHp: d.noHp } });
      await tx.user.create({ data: { email, password: hashed, role: "USER", dosenId: dosen.id } });
    });

    console.log(`  Dosen ${dosenCount + 1}. ${d.nama} -> ${email} / ${password}`);
    dosenCount++;
  }
  console.log(`Dosen created: ${dosenCount}`);

  // ── Program Studi ──
  const prodi = await prisma.programStudi.upsert({
    where: { nama: "Teknologi Informasi" },
    update: {},
    create: { nama: "Teknologi Informasi" },
  });
  console.log(`Program Studi: ${prodi.nama} (${prodi.id})`);

  // ── Mahasiswa ──
  let mhsCount = 0;
  for (let i = 0; i < mahasiswaNames.length; i++) {
    const nama = mahasiswaNames[i];
    const seq = String(i + 1).padStart(3, "0");
    const nim = `2305551${seq}`;
    const last = getLastWord(nama);
    const email = `${last}.${nim}@student.unud.ac.id`;
    const password = nim;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) continue;

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await prisma.$transaction(async (tx) => {
      const mhs = await tx.mahasiswa.create({
        data: { nama, nim, prodiId: prodi.id },
      });
      await tx.user.create({
        data: { email, password: hashed, role: "USER", mahasiswaId: mhs.id },
      });
    });

    console.log(`  Mhs ${i + 1}. ${nama} -> ${nim} / ${email} / ${password}`);
    mhsCount++;
  }
  console.log(`Mahasiswa created: ${mhsCount}`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
