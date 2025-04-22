
function Contact() {
    return (
      <section id="contact" className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-sans font-bold mb-8">Let's Talk</h3>
          <p className="text-lg mb-6">Ready to spice up your event?</p>
          <div className="flex justify-center space-x-4">
            <input
              type="text"
              placeholder="Name"
              className="p-3 rounded-lg text-black"
            />
            <input
              type="email"
              placeholder="Email"
              className="p-3 rounded-lg text-black"
            />
            <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    );
  }
  
  export default Contact;