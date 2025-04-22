function Hero() {
    return (
      <section
        id="home"
        className="relative h-[80vh] bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-bff31c812dba')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-white">
            Haitian Flavors, Elevated.
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Catering that brings Haiti to you.
          </p>
          <a
            href="#contact"
            className="bg-amber-600 text-white px-8 py-4 rounded-full font-semibold 
            hover:bg-amber-700 transition-colors text-lg"
          >
            Get Started
          </a>
        </div>
      </section>
    );
  }


/* function Hero() {
    return (
      <section
        id="home"
        className="relative h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-bff31c812dba')" }}
      >
        <div className="absolute inset-0 bg-gray-900 opacity-40"></div>
        <div className="relative container mx-auto h-full flex flex-col justify-center items-start text-white pl-8">
          <h2 className="text-6xl font-sans font-bold mb-4">Haitian Flavors, Elevated</h2>
          <p className="text-lg mb-6">Catering that brings Haiti to you.</p>
          <a
            href="#contact"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Get Started
          </a>
        </div>
      </section>
    );
  } */
  
  export default Hero;