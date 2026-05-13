const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { getCache, setCache, delCache } = require("../utils/redis");

exports.store = asyncHandler(async (req, res) => {
  const { nama, nip, email, noHp } = req.body;

  if (!nama || !nip) {
    return res.status(400).json({ message: "Nama and NIP are required" });
  }

  const honorifics = ["I", "Ni"];
  const parts = nama.split(" ").filter(Boolean);
  const meaningful = parts.filter((p) => !honorifics.includes(p));
  const first = (meaningful[0] || parts[0]).toLowerCase();
  const last = parts[parts.length - 1].toLowerCase();

  const accountEmail = `${first}.${last}@unud.ac.id`;
  const accountPassword = `${first}123`;

  const existingUser = await prisma.user.findUnique({ where: { email: accountEmail } });
  if (existingUser) {
    return res.status(400).json({
      message: `Account email ${accountEmail} already exists. Please check the name or contact admin.`,
    });
  }

  const hashed = await bcrypt.hash(accountPassword, 12);

  const dosen = await prisma.$transaction(async (tx) => {
    const d = await tx.dosen.create({
      data: { nama, nip, email: email || null, noHp: noHp || null },
    });

    await tx.user.create({
      data: {
        email: accountEmail,
        password: hashed,
        role: "USER",
        dosenId: d.id,
      },
    });

    return d;
  });

  await delCache("dosen:all");

  res.status(201).json({
    message: "Dosen created",
    dosen,
    account: {
      email: accountEmail,
      password: accountPassword,
    },
  });
});

exports.index = asyncHandler(async (req, res) => {
  const cached = await getCache("dosen:all");
  if (cached) {
    return res.json({ dosen: cached });
  }

  const dosen = await prisma.dosen.findMany({
    include: { _count: { select: { mahasiswas: true } } },
    orderBy: { nama: "asc" },
  });

  await setCache("dosen:all", dosen);

  res.json({ dosen });
});

exports.show = asyncHandler(async (req, res) => {
  const dosen = await prisma.dosen.findUnique({
    where: { id: req.params.id },
    include: {
      _count: { select: { mahasiswas: true } },
      user: { select: { id: true, email: true } },
    },
  });

  if (!dosen) {
    return res.status(404).json({ message: "Dosen not found" });
  }

  res.json({ dosen });
});

exports.update = asyncHandler(async (req, res) => {
  const { nama, nip, email, noHp } = req.body;

  const data = {};
  if (nama !== undefined) data.nama = nama;
  if (nip !== undefined) data.nip = nip;
  if (email !== undefined) data.email = email;
  if (noHp !== undefined) data.noHp = noHp;

  const dosen = await prisma.dosen.update({
    where: { id: req.params.id },
    data,
  });

  await delCache("dosen:all");

  res.json({ message: "Dosen updated", dosen });
});

exports.destroy = asyncHandler(async (req, res) => {
  const dosen = await prisma.dosen.findUnique({ where: { id: req.params.id } });
  if (!dosen) {
    return res.status(404).json({ message: "Dosen not found" });
  }

  const user = await prisma.user.findFirst({ where: { dosenId: req.params.id } });
  if (user) {
    return res.status(400).json({
      message: "This dosen has a linked user account. Unlink the user first before deleting.",
    });
  }

  const count = await prisma.mahasiswa.count({ where: { dosenPAId: req.params.id } });
  if (count > 0) {
    await prisma.mahasiswa.updateMany({
      where: { dosenPAId: req.params.id },
      data: { dosenPAId: null },
    });
  }

  await prisma.dosen.delete({ where: { id: req.params.id } });
  await delCache("dosen:all");

  res.json({ message: "Dosen deleted" });
});

exports.me = asyncHandler(async (req, res) => {
  if (!req.user.dosenId) {
    return res.status(403).json({ message: "You are not linked to a dosen account" });
  }

  const dosen = await prisma.dosen.findUnique({
    where: { id: req.user.dosenId },
    include: { _count: { select: { mahasiswas: true } } },
  });

  res.json({ dosen });
});

exports.mahasiswa = asyncHandler(async (req, res) => {
  if (!req.user.dosenId) {
    return res.status(403).json({ message: "You are not linked to a dosen account" });
  }

  const mahasiswa = await prisma.mahasiswa.findMany({
    where: { dosenPAId: req.user.dosenId },
    select: {
      id: true,
      nama: true,
      nim: true,
      email: true,
      noHp: true,
    },
    orderBy: { nama: "asc" },
  });

  res.json({ mahasiswa });
});

exports.updateMe = asyncHandler(async (req, res) => {
  if (!req.user.dosenId) {
    return res.status(403).json({ message: "You are not linked to a dosen account" });
  }

  const { email, noHp } = req.body;

  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  if (noHp !== undefined && noHp !== null && !/^\d{10,15}$/.test(noHp.replace(/\s/g, ""))) {
    return res.status(400).json({ message: "No. HP must contain 10-15 digits" });
  }

  const data = {};
  if (email !== undefined) data.email = email || null;
  if (noHp !== undefined) data.noHp = noHp || null;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  const dosen = await prisma.dosen.update({
    where: { id: req.user.dosenId },
    data,
    include: { _count: { select: { mahasiswas: true } } },
  });

  await delCache("dosen:all");

  res.json({ message: "Profile updated", dosen });
});
});
