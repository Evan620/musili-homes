
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We will respond to you shortly.",
      });
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-ivory via-pure-white to-soft-ivory">
      {/* Hero Section */}
      <section className="relative py-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-deep-charcoal/80 via-deep-charcoal/60 to-deep-charcoal/40"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="hero-text text-5xl md:text-6xl font-thin mb-6 tracking-wider luxury-heading">
              Contact Us
            </h1>
            <div className="w-32 h-px bg-gold-whisper mx-auto mb-8"></div>
            <p className="hero-text text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Connect with Kenya's premier luxury real estate specialists
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Contact Information */}
            <div className="space-y-12">
              <div>
                <h2 className="text-5xl font-thin luxury-heading mb-8 tracking-wide">Get In Touch</h2>
                <div className="w-20 h-px bg-gold-whisper mb-12"></div>
                <p className="text-xl luxury-text leading-relaxed">
                  Experience personalized service from Kenya's most trusted luxury real estate professionals.
                  We're here to guide you through every step of your property journey.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-8">
                <div className="group">
                  <div className="flex items-start space-x-6 p-8 bg-pure-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-satin-silver/20">
                    <div className="bg-gradient-to-br from-gold-whisper to-gold-whisper/80 rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-6 w-6 text-pure-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-light luxury-heading mb-2 tracking-wide">Our Location</h3>
                      <p className="luxury-text text-lg leading-relaxed">
                        Musili Homes Tower<br />
                        Westlands Business District<br />
                        Nairobi, Kenya
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-start space-x-6 p-8 bg-pure-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-satin-silver/20">
                    <div className="bg-gradient-to-br from-gold-whisper to-gold-whisper/80 rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Phone className="h-6 w-6 text-pure-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-light luxury-heading mb-2 tracking-wide">Phone Number</h3>
                      <p className="luxury-text text-lg">+254 700 123 456</p>
                      <p className="luxury-text text-sm opacity-70">Available 24/7 for urgent inquiries</p>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-start space-x-6 p-8 bg-pure-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-satin-silver/20">
                    <div className="bg-gradient-to-br from-gold-whisper to-gold-whisper/80 rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Mail className="h-6 w-6 text-pure-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-light luxury-heading mb-2 tracking-wide">Email Address</h3>
                      <p className="luxury-text text-lg">info@musilihomes.co.ke</p>
                      <p className="luxury-text text-sm opacity-70">We respond within 2 hours</p>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-start space-x-6 p-8 bg-pure-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-satin-silver/20">
                    <div className="bg-gradient-to-br from-gold-whisper to-gold-whisper/80 rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-pure-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-light luxury-heading mb-2 tracking-wide">Office Hours</h3>
                      <div className="luxury-text text-lg space-y-1">
                        <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                        <p>Saturday: 9:00 AM - 4:00 PM</p>
                        <p>Sunday: By appointment only</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-pure-white to-soft-ivory/30 p-12 rounded-3xl shadow-2xl border border-satin-silver/20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-thin luxury-heading mb-6 tracking-wide">Send Us A Message</h2>
                <div className="w-16 h-px bg-gold-whisper mx-auto mb-6"></div>
                <p className="luxury-text text-lg">
                  Share your property requirements and we'll connect you with the perfect solution
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="name" className="block text-lg font-light luxury-heading mb-3 tracking-wide">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                      className="w-full bg-pure-white border-2 border-satin-silver/40 text-deep-charcoal placeholder:text-deep-charcoal/50 rounded-xl px-6 py-4 text-lg font-light focus:border-gold-whisper/50 focus:ring-2 focus:ring-gold-whisper/20 transition-all duration-200 shadow-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-lg font-light luxury-heading mb-3 tracking-wide">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email address"
                      className="w-full bg-pure-white border-2 border-satin-silver/40 text-deep-charcoal placeholder:text-deep-charcoal/50 rounded-xl px-6 py-4 text-lg font-light focus:border-gold-whisper/50 focus:ring-2 focus:ring-gold-whisper/20 transition-all duration-200 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-lg font-light luxury-heading mb-3 tracking-wide">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full bg-pure-white border-2 border-satin-silver/40 text-deep-charcoal placeholder:text-deep-charcoal/50 rounded-xl px-6 py-4 text-lg font-light focus:border-gold-whisper/50 focus:ring-2 focus:ring-gold-whisper/20 transition-all duration-200 shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-lg font-light luxury-heading mb-3 tracking-wide">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Tell us about your property requirements, budget, preferred locations, or any questions you have..."
                    className="w-full rounded-xl border-2 border-satin-silver/40 bg-pure-white text-deep-charcoal placeholder:text-deep-charcoal/50 px-6 py-4 text-lg font-light focus:border-gold-whisper/50 focus:ring-2 focus:ring-gold-whisper/20 transition-all duration-200 shadow-sm resize-none"
                  ></textarea>
                </div>

                <div className="text-center pt-4">
                  <Button
                    type="submit"
                    className="luxury-button-primary px-16 py-4 text-lg font-light tracking-wide transition-all duration-300 hover:scale-105 shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending Message..." : "Send Message"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gradient-to-r from-deep-charcoal via-deep-charcoal/95 to-deep-charcoal">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="cta-text text-4xl font-thin mb-6 tracking-wide luxury-heading">Visit Our Office</h2>
            <div className="w-20 h-px bg-gold-whisper mx-auto mb-8"></div>
            <p className="cta-text text-xl font-light max-w-2xl mx-auto">
              Located in the heart of Westlands, our office is easily accessible and designed for your comfort
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gold-whisper/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63821.67512747117!2d36.776786767475216!3d-1.2682364393898622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c0a1d9195%3A0xd61b5a9cca94df77!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1619602591539!5m2!1sen!2ske"
                width="100%"
                height="500"
                loading="lazy"
                title="Musili Homes Office Location"
                className="filter grayscale hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
