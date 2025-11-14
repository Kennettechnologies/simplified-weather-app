import mongoose from 'mongoose';

// Same connectToDatabase and User schema as above...

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = `dev-token-${user._id}`;

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        created_at: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}