import { Link } from 'react-router-dom';
import {useCart} from '../../context/CartContext';

function Header() {
  const {cart} = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white text-gray-900 p-4 sticky top-0 z-10 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-sans font-bold">Haiti Bites</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:text-gray-600">Home</Link>
          <Link to="/menu" className="hover:text-gray-600">Menu</Link>
          <Link to="/cart" className="hover:text-gray-600">
            Cart {itemCount > 0 && `(${itemCount})`}
          </Link> 
          <Link to="/#contact" className="hover:text-gray-600">Contact</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;