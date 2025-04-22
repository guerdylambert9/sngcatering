function Header() {
  return (
    <header className="bg-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Haiti Bites
          </h1>
          
          {/* Navigation */}
          <nav className="flex space-x-8">
            <a
              href="#home"
              className="text-gray-900 hover:text-amber-600 
                         text-lg font-medium transition-colors"
            >
              Home
            </a>
            <a
              href="#menu"
              className="text-gray-900 hover:text-amber-600 
                         text-lg font-medium transition-colors"
            >
              Menu
            </a>
            <a
              href="#contact"
              className="text-gray-900 hover:text-amber-600 
                         text-lg font-medium transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}


// function Header() {
//   return (
//     <header className="bg-white text-gray-900 p-4 sticky top-0 z-50 shadow-md">
//       <div className="container mx-auto flex justify-between items-center">
        
//         <h1 className="text-3xl font-serif font-bold tracking-tight">Haiti Bites</h1>
        
//         <nav className="flex space-x-8">
//           <a 
//             href="#home" 
//             className="text-lg font-medium text-gray-700 hover:text-amber-600 transition-colors"
//           >
//             Home
//           </a>
//           <a 
//             href="#menu" 
//             className="text-lg font-medium text-gray-700 hover:text-amber-600 transition-colors"
//           >
//             Menu
//           </a>
//           <a 
//             href="#contact" 
//             className="text-lg font-medium text-gray-700 hover:text-amber-600 transition-colors"
//           >
//             Contact
//           </a>
//         </nav>
//       </div>
//     </header>
//   );
// }


/* function Header() {
  return (
    <header className="bg-white text-gray-900 p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold tracking-wide">Haiti Bites</h1>
        <nav className="flex gap-6"> 
          <a href="#home" className="text-gray-900 hover:text-gray-600 transition-colors">
            Home
          </a>
          <a href="#menu" className="text-gray-900 hover:text-gray-600 transition-colors">
            Menu
          </a>
          <a href="#contact" className="text-gray-900 hover:text-gray-600 transition-colors">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
} */



/* function Header() {
  return (
    <header className="bg-white text-gray-900 p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold tracking-wide">Haiti Bites</h1>
        <nav className="flex space-x-6">
          <a href="#home" className="hover:text-gray-600 transition-colors">Home</a>
          <a href="#menu" className="hover:text-gray-600 transition-colors">Menu</a>
          <a href="#contact" className="hover:text-gray-600 transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  );
} */



/* function Header() {
    return (
      <header className="bg-white text-gray-900 p-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
         
          <h1 className="text-3xl font-serif font-bold tracking-wide">Haiti Bites</h1>
          <nav className="flex space-x-8">
            <a href="#home" className="hover:text-amber-600 transition-colors font-medium">Home</a>
            <a href="#menu" className="hover:text-amber-600 transition-colors font-medium">Menu</a>
            <a href="#contact" className="hover:text-amber-600 transition-colors font-medium">Contact</a>
          </nav>
          
        </div>
      </header>
    );
  } */

/* function Header() {
    return (
      <header className="bg-white text-gray-900 p-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto flex justify-between items-center">

          <h1 className="text-3xl font-sans font-bold">Haiti Bites</h1>
          <nav className="space-x-6">
            <a href="#home" className="hover:text-gray-600">Home</a>
            <a href="#menu" className="hover:text-gray-600">Menu</a>
            <a href="#contact" className="hover:text-gray-600">Contact</a>
          </nav>
          
        </div>
      </header>
    );
  } */
  
  export default Header;
