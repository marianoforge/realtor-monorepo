import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapes[char] || char);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ message: "Only POST requests are allowed" });
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      companyName,
      country,
      inquiry,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !companyName ||
      !country ||
      !inquiry
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const sentFrom = new Sender(
      process.env.MAILERSEND_FROM_EMAIL as string,
      process.env.MAILERSEND_FROM_NAME as string
    );

    const recipients = [
      new Recipient(process.env.MAILERSEND_TO_EMAIL as string, "Your Client"),
    ];

    try {
      const mailerSend = new MailerSend({
        apiKey: process.env.MAILERSEND_API_KEY as string,
      });

      const safeFirstName = escapeHtml(firstName);
      const safeLastName = escapeHtml(lastName);
      const safeEmail = escapeHtml(email);
      const safePhoneNumber = escapeHtml(phoneNumber);
      const safeCompanyName = escapeHtml(companyName);
      const safeCountry = escapeHtml(country);
      const safeInquiry = escapeHtml(inquiry);

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(`Nuevo mensaje de ${safeFirstName} ${safeLastName}`)
        .setHtml(
          `
          <p><strong>Nombre:</strong> ${safeFirstName} ${safeLastName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Teléfono:</strong> ${safePhoneNumber}</p>
          <p><strong>Empresa:</strong> ${safeCompanyName}</p>
          <p><strong>País:</strong> ${safeCountry}</p>
          <p><strong>Mensaje:</strong> ${safeInquiry}</p>
        `
        )
        .setText(
          `Nombre: ${firstName} ${lastName}\nEmail: ${email}\nTeléfono: ${phoneNumber}\nEmpresa: ${companyName}\nPaís: ${country}\nMensaje: ${inquiry}`
        );

      await mailerSend.email.send(emailParams);

      return res.status(200).json({ message: "Correo enviado exitosamente" });
    } catch (error) {
      console.error("Error al enviar correo:", error);
      return res.status(500).json({ message: "Error al enviar el correo" });
    }
  } catch (error) {
    console.error("Error en la API /api/send-email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
