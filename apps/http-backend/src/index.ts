import express from "express";
const app = express();
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "@repo/backend-common";
import prisma from "@repo/db/client";
import crypto from "crypto";

app.use(express.json());

/* -------------- Signup -------------- */

app.post("/signup", async (req, res) => {
  try {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({
        message: "Incorrect inputs",
        errors: parsedData.error.issues
      });
      return;
    }
    const { name, password, username: email } = parsedData.data;

    const userExists = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      res.status(403).json({
        message: "User already exists",
      });
      return;
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      user,
      message: "User create successfully !!",
    });
  } catch (error: any) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

/* -------------- Signin -------------- */

app.post("/signin", async (req, res) => {
  try {
    const parsedData = SigninSchema.safeParse(req.body);

    if (!parsedData.success) {
      console.log("Validation Error :", parsedData.error);
      res.status(400).json({
        message: "Incorrect inputs",
      });
      return;
    }

    const { password, username: email } = parsedData.data;

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      res.status(404).json({
        message: "User does not exist.",
      });
      return;
    }

    if (user.password !== hashedPassword) {
      res.status(401).json({
        message: "Invalid email or password.",
      });
      return;
    }

    const token = jwt.sign({ id: user.id }, JWT_PASSWORD);

    res.status(200).json({
      message: "Login successful",
      token,
    });

  } catch (error: any) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

/* -------------- Room -------------- */

app.post("/room", (req, res) => {
  try {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({
        message: "Incorrect inputs",
      });
      return;
    }

    res.json({
      roomId: 123,
    });
  } catch (error: any) {
    console.error("Server Error:", error);

    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`http-backend server running on ${PORT}`);
});
