import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key from environment variables
export const initEmailJS = () => {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!publicKey) {
    console.error("EmailJS public key not configured. Check .env file.");
    return;
  }
  emailjs.init({
    publicKey: publicKey,
  });
};

export const sendContactEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string
) => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

    if (!serviceId || !templateId || !adminEmail) {
      throw new Error("EmailJS configuration missing. Check environment variables in .env file.");
    }

    const response = await emailjs.send(
      serviceId,
      templateId,
      {
        from_name: name,
        from_email: email,
        to_email: adminEmail,
        subject: subject,
        message: message,
        reply_to: email,
      }
    );

    return { success: true, response };
  } catch (error) {
    console.error("EmailJS Error:", error);
    throw error;
  }
};
