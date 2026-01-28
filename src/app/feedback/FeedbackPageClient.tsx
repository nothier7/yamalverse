'use client';

import { useState } from 'react';
import supabase from '../lib/supabaseClient';

export default function FeedbackPageClient() {
  const [type, setType] = useState('Feature Request');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic input validation
    if (!message.trim()) {
      alert('Please enter a message.');
      return;
    }

    // Email validation if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Sanitize inputs
    const sanitizedType = type.trim();
    const sanitizedMessage = message.trim();
    const sanitizedEmail = email.trim() || null;

    setLoading(true);

    try {
      const { error } = await supabase.from('feedback').insert([
        { type: sanitizedType, message: sanitizedMessage, email: sanitizedEmail },
      ]);

      if (error) {
        console.error('Feedback submission error:', error);
        alert('Something went wrong. Try again later.');
        return;
      }

      setSubmitted(true);
      setMessage('');
      setEmail('');
    } catch (err) {
      console.error('Unexpected error submitting feedback:', err);
      alert('Something went wrong. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 py-10 max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-white">We&apos;d love your feedback</h1>
      <p className="text-neutral-400 text-sm text-center">
        Found a bug? Got a feature idea? Just want to say hi? Drop it below.
      </p>

      {submitted ? (
        <div className="bg-green-500/10 border border-green-500 text-green-200 p-4 rounded-md w-full text-center">
          Thanks for your feedback!
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-md space-y-4"
        >
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Feedback Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full p-2 bg-black border border-white/10 rounded-md text-white"
            >
              <option>Feature Request</option>
              <option>Bug Report</option>
              <option>General Feedback</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-1">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full p-2 bg-black border border-white/10 rounded-md text-white"
              placeholder="Type your feedback here..."
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-1">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 bg-black border border-white/10 rounded-md text-white"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-white text-black rounded-md font-medium hover:bg-white/90 transition"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}
