import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './footer';
import { API_BASE_URL } from '../config/config';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Clear form after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Contact Header */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-center text-gray-800 mb-2 sm:mb-4">
              Contact Us
            </h1>
            <p className="text-base sm:text-xl text-center text-gray-600">
              Get in touch with us for any questions or concerns
            </p>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-8 sm:py-16 bg-white">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="max-w-lg sm:max-w-3xl mx-auto">
              <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8 text-center">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      placeholder="Enter subject"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      placeholder="Type your message here..."
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold text-base sm:text-lg"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-8 sm:py-16 bg-gray-50">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="max-w-2xl sm:max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-12">
                Get in Touch
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md text-center">
                  <div className="text-blue-500 mb-2 sm:mb-4">
                    <svg className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">Address</h3>
                  <p className="text-gray-600 text-sm sm:text-base">123 Healthcare Street<br />Medical District, City 12345</p>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md text-center">
                  <div className="text-blue-500 mb-2 sm:mb-4">
                    <svg className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">Phone</h3>
                  <p className="text-gray-600 text-sm sm:text-base">(123) 456-7890</p>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md text-center">
                  <div className="text-blue-500 mb-2 sm:mb-4">
                    <svg className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">Email</h3>
                  <p className="text-gray-600 text-sm sm:text-base">info@medassist.com</p>
                </div>
              </div>

              <div className="mt-8 sm:mt-12 bg-white p-4 sm:p-8 rounded-xl shadow-md">
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
                  Business Hours
                </h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4 text-center">
                  <div className="p-2 sm:p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2">Weekdays</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Monday - Friday</p>
                    <p className="text-gray-600 text-sm sm:text-base">9:00 AM - 6:00 PM</p>
                  </div>
                  <div className="p-2 sm:p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2">Saturday</h3>
                    <p className="text-gray-600 text-sm sm:text-base">9:00 AM - 1:00 PM</p>
                  </div>
                  <div className="p-2 sm:p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2">Sunday</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;