
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPERADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { name, email, password, role, companyName } = await req.json();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
      updateData.plainPassword = password;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: "User updated", user: updatedUser });
  } catch (error) {
    console.error("User Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("DELETE request received for user ID...");
  const session = await getServerSession(authOptions);
  console.log("Session in DELETE route:", JSON.stringify(session, null, 2));
  
  if (!session) {
    console.log("No session found in DELETE route");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  console.log(`User role from session: ${userRole}`);

  if (userRole !== "SUPERADMIN") {
    console.log(`Unauthorized: User is ${userRole}, expected SUPERADMIN`);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    console.log(`Attempting to delete user with ID: ${id}`);

    // Prevent deleting self
    if (id === (session.user as any).id) {
      console.log("Blocked attempt to delete own account");
      return NextResponse.json({ message: "Cannot delete your own account" }, { status: 400 });
    }

    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    console.log(`User ${id} deleted successfully from DB`);

    return NextResponse.json({ message: "User deleted" });
  } catch (error: any) {
    console.error("User Delete Error:", error);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
