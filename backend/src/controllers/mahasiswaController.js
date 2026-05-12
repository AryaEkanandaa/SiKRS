const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { getCache, setCache, delCache } = require("../utils/redis");

exports.store = asyncHandler(async (req, res) => {
  const { nama, nim, email, noHp, prodiId, dosenPAId } = req.body;

  if (!nama || !nim) {
    return res.status(400).json({ message: "Nama and NIM are required" });
  }

  if (dosenPAId) {
    const dosen = await prisma.dosen.findUnique({ where: { id: dosenPAId } });
    if (!dosen) {
      return res.status(404).json({ message: "Dosen PA not found" });
    }
  }

  const parts = nama.split(" ").filter(Boolean);
  const last = parts[parts.length - 1].toLowerCase();

  const accountEmail = `${last}.${nim}@student.unud.ac.id`;
  const accountPassword = nim;

  const existingUser = await prisma.user.findUnique({ where: { email: accountEmail } });
  if (existingUser) {
    return res.status(400).json({
      message: `Account email ${accountEmail} already exists. Please check the name or NIM.`,
    });
  }

  const hashed = await bcrypt.hash(accountPassword, 12);

  const mahasiswa = await prisma.$transaction(async (tx) => {
    const m = await tx.mahasiswa.create({
      data: {
        nama,
        nim,
        email: email || null,
        noHp: noHp || null,
        prodiId: prodiId || null,
        dosenPAId: dosenPAId || null,
      },
    });

    await tx.user.create({
      data: {
        email: accountEmail,
        password: hashed,
        role: "USER",
        mahasiswaId: m.id,
      },
    });

    return m;
  });

  await delCache("mahasiswa:all");

  const result = await prisma.mahasiswa.findUnique({
    where: { id: mahasiswa.id },
    include: {
      dosenPA: { select: { id: true, nama: true, nip: true } },
      prodi: { select: { id: true, nama: true } },
    },
  });

  res.status(201).json({
    message: "Mahasiswa created",
    mahasiswa: result,
    account: {
      email: accountEmail,
      password: accountPassword,
    },
  });
});

exports.index = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const cacheKey = search ? `mahasiswa:search:${search}` : "mahasiswa:all";
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json({ mahasiswa: cached });
  }

  const where = {};
  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { nim: { contains: search, mode: "insensitive" } },
    ];
  }

  const mahasiswa = await prisma.mahasiswa.findMany({
    where,
    include: {
      dosenPA: { select: { id: true, nama: true, nip: true } },
      prodi: { select: { id: true, nama: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  await setCache(cacheKey, mahasiswa, 300);

  res.json({ mahasiswa });
});

exports.show = asyncHandler(async (req, res) => {
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { id: req.params.id },
    include: {
      dosenPA: { select: { id: true, nama: true, nip: true, email: true, noHp: true } },
      prodi: { select: { id: true, nama: true } },
      user: { select: { id: true, email: true } },
    },
  });

  if (!mahasiswa) {
    return res.status(404).json({ message: "Mahasiswa not found" });
  }

  res.json({ mahasiswa });
});

exports.update = asyncHandler(async (req, res) => {
  const { nama, nim, email, noHp, prodiId } = req.body;

  const data = {};
  if (nama !== undefined) data.nama = nama;
  if (nim !== undefined) data.nim = nim;
  if (email !== undefined) data.email = email;
  if (noHp !== undefined) data.noHp = noHp;
  if (prodiId !== undefined) data.prodiId = prodiId;

  const mahasiswa = await prisma.mahasiswa.update({
    where: { id: req.params.id },
    data,
    include: {
      dosenPA: { select: { id: true, nama: true, nip: true } },
      prodi: { select: { id: true, nama: true } },
    },
  });

  await delCache("mahasiswa:all");
  await delCache("mahasiswa:search:*");

  res.json({ message: "Mahasiswa updated", mahasiswa });
});

exports.destroy = asyncHandler(async (req, res) => {
  const mahasiswa = await prisma.mahasiswa.findUnique({ where: { id: req.params.id } });
  if (!mahasiswa) {
    return res.status(404).json({ message: "Mahasiswa not found" });
  }

  const user = await prisma.user.findFirst({ where: { mahasiswaId: req.params.id } });
  if (user) {
    return res.status(400).json({
      message: "This mahasiswa has a linked user account. Unlink the user first before deleting.",
    });
  }

  await prisma.mahasiswa.delete({ where: { id: req.params.id } });
  await delCache("mahasiswa:all");
  await delCache("mahasiswa:search:*");

  res.json({ message: "Mahasiswa deleted" });
});

exports.assignPa = asyncHandler(async (req, res) => {
  const { dosenPAId } = req.body;

  if (!dosenPAId) {
    return res.status(400).json({ message: "dosenPAId is required" });
  }

  const dosen = await prisma.dosen.findUnique({ where: { id: dosenPAId } });
  if (!dosen) {
    return res.status(404).json({ message: "Dosen not found" });
  }

  const mahasiswa = await prisma.mahasiswa.update({
    where: { id: req.params.id },
    data: { dosenPAId },
    include: {
      dosenPA: { select: { id: true, nama: true, nip: true } },
      prodi: { select: { id: true, nama: true } },
    },
  });

  await delCache("mahasiswa:all");
  await delCache("mahasiswa:search:*");

  res.json({ message: "Dosen PA assigned", mahasiswa });
});

exports.me = asyncHandler(async (req, res) => {
  if (!req.user.mahasiswaId) {
    return res.status(403).json({ message: "You are not linked to a mahasiswa account" });
  }

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { id: req.user.mahasiswaId },
    include: {
      dosenPA: { select: { id: true, nama: true, nip: true, email: true, noHp: true } },
      prodi: { select: { id: true, nama: true } },
    },
  });

  res.json({ mahasiswa });
});

exports.updateMe = asyncHandler(async (req, res) => {
  if (!req.user.mahasiswaId) {
    return res.status(403).json({ message: "You are not linked to a mahasiswa account" });
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

  const mahasiswa = await prisma.mahasiswa.update({
    where: { id: req.user.mahasiswaId },
    data,
    include: {
      dosenPA: { select: { id: true, nama: true, nip: true, email: true, noHp: true } },
      prodi: { select: { id: true, nama: true } },
    },
  });

  await delCache("mahasiswa:all");
  await delCache("mahasiswa:search:*");

  res.json({ message: "Profile updated", mahasiswa });
});

exports.dosenPa = asyncHandler(async (req, res) => {
  if (!req.user.mahasiswaId) {
    return res.status(403).json({ message: "You are not linked to a mahasiswa account" });
  }

  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { id: req.user.mahasiswaId },
    select: {
      dosenPA: { select: { id: true, nama: true, nip: true, email: true, noHp: true } },
    },
  });

  if (!mahasiswa || !mahasiswa.dosenPA) {
    return res.status(404).json({ message: "You don't have a Dosen PA yet" });
  }

  res.json({ dosenPA: mahasiswa.dosenPA });
});
