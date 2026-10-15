import ContactMessage from '../models/ContactMessage.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact — validate and save one message. Never trust client-side validation alone.
export async function createContactMessage(req, res, next) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ success: false, message: 'Name must be between 2 and 80 characters.' });
    }
    if (!emailPattern.test(email) || email.length > 254) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (message.length < 10 || message.length > 1000) {
      return res.status(400).json({ success: false, message: 'Message must be between 10 and 1000 characters.' });
    }

    const savedMessage = await ContactMessage.create({ name, email, message });

    // Do not return submitted content or internal MongoDB details to the public client.
    return res.status(201).json({
      success: true,
      message: 'Thanks for reaching out! Your message has been received.',
      data: { id: savedMessage._id },
    });
  } catch (error) {
    return next(error);
  }
}
