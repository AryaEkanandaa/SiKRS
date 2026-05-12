const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const asyncHandler = require("../utils/asyncHandler");

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      dosen: { select: { id: true, nama: true, nip: true } },
      mahasiswa: { select: { id: true, nama: true, nim: true } },
    },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const { password: _, ...userWithoutPassword } = user;

  res.json({ message: "Login successful", token, user: userWithoutPassword });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      dosenId: true,
      mahasiswaId: true,
      dosen: { select: { id: true, nama: true, nip: true, email: true, noHp: true } },
      mahasiswa: {
        select: {
          id: true,
          nama: true,
          nim: true,
          email: true,
          noHp: true,
          dosenPA: { select: { id: true, nama: true, nip: true } },
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user });
});
