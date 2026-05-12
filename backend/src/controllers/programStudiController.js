const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { getCache, setCache, delCache } = require("../utils/redis");

exports.store = asyncHandler(async (req, res) => {
  const { nama } = req.body;
  if (!nama) {
    return res.status(400).json({ message: "Nama program studi is required" });
  }

  const prodi = await prisma.programStudi.create({ data: { nama } });
  await delCache("prodi:all");

  res.status(201).json({ message: "Program studi created", prodi });
});

exports.index = asyncHandler(async (req, res) => {
  const cached = await getCache("prodi:all");
  if (cached) {
    return res.json({ programStudi: cached });
  }

  const programStudi = await prisma.programStudi.findMany({
    include: { _count: { select: { mahasiswas: true } } },
    orderBy: { nama: "asc" },
  });

  await setCache("prodi:all", programStudi, 3600);
  res.json({ programStudi });
});

exports.show = asyncHandler(async (req, res) => {
  const prodi = await prisma.programStudi.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { mahasiswas: true } } },
  });

  if (!prodi) {
    return res.status(404).json({ message: "Program studi not found" });
  }

  res.json({ programStudi: prodi });
});

exports.update = asyncHandler(async (req, res) => {
  const { nama } = req.body;
  const prodi = await prisma.programStudi.update({
    where: { id: req.params.id },
    data: { nama },
  });

  await delCache("prodi:all");
  res.json({ message: "Program studi updated", prodi });
});

exports.destroy = asyncHandler(async (req, res) => {
  const count = await prisma.mahasiswa.count({ where: { prodiId: req.params.id } });
  if (count > 0) {
    return res.status(400).json({ message: "Cannot delete: program studi has mahasiswa" });
  }

  await prisma.programStudi.delete({ where: { id: req.params.id } });
  await delCache("prodi:all");
  res.json({ message: "Program studi deleted" });
});
