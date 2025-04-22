function FeaturedDishes() {
  return (
    <section id="menu" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-sans font-bold mb-8 text-gray-900 text-center">Our Favorites</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Griot Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img
              src="https://images.unsplash.com/photo-1604328471151-b52226907017"
              alt="Griot"
              className="w-full h-60 object-cover"
            />
            <div className="p-6 text-center">
              <h4 className="text-xl font-semibold mb-2">Griot</h4>
              <p className="text-gray-600 text-sm">Crispy pork with a tangy pikitz side.</p>
            </div>
          </div>

          {/* Diri ak Djon Djon Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img
              src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
              alt="Diri ak Djon Djon"
              className="w-full h-60 object-cover"
            />
            <div className="p-6 text-center">
              <h4 className="text-xl font-semibold mb-2">Diri ak Djon Djon</h4>
              <p className="text-gray-600 text-sm">Distinctive black mushroom rice.</p>
            </div>
          </div>

          {/* Soup Joumou Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <img
              src="https://images.unsplash.com/photo-1608835291093-394b0c943a75"
              alt="Soup Joumou"
              className="w-full h-60 object-cover"
            />
            <div className="p-6 text-center">
              <h4 className="text-xl font-semibold mb-2">Soup Joumou</h4>
              <p className="text-gray-600 text-sm">Traditional pumpkin soup with bold flavors.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



/* function FeaturedDishes() {
  return (
    <section id="menu" className="py-16 bg-white">
      <div className="container mx-auto">
        <h3 className="text-3xl font-sans font-bold mb-8 text-gray-900">Our Favorites</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-100 rounded-lg p-6">
            <img
              src="https://images.unsplash.com/photo-1604328471151-b52226907017"
              alt="Griot"
              className="w-full h-48 object-cover rounded-lg"
            />
            <h4 className="text-xl font-sans font-semibold mt-4">Griot</h4>
            <p className="text-gray-600">Crispy pork with a tangy pikitz side.</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-6">
            <img
              src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
              alt="Diri ak Djon Djon"
              className="w-full h-48 object-cover rounded-lg"
            />
            <h4 className="text-xl font-sans font-semibold mt-4">Diri ak Djon Djon</h4>
            <p className="text-gray-600">Distinctive black mushroom rice.</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-6">
            <img
              src="https://images.unsplash.com/photo-1608835291093-394b0c943a75"
              alt="Soup Joumou"
              className="w-full h-48 object-cover rounded-lg"
            />
            <h4 className="text-xl font-sans font-semibold mt-4">Soup Joumou</h4>
            <p className="text-gray-600">Traditional pumpkin soup with bold flavors.</p>
          </div>
        </div>
      </div>
    </section>
  );
} */


/* function FeaturedDishes() {
    return (
      <section id="menu" className="py-16 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-sans font-bold mb-8 text-gray-900">Our Favorites</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-100 rounded-lg p-6">
              <img
                // src="https://images.unsplash.com/photo-1569058242253-92e6def208b0"
                //src="https://unsplash.com/photos/grilled-fish-cooked-vegetables-and-fork-on-plate-bpPTlXWTOvg"
                src="https://images.unsplash.com/photo-1604328471151-b52226907017"
                alt="Griot"
                className="w-full h-48 object-cover rounded-lg"
              />
              <h4 className="text-xl font-sans font-semibold mt-4">Griot</h4>
              <p className="text-gray-600">Crispy pork with a tangy pikliz side.</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-6">
              <img
                src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
                alt="Diri ak Djon Djon"
                className="w-full h-48 object-cover rounded-lg"
              />
              <h4 className="text-xl font-sans font-semibold mt-4">Diri ak Djon Djon</h4>
              <p className="text-gray-600">Distinctive black mushroom rice.</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-6">
              <img
                src="https://images.unsplash.com/photo-1604328471151-b52226907017"
                alt="Soup Joumou"
                className="w-full h-48 object-cover rounded-lg"
              />
              <h4 className="text-xl font-sans font-semibold mt-4">Soup Joumou</h4>
              <p className="text-gray-600">Traditional pumpkin soup with bold flavors.</p>
            </div>
          </div>
        </div>
      </section>
    );
  } */
  
  export default FeaturedDishes;
