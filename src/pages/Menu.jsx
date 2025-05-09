import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/HeaderComponent/Header';
import { useCart } from '../context/CartContext';
import axios from 'axios';

function Menu() {
  const { addToCart, orderType, setOrderType, sessionId } = useCart();
  const [dishes, setDishes] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState(null);

  // Fetch dishes from backend on mount
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        console.log('Fetching dishes from: http://localhost:8082/api/dishes');
        const response = await axios.get('http://localhost:8082/api/dishes');
        console.log('Received dishes:', response.data);
        const formattedDishes = response.data.map(dish => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          image: dish.imageUrl,
        }));
        setDishes(formattedDishes);
        setError(null);
      } catch (error) {
        console.error('Error fetching dishes:', error);
        setError('Failed to load menu. Please try again later.');
        if (error.response) {
          console.log('Response data:', error.response.data);
          console.log('Response status:', error.response.status);
        } else if (error.request) {
          console.log('No response received:', error.request);
        } else {
          console.log('Error message:', error.message);
        }
      }
    };
    fetchDishes();
  }, []);

  // Handle quantity change
  const handleQuantityChange = (dishName, value) => {
    setQuantities((prev) => ({
      ...prev,
      [dishName]: Math.max(1, parseInt(value) || 1),
    }));
  };

  // Handle adding to cart
  const handleAddToCart = async (dish) => {
    const quantity = quantities[dish.name] || 1;
    try {
      await axios.post(`http://localhost:8082/api/cart/${sessionId}/add?dishId=${dish.id}&quantity=${quantity}`);
      addToCart({ ...dish, quantity, dishId: dish.id });
      setQuantities((prev) => ({ ...prev, [dish.name]: 1 }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  return (
    <div>
      <Header />
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-sans font-bold mb-8 text-gray-900 text-center">
            Our Menu
          </h2>
          {error && (
            <p className="text-center text-red-600 mb-8">{error}</p>
          )}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setOrderType('regular')}
              className={`px-6 py-3 rounded-lg font-semibold mr-4 ${
                orderType === 'regular'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
              aria-label="Select Regular Order"
            >
              Regular Order
            </button>
            <button
              onClick={() => setOrderType('catering')}
              className={`px-6 py-3 rounded-lg font-semibold ${
                orderType === 'catering'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
              aria-label="Select Catering Order"
            >
              Catering (20+ People)
            </button>
          </div>
          {orderType === 'catering' && (
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-4">
                Add dishes to your catering order (optional) or proceed directly to the inquiry form.
              </p>
              <Link
                to="/cart"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Proceed to Catering Inquiry
              </Link>
            </div>
          )}
          {dishes.length === 0 && !error ? (
            <p className="text-center text-gray-600">Loading menu...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dishes.map((dish, index) => (
                <div key={index} className="bg-gray-100 rounded-lg p-6">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-sans font-semibold text-gray-900">
                    {dish.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{dish.description}</p>
                  <p className="text-lg font-bold text-gray-900">${dish.price.toFixed(2)}</p>
                  <div className="flex items-center mt-4 space-x-4">
                    <input
                      type="number"
                      min="1"
                      value={quantities[dish.name] || 1}
                      onChange={(e) => handleQuantityChange(dish.name, e.target.value)}
                      className="w-16 p-2 rounded-lg text-black border border-gray-300"
                      aria-label={`Quantity for ${dish.name}`}
                    />
                    <button
                      onClick={() => handleAddToCart(dish)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                      aria-label={`Add ${dish.name} to cart`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Menu;









// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import Header from '../components/HeaderComponent/Header';
// import { useCart } from '../context/CartContext';
// import axios from 'axios';

// function Menu() {
//   const { addToCart, orderType, setOrderType, sessionId } = useCart();
//   const [dishes, setDishes] = useState([]);
//   const [quantities, setQuantities] = useState({});

//   // Fetch dishes from backend on mount
//   useEffect(() => {
//     const fetchDishes = async () => {
//       try {
//         const response = await axios.get('http://localhost:8082/api/dishes');
//         // Map backend dish format to frontend format
//         const formattedDishes = response.data.map(dish => ({
//           id: dish.id,
//           name: dish.name,
//           description: dish.description,
//           price: dish.price,
//           image: dish.imageUrl,
//         }));
//         setDishes(formattedDishes);
//       } catch (error) {
//         console.error('Error fetching dishes:', error);
//       }
//     };
//     fetchDishes();
//   }, []);

//   // Handle quantity change
//   const handleQuantityChange = (dishName, value) => {
//     setQuantities((prev) => ({
//       ...prev,
//       [dishName]: Math.max(1, parseInt(value) || 1),
//     }));
//   };

//   // Handle adding to cart
//   const handleAddToCart = async (dish) => {
//     const quantity = quantities[dish.name] || 1;
//     try {
//       await axios.post(`http://localhost:8082/api/cart/${sessionId}/add?dishId=${dish.id}&quantity=${quantity}`);
//       addToCart({ ...dish, quantity, dishId: dish.id });
//       setQuantities((prev) => ({ ...prev, [dish.name]: 1 }));
//     } catch (error) {
//       console.error('Error adding to cart:', error);
//       alert('Failed to add item to cart. Please try again.');
//     }
//   };

//   return (
//     <div>
//       <Header />
//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-4">
//           <h2 className="text-4xl font-sans font-bold mb-8 text-gray-900 text-center">
//             Our Menu
//           </h2>
//           <div className="flex justify-center mb-8">
//             <button
//               onClick={() => setOrderType('regular')}
//               className={`px-6 py-3 rounded-lg font-semibold mr-4 ${
//                 orderType === 'regular'
//                   ? 'bg-gray-900 text-white'
//                   : 'bg-gray-200 text-gray-900'
//               }`}
//               aria-label="Select Regular Order"
//             >
//               Regular Order
//             </button>
//             <button
//               onClick={() => setOrderType('catering')}
//               className={`px-6 py-3 rounded-lg font-semibold ${
//                 orderType === 'catering'
//                   ? 'bg-gray-900 text-white'
//                   : 'bg-gray-200 text-gray-900'
//               }`}
//               aria-label="Select Catering Order"
//             >
//               Catering (20+ People)
//             </button>
//           </div>
//           {orderType === 'catering' && (
//             <div className="text-center mb-8">
//               <p className="text-gray-600 mb-4">
//                 Add dishes to your catering order (optional) or proceed directly to the inquiry form.
//               </p>
//               <Link
//                 to="/cart"
//                 className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
//               >
//                 Proceed to Catering Inquiry
//               </Link>
//             </div>
//           )}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {dishes.map((dish, index) => (
//               <div key={index} className="bg-gray-100 rounded-lg p-6">
//                 <img
//                   src={dish.image}
//                   alt={dish.name}
//                   className="w-full h-48 object-cover rounded-lg mb-4"
//                 />
//                 <h3 className="text-xl font-sans font-semibold text-gray-900">
//                   {dish.name}
//                 </h3>
//                 <p className="text-gray-600 mb-2">{dish.description}</p>
//                 <p className="text-lg font-bold text-gray-900">${dish.price.toFixed(2)}</p>
//                 <div className="flex items-center mt-4 space-x-4">
//                   <input
//                     type="number"
//                     min="1"
//                     value={quantities[dish.name] || 1}
//                     onChange={(e) => handleQuantityChange(dish.name, e.target.value)}
//                     className="w-16 p-2 rounded-lg text-black border border-gray-300"
//                     aria-label={`Quantity for ${dish.name}`}
//                   />
//                   <button
//                     onClick={() => handleAddToCart(dish)}
//                     className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
//                     aria-label={`Add ${dish.name} to cart`}
//                   >
//                     Add to Cart
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default Menu;