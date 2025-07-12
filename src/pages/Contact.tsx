
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Star, Award } from 'lucide-react';

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
        title: "Message Sent Successfully",
        description: "Thank you for your message. Our luxury property specialists will respond within 2 hours.",
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
      {/* Enhanced Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-deep-charcoal/85 via-deep-charcoal/70 to-deep-charcoal/50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-deep-charcoal/20"></div>
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gold-whisper/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gold-whisper/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="hero-text text-6xl md:text-7xl lg:text-8xl font-thin mb-8 tracking-wider luxury-heading">
                Contact Us
              </h1>
              <div className="w-40 h-px bg-gradient-to-r from-transparent via-gold-whisper to-transparent mx-auto mb-10"></div>
              <p className="hero-text text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-12">
                Connect with Kenya's premier luxury real estate specialists and discover your dream property
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-gold-whisper" />
                <span className="hero-text text-sm font-light opacity-80">5-Star Service</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gold-whisper" />
                <span className="hero-text text-sm font-light opacity-80">Award Winning</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gold-whisper" />
                <span className="hero-text text-sm font-light opacity-80">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Main Content */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-gold-whisper/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-soft-ivory/50 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Enhanced Contact Information */}
            <div className="space-y-12 animate-fade-in-up">
              <div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-thin luxury-heading mb-8 tracking-wide">Get In Touch</h2>
                <div className="w-24 h-px bg-gradient-to-r from-gold-whisper to-transparent mb-12"></div>
                <p className="text-xl md:text-2xl luxury-text leading-relaxed mb-8">
                  Experience personalized service from Kenya's most trusted luxury real estate professionals.
                  We're here to guide you through every step of your property journey.
                </p>
                <div className="flex flex-wrap gap-4">
                  <span className="inline-flex items-center px-4 py-2 bg-gold-whisper/10 text-gold-whisper rounded-full text-sm font-medium">
                    Premium Service
                  </span>
                  <span className="inline-flex items-center px-4 py-2 bg-gold-whisper/10 text-gold-whisper rounded-full text-sm font-medium">
                    Expert Guidance
                  </span>
                  <span className="inline-flex items-center px-4 py-2 bg-gold-whisper/10 text-gold-whisper rounded-full text-sm font-medium">
                    Luxury Properties
                  </span>
                </div>
              </div>

              {/* Enhanced Contact Cards */}
              <div className="space-y-6">
                <div className="group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-start space-x-6 p-8 bg-gradient-to-br from-pure-white to-soft-ivory/30 rounded-3xl shadow-luxury hover:shadow-luxury-lg transition-all duration-500 border border-satin-silver/20 group-hover:border-gold-whisper/30 group-hover:-translate-y-2">
                    <div className="bg-gradient-to-br from-gold-whisper to-gold-accent rounded-2xl p-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <MapPin className="h-7 w-7 text-pure-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-light luxury-heading mb-3 tracking-wide">Our Location</h3>
                      <p className="luxury-text text-lg leading-relaxed">
                        Musili Homes Tower<br />
                        Westlands Business District<br />
                        Nairobi, Kenya
                      </p>
                      <p className="text-gold-whisper text-sm mt-2 font-medium">Prime business location</p>
                    </div>
                  </div>
                </div>

                <div className="group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-start space-x-6 p-8 bg-gradient-to-br from-pure-white to-soft-ivory/30 rounded-3xl shadow-luxury hover:shadow-luxury-lg transition-all duration-500 border border-satin-silver/20 group-hover:border-gold-whisper/30 group-hover:-translate-y-2">
                    <div className="bg-gradient-to-br from-gold-whisper to-gold-accent rounded-2xl p-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Phone className="h-7 w-7 text-pure-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-light luxury-heading mb-3 tracking-wide">Phone Number</h3>
                      <p className="luxury-text text-lg font-medium">+254 700 123 456</p>
                      <p className="luxury-text text-sm opacity-70">Available 24/7 for urgent inquiries</p>
                      <p className="text-gold-whisper text-sm mt-2 font-medium">Instant response guaranteed</p>
                    </div>
                  </div>
                </div>

                <div className="group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-start space-x-6 p-8 bg-gradient-to-br from-pure-white to-soft-ivory/30 rounded-3xl shadow-luxury hover:shadow-luxury-lg transition-all duration-500 border border-satin-silver/20 group-hover:border-gold-whisper/30 group-hover:-translate-y-2">
                    <div className="bg-gradient-to-br from-gold-whisper to-gold-accent rounded-2xl p-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Mail className="h-7 w-7 text-pure-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-light luxury-heading mb-3 tracking-wide">Email Address</h3>
                      <p className="luxury-text text-lg font-medium">info@musillihomes.co.ke</p>
                      <p className="luxury-text text-sm opacity-70">We respond within 2 hours</p>
                      <p className="text-gold-whisper text-sm mt-2 font-medium">Professional consultation</p>
                    </div>
                  </div>
                </div>

                <div className="group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-start space-x-6 p-8 bg-gradient-to-br from-pure-white to-soft-ivory/30 rounded-3xl shadow-luxury hover:shadow-luxury-lg transition-all duration-500 border border-satin-silver/20 group-hover:border-gold-whisper/30 group-hover:-translate-y-2">
                    <div className="bg-gradient-to-br from-gold-whisper to-gold-accent rounded-2xl p-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Clock className="h-7 w-7 text-pure-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-light luxury-heading mb-3 tracking-wide">Office Hours</h3>
                      <div className="luxury-text text-lg space-y-1">
                        <p><span className="font-medium">Monday - Friday:</span> 8:00 AM - 6:00 PM</p>
                        <p><span className="font-medium">Saturday:</span> 9:00 AM - 4:00 PM</p>
                        <p><span className="font-medium">Sunday:</span> By appointment only</p>
                      </div>
                      <p className="text-gold-whisper text-sm mt-2 font-medium">Flexible scheduling available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Contact Form */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Form background with gradient and glass effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-pure-white via-soft-ivory/50 to-pure-white rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-gold-whisper/5 via-transparent to-gold-whisper/5 rounded-3xl"></div>

              <div className="relative bg-gradient-to-br from-pure-white/90 to-soft-ivory/40 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-luxury-xl border border-satin-silver/30 hover:shadow-luxury-xl transition-all duration-500">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-whisper to-gold-accent rounded-2xl mb-6 shadow-lg">
                    <Send className="w-8 h-8 text-pure-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-thin luxury-heading mb-6 tracking-wide">Send Us A Message</h2>
                  <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-whisper to-transparent mx-auto mb-6"></div>
                  <p className="luxury-text text-lg md:text-xl leading-relaxed max-w-md mx-auto">
                    Share your property requirements and we'll connect you with the perfect luxury solution
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="group">
                      <label htmlFor="name" className="block text-lg font-light luxury-heading mb-4 tracking-wide group-focus-within:text-gold-whisper transition-colors duration-200">
                        Full Name *
                      </label>
                      <div className="relative">
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Enter your full name"
                          className="w-full bg-pure-white/80 border-2 border-satin-silver/40 text-deep-charcoal placeholder:text-deep-charcoal/50 rounded-2xl px-6 py-5 text-lg font-light focus:border-gold-whisper focus:ring-4 focus:ring-gold-whisper/20 transition-all duration-300 shadow-sm hover:shadow-md group-focus-within:bg-pure-white"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-whisper/0 via-gold-whisper/5 to-gold-whisper/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="email" className="block text-lg font-light luxury-heading mb-4 tracking-wide group-focus-within:text-gold-whisper transition-colors duration-200">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="Enter your email address"
                          className="w-full bg-pure-white/80 border-2 border-satin-silver/40 text-deep-charcoal placeholder:text-deep-charcoal/50 rounded-2xl px-6 py-5 text-lg font-light focus:border-gold-whisper focus:ring-4 focus:ring-gold-whisper/20 transition-all duration-300 shadow-sm hover:shadow-md group-focus-within:bg-pure-white"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-whisper/0 via-gold-whisper/5 to-gold-whisper/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="phone" className="block text-lg font-light luxury-heading mb-4 tracking-wide group-focus-within:text-gold-whisper transition-colors duration-200">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full bg-pure-white/80 border-2 border-satin-silver/40 text-deep-charcoal placeholder:text-deep-charcoal/50 rounded-2xl px-6 py-5 text-lg font-light focus:border-gold-whisper focus:ring-4 focus:ring-gold-whisper/20 transition-all duration-300 shadow-sm hover:shadow-md group-focus-within:bg-pure-white"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-whisper/0 via-gold-whisper/5 to-gold-whisper/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="message" className="block text-lg font-light luxury-heading mb-4 tracking-wide group-focus-within:text-gold-whisper transition-colors duration-200">
                      Message *
                    </label>
                    <div className="relative">
                      <textarea
                        id="message"
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        placeholder="Tell us about your property requirements, budget, preferred locations, or any questions you have. Our luxury property specialists are here to help you find your dream home..."
                        className="w-full rounded-2xl border-2 border-satin-silver/40 bg-pure-white/80 text-deep-charcoal placeholder:text-deep-charcoal/50 px-6 py-5 text-lg font-light focus:border-gold-whisper focus:ring-4 focus:ring-gold-whisper/20 transition-all duration-300 shadow-sm hover:shadow-md resize-none group-focus-within:bg-pure-white"
                      ></textarea>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gold-whisper/0 via-gold-whisper/5 to-gold-whisper/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="text-center pt-6">
                    <Button
                      type="submit"
                      className="group luxury-button-primary px-12 md:px-16 py-5 text-lg font-light tracking-wide transition-all duration-500 hover:scale-105 shadow-gold hover:shadow-luxury-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={isSubmitting}
                    >
                      <span className="flex items-center gap-3">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin"></div>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                          </>
                        )}
                      </span>
                    </Button>
                    <p className="text-sm luxury-text mt-4 opacity-70">
                      * Required fields. We'll respond within 2 hours during business hours.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Map Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-deep-charcoal via-deep-charcoal/95 to-rich-charcoal relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-gold-whisper/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gold-whisper/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-whisper to-gold-accent rounded-2xl mb-8 shadow-lg">
              <MapPin className="w-8 h-8 text-pure-white" />
            </div>
            <h2 className="cta-text text-4xl md:text-5xl lg:text-6xl font-thin mb-8 tracking-wide luxury-heading">Visit Our Office</h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-whisper to-transparent mx-auto mb-8"></div>
            <p className="cta-text text-xl md:text-2xl font-light max-w-3xl mx-auto leading-relaxed">
              Located in the heart of Westlands, our office is easily accessible and designed for your comfort.
              Experience luxury real estate consultation in our premium environment.
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {/* Map container with enhanced styling */}
              <div className="relative rounded-3xl overflow-hidden shadow-luxury-xl border-4 border-gold-whisper/30 group-hover:border-gold-whisper/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-whisper/10 via-transparent to-gold-whisper/10 pointer-events-none z-10"></div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63821.67512747117!2d36.776786767475216!3d-1.2682364393898622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c0a1d9195%3A0xd61b5a9cca94df77!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1619602591539!5m2!1sen!2ske"
                  width="100%"
                  height="600"
                  loading="lazy"
                  title="Musili Homes Office Location"
                  className="filter grayscale hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                ></iframe>
              </div>

              {/* Office details overlay */}
              <div className="absolute bottom-8 left-8 right-8 bg-gradient-to-r from-pure-white/95 to-soft-ivory/95 backdrop-blur-sm rounded-2xl p-6 shadow-luxury border border-satin-silver/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                  <div>
                    <h4 className="font-medium luxury-heading text-lg mb-2">Address</h4>
                    <p className="luxury-text text-sm">Musili Homes Tower, Westlands Business District</p>
                  </div>
                  <div>
                    <h4 className="font-medium luxury-heading text-lg mb-2">Parking</h4>
                    <p className="luxury-text text-sm">Complimentary valet parking available</p>
                  </div>
                  <div>
                    <h4 className="font-medium luxury-heading text-lg mb-2">Accessibility</h4>
                    <p className="luxury-text text-sm">Wheelchair accessible with elevator access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-soft-ivory via-pure-white to-warm-ivory relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gold-whisper/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gold-whisper/3 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-thin luxury-heading mb-8 tracking-wide">
              Ready to Find Your Dream Home?
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-whisper to-transparent mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl luxury-text leading-relaxed mb-12 max-w-3xl mx-auto">
              Let our expert team guide you through Kenya's most exclusive properties.
              Your luxury lifestyle awaits.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button className="group luxury-button-primary px-12 py-5 text-lg font-light tracking-wide shadow-gold hover:shadow-luxury-lg">
                <span className="flex items-center gap-3">
                  Schedule Consultation
                  <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </Button>
              <Button variant="outline" className="group border-deep-charcoal border-2 bg-pure-white hover:bg-deep-charcoal hover:text-pure-white px-12 py-5 text-lg font-light tracking-wide transition-all duration-300">
                <span className="flex items-center gap-3 text-deep-charcoal group-hover:text-pure-white">
                  Browse Properties
                  <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
