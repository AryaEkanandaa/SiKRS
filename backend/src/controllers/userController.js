const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");

exports.index = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      dosenId: true,
      mahasiswaId: true,
      createdAt: true,
      dosen: { select: { id: true, nama: true, nip: true } },
      mahasiswa: { select: { id: true, nama: true, nim: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ users });
});

exports.show = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      role: true,
      dosenId: true,
      mahasiswaId: true,
      createdAt: true,
      dosen: { select: { id: true, nama: true, nip: true } },
      mahasiswa: { select: { id: true, nama: true, nim: true } },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });
});

exports.update = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  const data = {};
  if (email !== undefined) data.email = email;
  if (role !== undefined) data.role = role;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: {
      id: true,
      email: true,
      role: true,
      dosenId: true,
      mahasiswaId: true,
    },
  });

  res.json({ message: "User updated", user });
});

exports.destroy = asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: "User deleted" });
});

exports.link = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.body;

  if (!entityType || !entityId) {
    return res.status(400).json({ message: "entityType and entityId are required" });
  }

  if (!["DOSEN", "MAHASISWA"].includes(entityType)) {
    return res.status(400).json({ message: "entityType must be DOSEN or MAHASISWA" });
  }

  const field = entityType === "DOSEN" ? "dosenId" : "mahasiswaId";
  const model = entityType === "DOSEN" ? "dosen" : "mahasiswa";

  const entity = await prisma[model].findUnique({ where: { id: entityId } });
  if (!entity) {
    return res.status(404).json({ message: `${entityType} not found` });
  }

  if (entity.userId) {
    return res.status(400).json({ message: `${entityType} already has a linked user` });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { [field]: entityId },
    select: {
      id: true,
      email: true,
      role: true,
      dosenId: true,
      mahasiswaId: true,
    },
  });

  res.json({ message: "User linked successfully", user });
});

exports.unlink = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const data = {};
  if (user.dosenId) data.dosenId = null;
  if (user.mahasiswaId) data.mahasiswaId = null;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: "User has no links" });
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: {
      id: true,
      email: true,
      role: true,
      dosenId: true,
      mahasiswaId: true,
    },
  });

  res.json({ message: "User unlinked successfully", user: updated });
});
