import { useState, useEffect, useCallback } from 'react';
import Header from '../components/HeaderComponent/Header';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Load Stripe with the public key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ orderDetails, setOrderDetails, cateringDetails, setCateringDetails, isCatering, totalPrice, sessionId, cart, clearCart }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  // Fetch PaymentIntent client secret from backend
  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/create-payment-intent`, {
          amount: Math.round(totalPrice * 100), // Convert to cents
          currency: 'usd',
          sessionId,
        });
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error('Error fetching client secret:', err.response || err.message);
        setError('Failed to initialize payment. Please try again.');
      }
    };
    if (totalPrice > 0) {
      fetchClientSecret();
    }
  }, [totalPrice, sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system is not ready. Please try again.');
      setProcessing(false);
      return;
    }

    if (!isCatering) {
      if (!orderDetails.name || !orderDetails.email || !orderDetails.address || !orderDetails.phone) {
        setError('Please fill in all required fields');
        setProcessing(false);
        return;
      }
    } else {
      if (
        !cateringDetails.name ||
        !cateringDetails.email ||
        !cateringDetails.phone ||
        !cateringDetails.eventDate ||
        !cateringDetails.guests
      ) {
        setError('Please fill in all required fields');
        setProcessing(false);
        return;
      }
      if (parseInt(cateringDetails.guests) < 20) {
        setError('Catering orders must be for 20 or more people');
        setProcessing(false);
        return;
      }
    }

    if (cart.length === 0) {
      setError('Your cart is empty. Please add items before submitting.');
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: isCatering ? cateringDetails.name : orderDetails.name,
            email: isCatering ? cateringDetails.email : orderDetails.email,
            phone: isCatering ? cateringDetails.phone : orderDetails.phone,
            address: !isCatering ? { line1: orderDetails.address } : undefined,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Submit order to backend
        const payload = isCatering
          ? {
              type: 'catering',
              name: cateringDetails.name,
              email: cateringDetails.email,
              phone: cateringDetails.phone,
              eventDate: cateringDetails.eventDate,
              guests: parseInt(cateringDetails.guests),
              preferences: cateringDetails.preferences || '',
              totalPrice: parseFloat(totalPrice.toFixed(2)),
              paymentIntentId: paymentIntent.id,
              items: [],
            }
          : {
              type: 'regular',
              name: orderDetails.name,
              email: orderDetails.email,
              address: orderDetails.address,
              phone: orderDetails.phone,
              totalPrice: parseFloat(totalPrice.toFixed(2)),
              paymentIntentId: paymentIntent.id,
              items: [],
            };

        await axios.post(`${import.meta.env.VITE_API_URL}/api/orders/${sessionId}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });

        alert(isCatering ? 'Catering inquiry submitted successfully!' : 'Order submitted successfully!');
        clearCart();
        setProcessing(false);
        if (isCatering) {
          setCateringDetails({ name: '', email: '', phone: '', eventDate: '', guests: '', preferences: '' });
        } else {
          setOrderDetails({ name: '', email: '', address: '', phone: '' });
        }
      }
    } catch (err) {
      console.error('Error processing payment:', err.response || err.message);
      setError(`Failed to process payment: ${err.response?.data?.message || err.message}`);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-6 text-gray-900">{isCatering ? 'Catering Inquiry' : 'Checkout'}</h3>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {isCatering ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={cateringDetails.name}
            onChange={(e) => setCateringDetails({ ...cateringDetails, name: e.target.value })}
            className="p-3 rounded-lg text-black border border-gray-300"
            aria-label="Name"
            disabled={processing}
          />
          <input
            type="email"
            placeholder="Email"
            value={cateringDetails.email}
            onChange={(e) => setCateringDetails({ ...cateringDetails, email: e.target.value })}
            className="p-3 rounded-lg text-black border border-gray-300"
            aria-label="Email"
            disabled={processing}
          />
          <input
            type="tel"
            placeholder="Phone"
            value={cateringDetails.phone}
            onChange={(e) => setCateringDetails({ ...cateringDetails, phone: e.target.value })}
            className="p-3 rounded-lg text-black border border-gray-300"
            aria-label="Phone"
            disabled={processing}
          />
          <input
            type="date"
            placeholder="Event Date"
            value={cateringDetails.eventDate}
            onChange={(e) => setCateringDetails({ ...cateringDetails, eventDate: e.target.value })}
            className="p-3 rounded-lg text-black border border-gray-300"
            aria-label="Event Date"
            disabled={processing}
          />
          <input
            type="number"
            placeholder="Number of Guests (20+)"
            value={cateringDetails.guests}
            onChange={(e) => setCateringDetails({ ...cateringDetails, guests: e.target.value })}
            className="p-3 rounded-lg text-black border border-gray-300"
            aria-label="Number of Guests"
            disabled={processing}
          />
          <textarea
            placeholder="Special Preferences"
            value={cateringDetails.preferences}
            onChange={(e) => setCateringDetails({ ...cateringDetails, preferences: e.target.value })}
            className="p-3 rounded-lg text-black border border-gray-300 col-span-2"
            rows="4"
            aria-label="Special Preferences"
            disabled={processing}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={orderDetails.name}
            onChange={(e) => setOrderDetails({ ...orderDetails, name: e.target.value })}
            className="p-3 rounded-lg text-black border border-gray-300"
            aria-label="Name"
            disabled={processing}
          />
          <input
            type="email"
            placeholder="Email"
            value={orderDetails.email}
            onChange={(e) => setOrderDetails({ ...orderDetails, email: e.target.value })}
            className="p-3 rounded-lg text-black border border-gray-300"
            aria-label="Email"
            disabled={processing}
          />
          <input
            type="text"
            placeholder="Delivery Address"
            value={orderDetails.address}
            onChange={(e) => setOrderDetails({ ...orderDetails, address: e.target.value })}
            className="p-3 rounded-lg text-black border border-gray-300"
            aria-label="Delivery Address"
            disabled={processing}
          />
          <input
            type="tel"
            placeholder="Phone"
            value={orderDetails.phone}
            onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })}
            className="p-3 rounded-lg text-black border border-gray-300"
            aria-label="Phone"
            disabled={processing}
          />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm text-gray-900 font-semibold mb-2">Card Details</label>
        <CardElement
          className="p-3 mt-4 rounded-lg border border-gray-300 bg-white"
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
            },
          }}
        />
      </div>
      <button
        type="submit"
        className={`mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition ${
          processing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label={isCatering ? 'Submit Catering Inquiry' : 'Place Order'}
        disabled={processing || !clientSecret}
      >
        {processing ? 'Processing...' : isCatering ? 'Submit Catering Inquiry' : 'Place Order'}
      </button>
    </form>
  );
};

function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, orderType, setOrderType, sessionId } = useCart();
  const [isCatering, setIsCatering] = useState(orderType === 'catering');
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });
  const [cateringDetails, setCateringDetails] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guests: '',
    preferences: '',
  });
  const [error, setError] = useState(null);

  // Calculate total items and price
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // Function to fetch cart items
  const fetchCart = useCallback(async () => {
    try {
      if (!sessionId) {
        setError('Invalid session. Please refresh the page.');
        return;
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart/${sessionId}`);
      const formattedCart = response.data.map((item) => ({
        name: item.dish.name,
        price: item.dish.price,
        quantity: item.quantity,
        dishId: item.dish.id,
      }));
      updateQuantity(formattedCart);
      setError(null);
    } catch (error) {
      console.error('Error fetching cart:', error.response || error.message);
      setError('Failed to load cart. Please try again.');
    }
  }, [sessionId, updateQuantity]);

  // Fetch cart on mount or sessionId change
  useEffect(() => {
    fetchCart();
  }, [sessionId, fetchCart]);

  // Handle order type change
  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    setIsCatering(type === 'catering');
  };

  // Handle quantity update with refetch
  const handleQuantityUpdate = async (dishId, quantity) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/cart/${sessionId}/update?dishId=${dishId}&quantity=${quantity}`
      );
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error.response || error.message);
      alert('Failed to update quantity. Please try again.');
    }
  };

  // Handle item removal with refetch
  const handleRemoveFromCart = async (dishId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/cart/${sessionId}/remove?dishId=${dishId}`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error.response || error.message);
      alert('Failed to remove item. Please try again.');
    }
  };

  return (
    <div>
      <Header />
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-sans font-bold mb-12 text-gray-900 text-center">Your Cart</h2>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          {cart.length === 0 ? (
            <p className="text-center text-gray-600">Your cart is empty.</p>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-100 rounded-lg p-6 mb-8">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b py-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityUpdate(item.dishId, parseInt(e.target.value) || 1)}
                        className="w-16 p-2 rounded-lg text-black border border-gray-300"
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <button
                        onClick={() => handleRemoveFromCart(item.dishId)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-6 text-right">
                  <p className="text-lg font-bold text-gray-900">
                    Total: ${totalPrice.toFixed(2)} ({totalItems} items)
                  </p>
                </div>
              </div>
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => handleOrderTypeChange('regular')}
                  className={`px-6 py-3 rounded-lg font-semibold mr-4 ${
                    !isCatering ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-900'
                  }`}
                  aria-label="Select Regular Order"
                >
                  Regular Order
                </button>
                <button
                  onClick={() => handleOrderTypeChange('catering')}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    isCatering ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-900'
                  }`}
                  aria-label="Select Catering Order"
                >
                  Catering (20+ People)
                </button>
              </div>
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  orderDetails={orderDetails}
                  setOrderDetails={setOrderDetails} // Added
                  cateringDetails={cateringDetails}
                  setCateringDetails={setCateringDetails} // Added
                  isCatering={isCatering}
                  totalPrice={totalPrice}
                  sessionId={sessionId}
                  cart={cart}
                  clearCart={clearCart}
                />
              </Elements>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Cart;









// import { useState, useEffect, useCallback } from 'react';
// import Header from '../components/HeaderComponent/Header';
// import { useCart } from '../context/CartContext';
// import axios from 'axios';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLIC_KEY);
// //console.log('Stripe Key:', process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// // Load Stripe with the public key from environment variables
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
// //const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// const CheckoutForm = ({ orderDetails, cateringDetails, isCatering, totalPrice, sessionId, cart, clearCart }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [error, setError] = useState(null);
//   const [processing, setProcessing] = useState(false);
//   const [clientSecret, setClientSecret] = useState(null);

//   // Fetch PaymentIntent client secret from backend
//   useEffect(() => {
//     const fetchClientSecret = async () => {
//       try {
//         const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/create-payment-intent`, {
//           amount: Math.round(totalPrice * 100), // Convert to cents
//           currency: 'usd',
//           sessionId,
//         });
//         setClientSecret(response.data.clientSecret);
//       } catch (err) {
//         console.error('Error fetching client secret:', err.response || err.message);
//         setError('Failed to initialize payment. Please try again.');
//       }
//     };
//     if (totalPrice > 0) {
//       fetchClientSecret();
//     }
//   }, [totalPrice, sessionId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setProcessing(true);
//     setError(null);

//     if (!stripe || !elements || !clientSecret) {
//       setError('Payment system is not ready. Please try again.');
//       setProcessing(false);
//       return;
//     }

//     if (!isCatering) {
//       if (!orderDetails.name || !orderDetails.email || !orderDetails.address || !orderDetails.phone) {
//         setError('Please fill in all required fields');
//         setProcessing(false);
//         return;
//       }
//     } else {
//       if (
//         !cateringDetails.name ||
//         !cateringDetails.email ||
//         !cateringDetails.phone ||
//         !cateringDetails.eventDate ||
//         !cateringDetails.guests
//       ) {
//         setError('Please fill in all required fields');
//         setProcessing(false);
//         return;
//       }
//       if (parseInt(cateringDetails.guests) < 20) {
//         setError('Catering orders must be for 20 or more people');
//         setProcessing(false);
//         return;
//       }
//     }

//     if (cart.length === 0) {
//       setError('Your cart is empty. Please add items before submitting.');
//       setProcessing(false);
//       return;
//     }

//     const cardElement = elements.getElement(CardElement);

//     try {
//       // Confirm the payment with Stripe
//       const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//         payment_method: {
//           card: cardElement,
//           billing_details: {
//             name: isCatering ? cateringDetails.name : orderDetails.name,
//             email: isCatering ? cateringDetails.email : orderDetails.email,
//             phone: isCatering ? cateringDetails.phone : orderDetails.phone,
//             address: !isCatering ? { line1: orderDetails.address } : undefined,
//           },
//         },
//       });

//       if (stripeError) {
//         setError(stripeError.message);
//         setProcessing(false);
//         return;
//       }

//       if (paymentIntent.status === 'succeeded') {
//         // Submit order to backend
//         const payload = isCatering
//           ? {
//               type: 'catering',
//               name: cateringDetails.name,
//               email: cateringDetails.email,
//               phone: cateringDetails.phone,
//               eventDate: cateringDetails.eventDate,
//               guests: parseInt(cateringDetails.guests),
//               preferences: cateringDetails.preferences || '',
//               totalPrice: parseFloat(totalPrice.toFixed(2)),
//               paymentIntentId: paymentIntent.id,
//               items: [],
//             }
//           : {
//               type: 'regular',
//               name: orderDetails.name,
//               email: orderDetails.email,
//               address: orderDetails.address,
//               phone: orderDetails.phone,
//               totalPrice: parseFloat(totalPrice.toFixed(2)),
//               paymentIntentId: paymentIntent.id,
//               items: [],
//             };

//         await axios.post(`${import.meta.env.VITE_API_URL}/api/orders/${sessionId}`, payload, {
//           headers: { 'Content-Type': 'application/json' },
//         });

//         alert(isCatering ? 'Catering inquiry submitted successfully!' : 'Order submitted successfully!');
//         clearCart();
//         setProcessing(false);
//         if (isCatering) {
//           setCateringDetails({ name: '', email: '', phone: '', eventDate: '', guests: '', preferences: '' });
//         } else {
//           setOrderDetails({ name: '', email: '', address: '', phone: '' });
//         }
//       }
//     } catch (err) {
//       console.error('Error processing payment:', err.response || err.message);
//       setError(`Failed to process payment: ${err.response?.data?.message || err.message}`);
//       setProcessing(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="bg-gray-100 rounded-lg p-6">
//       <h3 className="text-2xl font-semibold mb-6 text-gray-900">{isCatering ? 'Catering Inquiry' : 'Checkout'}</h3>
//       {error && <p className="text-red-600 mb-4">{error}</p>}
//       {isCatering ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <input
//             type="text"
//             placeholder="Name"
//             value={cateringDetails.name}
//             onChange={(e) => setCateringDetails({ ...cateringDetails, name: e.target.value })}
//             className="p-3 rounded-lg text-black border border-gray-300"
//             aria-label="Name"
//             disabled={processing}
//           />
//           <input
//             type="email"
//             placeholder="Email"
//             value={cateringDetails.email}
//             onChange={(e) => setCateringDetails({ ...cateringDetails, email: e.target.value })}
//             className="p-3 rounded-lg text-black border border-gray-300"
//             aria-label="Email"
//             disabled={processing}
//           />
//           <input
//             type="tel"
//             placeholder="Phone"
//             value={cateringDetails.phone}
//             onChange={(e) => setCateringDetails({ ...cateringDetails, phone: e.target.value })}
//             className="p-3 rounded-lg text-black border border-gray-300"
//             aria-label="Phone"
//             disabled={processing}
//           />
//           <input
//             type="date"
//             placeholder="Event Date"
//             value={cateringDetails.eventDate}
//             onChange={(e) => setCateringDetails({ ...cateringDetails, eventDate: e.target.value })}
//             className="p-3 rounded-lg text-black border border-gray-300"
//             aria-label="Event Date"
//             disabled={processing}
//           />
//           <input
//             type="number"
//             placeholder="Number of Guests (20+)"
//             value={cateringDetails.guests}
//             onChange={(e) => setCateringDetails({ ...cateringDetails, guests: e.target.value })}
//             className="p-3 rounded-lg text-black border border-gray-300"
//             aria-label="Number of Guests"
//             disabled={processing}
//           />
//           <textarea
//             placeholder="Special Preferences"
//             value={cateringDetails.preferences}
//             onChange={(e) => setCateringDetails({ ...cateringDetails, preferences: e.target.value })}
//             className="p-3 rounded-lg text-black border border-gray-300 col-span-2"
//             rows="4"
//             aria-label="Special Preferences"
//             disabled={processing}
//           />
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <input
//             type="text"
//             placeholder="Name"
//             value={orderDetails.name}
//             onChange={(e) => setOrderDetails({ ...orderDetails, name: e.target.value })}
//             className="p-3 rounded-lg text-black border border-gray-300"
//             aria-label="Name"
//             disabled={processing}
//           />
//           <input
//             type="email"
//             placeholder="Email"
//             value={orderDetails.email}
//             onChange={(e) => setOrderDetails({ ...orderDetails, email: e.target.value })}
//             className="p-3 rounded-lg text-black border border-gray-300"
//             aria-label="Email"
//             disabled={processing}
//           />
//           <input
//             type="text"
//             placeholder="Delivery Address"
//             value={orderDetails.address}
//             onChange={(e) => setOrderDetails({ ...orderDetails, address: e.target.value })}
//             className="p-3 rounded-lg text-black border border-gray-300"
//             aria-label="Delivery Address"
//             disabled={processing}
//           />
//           <input
//             type="tel"
//             placeholder="Phone"
//             value={orderDetails.phone}
//             onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })}
//             className="p-3 rounded-lg text-black border border-gray-300"
//             aria-label="Phone"
//             disabled={processing}
//           />
//         </div>
//       )}
//       <div className="mb-4">
//         <label className="block text -mb-2 text-sm text-gray-900 font-semibold">Card Details</label>
//         <CardElement
//           className="p-3 mt-4 rounded-lg border border-gray-300 bg-white"
//           options={{
//             style: {
//               base: {
//                 fontSize: '16px',
//                 color: '#424770',
//                 '::placeholder': { color: '#aab7c4' },
//               },
//               invalid: { color: '#9e2146' },
//             },
//           }}
//         />
//       </div>
//       <button
//         type="submit"
//         className={`mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition ${
//           processing ? 'opacity-50 cursor-not-allowed' : ''
//         }`}
//         aria-label={isCatering ? 'Submit Catering Inquiry' : 'Place Order'}
//         disabled={processing || !clientSecret}
//       >
//         {processing ? 'Processing...' : isCatering ? 'Submit Catering Inquiry' : 'Place Order'}
//       </button>
//     </form>
//   );
// };

// function Cart() {
//   const { cart, updateQuantity, removeFromCart, clearCart, orderType, setOrderType, sessionId } = useCart();
//   const [isCatering, setIsCatering] = useState(orderType === 'catering');
//   const [orderDetails, setOrderDetails] = useState({
//     name: '',
//     email: '',
//     address: '',
//     phone: '',
//   });
//   const [cateringDetails, setCateringDetails] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     eventDate: '',
//     guests: '',
//     preferences: '',
//   });
//   const [error, setError] = useState(null);

//   // Calculate total items and price
//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//   const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

//   // Function to fetch cart items
//   const fetchCart = useCallback(async () => {
//     try {
//       if (!sessionId) {
//         setError('Invalid session. Please refresh the page.');
//         return;
//       }
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart/${sessionId}`);
//       const formattedCart = response.data.map((item) => ({
//         name: item.dish.name,
//         price: item.dish.price,
//         quantity: item.quantity,
//         dishId: item.dish.id,
//       }));
//       updateQuantity(formattedCart);
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching cart:', error.response || error.message);
//       setError('Failed to load cart. Please try again.');
//     }
//   }, [sessionId, updateQuantity]);

//   // Fetch cart on mount or sessionId change
//   useEffect(() => {
//     fetchCart();
//   }, [sessionId, fetchCart]);

//   // Handle order type change
//   const handleOrderTypeChange = (type) => {
//     setOrderType(type);
//     setIsCatering(type === 'catering');
//   };

//   // Handle quantity update with refetch
//   const handleQuantityUpdate = async (dishId, quantity) => {
//     try {
//       await axios.put(
//         `${import.meta.env.VITE_API_URL}/api/cart/${sessionId}/update?dishId=${dishId}&quantity=${quantity}`
//       );
//       await fetchCart();
//     } catch (error) {
//       console.error('Error updating quantity:', error.response || error.message);
//       alert('Failed to update quantity. Please try again.');
//     }
//   };

//   // Handle item removal with refetch
//   const handleRemoveFromCart = async (dishId) => {
//     try {
//       await axios.delete(`${import.meta.env.VITE_API_URL}/api/cart/${sessionId}/remove?dishId=${dishId}`);
//       await fetchCart();
//     } catch (error) {
//       console.error('Error removing item:', error.response || error.message);
//       alert('Failed to remove item. Please try again.');
//     }
//   };

//   return (
//     <div>
//       <Header />
//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-4">
//           <h2 className="text-4xl font-sans font-bold mb-12 text-gray-900 text-center">Your Cart</h2>
//           {error && <p className="text-red-600 text-center mb-4">{error}</p>}
//           {cart.length === 0 ? (
//             <p className="text-center text-gray-600">Your cart is empty.</p>
//           ) : (
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-100 rounded-lg p-6 mb-8">
//                 {cart.map((item, index) => (
//                   <div key={index} className="flex justify-between items-center border-b py-4">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
//                       <p className="text-gray-600">
//                         ${item.price.toFixed(2)} x {item.quantity}
//                       </p>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <input
//                         type="number"
//                         min="1"
//                         value={item.quantity}
//                         onChange={(e) => handleQuantityUpdate(item.dishId, parseInt(e.target.value) || 1)}
//                         className="w-16 p-2 rounded-lg text-black border border-gray-300"
//                         aria-label={`Quantity for ${item.name}`}
//                       />
//                       <button
//                         onClick={() => handleRemoveFromCart(item.dishId)}
//                         className="text-red-600 hover:text-red-800"
//                         aria-label={`Remove ${item.name} from cart`}
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//                 <div className="mt-6 text-right">
//                   <p className="text-lg font-bold text-gray-900">
//                     Total: ${totalPrice.toFixed(2)} ({totalItems} items)
//                   </p>
//                 </div>
//               </div>
//               <div className="flex justify-center mb-8">
//                 <button
//                   onClick={() => handleOrderTypeChange('regular')}
//                   className={`px-6 py-3 rounded-lg font-semibold mr-4 ${
//                     !isCatering ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-900'
//                   }`}
//                   aria-label="Select Regular Order"
//                 >
//                   Regular Order
//                 </button>
//                 <button
//                   onClick={() => handleOrderTypeChange('catering')}
//                   className={`px-6 py-3 rounded-lg font-semibold ${
//                     isCatering ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-900'
//                   }`}
//                   aria-label="Select Catering Order"
//                 >
//                   Catering (20+ People)
//                 </button>
//               </div>
//               <Elements stripe={stripePromise}>
//                 <CheckoutForm
//                   orderDetails={orderDetails}
//                   setOrderDetails={setOrderDetails}
//                   cateringDetails={cateringDetails}
//                   setCateringDetails={setCateringDetails}
//                   isCatering={isCatering}
//                   totalPrice={totalPrice}
//                   sessionId={sessionId}
//                   cart={cart}
//                   clearCart={clearCart}
//                 />
//               </Elements>
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

// export default Cart;









// import { useState, useEffect, useCallback } from 'react';
// import Header from '../components/HeaderComponent/Header';
// import { useCart } from '../context/CartContext';
// import axios from 'axios';

// function Cart() {
//   const { cart, updateQuantity, removeFromCart, clearCart, orderType, setOrderType, sessionId } = useCart();
//   const [isCatering, setIsCatering] = useState(orderType === 'catering');
//   const [orderDetails, setOrderDetails] = useState({
//     name: '',
//     email: '',
//     address: '',
//     phone: '',
//   });
//   const [cateringDetails, setCateringDetails] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     eventDate: '',
//     guests: '',
//     preferences: '',
//   });
//   const [error, setError] = useState(null);

//   // Calculate total items and price
//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//   const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

//   // Function to fetch cart items
//   const fetchCart = useCallback(async () => {
//     try {
//       if (!sessionId) {
//         setError('Invalid session. Please refresh the page.');
//         return;
//       }
      
//       const response = await axios.get(`http://localhost:8082/api/cart/${sessionId}`);
//       const formattedCart = response.data.map(item => ({
//         name: item.dish.name,
//         price: item.dish.price,
//         quantity: item.quantity,
//         dishId: item.dish.id,
//       }));
//       updateQuantity(formattedCart);
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching cart:', error.response || error.message);
//       setError('Failed to load cart. Please try again.');
//     }
//   }, [sessionId, updateQuantity]);

//   // Fetch cart on mount or sessionId change
//   useEffect(() => {
//     fetchCart();
//   }, [sessionId, fetchCart]);

//   // Handle regular order submission
//   const handleOrderSubmit = async (e) => {
//     e.preventDefault();
//     if (!orderDetails.name || !orderDetails.email || !orderDetails.address || !orderDetails.phone) {
//       alert('Please fill in all fields');
//       return;
//     }
//     if (cart.length === 0) {
//       alert('Your cart is empty. Please add items before submitting an order.');
//       return;
//     }
//     try {
//       const payload = {
//         type: 'regular',
//         name: orderDetails.name,
//         email: orderDetails.email,
//         address: orderDetails.address,
//         phone: orderDetails.phone,
//         totalPrice: parseFloat(totalPrice.toFixed(2)),
//         items: [],
//       };
//       await axios.post(`http://localhost:8082/api/orders/${sessionId}`, payload, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       alert('Order submitted successfully!');
//       clearCart();
//       setOrderDetails({ name: '', email: '', address: '', phone: '' });
//     } catch (error) {
//       console.error('Error submitting order:', error.response || error.message);
//       alert(`Failed to submit order: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   // Handle catering order submission
//   const handleCateringSubmit = async (e) => {
//     e.preventDefault();
//     if (
//       !cateringDetails.name ||
//       !cateringDetails.email ||
//       !cateringDetails.phone ||
//       !cateringDetails.eventDate ||
//       !cateringDetails.guests
//     ) {
//       alert('Please fill in all required fields');
//       return;
//     }
//     if (parseInt(cateringDetails.guests) < 20) {
//       alert('Catering orders must be for 20 or more people');
//       return;
//     }
//     try {
//       const payload = {
//         type: 'catering',
//         name: cateringDetails.name,
//         email: cateringDetails.email,
//         phone: cateringDetails.phone,
//         eventDate: cateringDetails.eventDate,
//         guests: parseInt(cateringDetails.guests),
//         preferences: cateringDetails.preferences || '',
//         totalPrice: parseFloat(totalPrice.toFixed(2)),
//         items: [],
//       };
//       await axios.post(`http://localhost:8082/api/orders/${sessionId}`, payload, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       alert('Catering inquiry submitted successfully!');
//       clearCart();
//       setCateringDetails({
//         name: '',
//         email: '',
//         phone: '',
//         eventDate: '',
//         guests: '',
//         preferences: '',
//       });
//     } catch (error) {
//       console.error('Error submitting catering inquiry:', error.response || error.message);
//       alert(`Failed to submit catering inquiry: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   // Handle order type change
//   const handleOrderTypeChange = (type) => {
//     setOrderType(type);
//     setIsCatering(type === 'catering');
//   };

//   // Handle quantity update with refetch
//   const handleQuantityUpdate = async (dishId, quantity) => {
//     try {
//       await axios.put(`http://localhost:8082/api/cart/${sessionId}/update?dishId=${dishId}&quantity=${quantity}`);
//       await fetchCart();
//     } catch (error) {
//       console.error('Error updating quantity:', error.response || error.message);
//       alert('Failed to update quantity. Please try again.');
//     }
//   };

//   // Handle item removal with refetch
//   const handleRemoveFromCart = async (dishId) => {
//     try {
//       await axios.delete(`http://localhost:8082/api/cart/${sessionId}/remove?dishId=${dishId}`);
//       await fetchCart();
//     } catch (error) {
//       console.error('Error removing item:', error.response || error.message);
//       alert('Failed to remove item. Please try again.');
//     }
//   };

//   return (
//     <div>
//       <Header />
//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-4">
//           <h2 className="text-4xl font-sans font-bold mb-12 text-gray-900 text-center">
//             Your Cart
//           </h2>
//           {error && <p className="text-red-600 text-center mb-4">{error}</p>}
//           {cart.length === 0 ? (
//             <p className="text-center text-gray-600">Your cart is empty.</p>
//           ) : (
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-100 rounded-lg p-6 mb-8">
//                 {cart.map((item, index) => (
//                   <div
//                     key={index}
//                     className="flex justify-between items-center border-b py-4"
//                   >
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900">
//                         {item.name}
//                       </h3>
//                       <p className="text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <input
//                         type="number"
//                         min="1"
//                         value={item.quantity}
//                         onChange={(e) =>
//                           handleQuantityUpdate(item.dishId, parseInt(e.target.value) || 1)
//                         }
//                         className="w-16 p-2 rounded-lg text-black border border-gray-300"
//                         aria-label={`Quantity for ${item.name}`}
//                       />
//                       <button
//                         onClick={() => handleRemoveFromCart(item.dishId)}
//                         className="text-red-600 hover:text-red-800"
//                         aria-label={`Remove ${item.name} from cart`}
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//                 <div className="mt-6 text-right">
//                   <p className="text-lg font-bold text-gray-900">
//                     Total: ${totalPrice.toFixed(2)} ({totalItems} items)
//                   </p>
//                 </div>
//               </div>
//               <div className="flex justify-center mb-8">
//                 <button
//                   onClick={() => handleOrderTypeChange('regular')}
//                   className={`px-6 py-3 rounded-lg font-semibold mr-4 ${
//                     !isCatering
//                       ? 'bg-gray-900 text-white'
//                       : 'bg-gray-200 text-gray-900'
//                   }`}
//                   aria-label="Select Regular Order"
//                 >
//                   Regular Order
//                 </button>
//                 <button
//                   onClick={() => handleOrderTypeChange('catering')}
//                   className={`px-6 py-3 rounded-lg font-semibold ${
//                     isCatering
//                       ? 'bg-gray-900 text-white'
//                       : 'bg-gray-200 text-gray-900'
//                   }`}
//                   aria-label="Select Catering Order"
//                 >
//                   Catering (20+ People)
//                 </button>
//               </div>
//               {isCatering ? (
//                 <form onSubmit={handleCateringSubmit} className="bg-gray-100 rounded-lg p-6">
//                   <h3 className="text-2xl font-semibold mb-6 text-gray-900">
//                     Catering Inquiry
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <input
//                       type="text"
//                       placeholder="Name"
//                       value={cateringDetails.name}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           name: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Name"
//                     />
//                     <input
//                       type="email"
//                       placeholder="Email"
//                       value={cateringDetails.email}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           email: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Email"
//                     />
//                     <input
//                       type="tel"
//                       placeholder="Phone"
//                       value={cateringDetails.phone}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           phone: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Phone"
//                     />
//                     <input
//                       type="date"
//                       placeholder="Event Date"
//                       value={cateringDetails.eventDate}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           eventDate: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Event Date"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Number of Guests (20+)"
//                       value={cateringDetails.guests}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           guests: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Number of Guests"
//                     />
//                     <textarea
//                       placeholder="Special Preferences"
//                       value={cateringDetails.preferences}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           preferences: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300 col-span-2"
//                       rows="4"
//                       aria-label="Special Preferences"
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
//                     aria-label="Submit Catering Inquiry"
//                   >
//                     Submit Catering Inquiry
//                   </button>
//                 </form>
//               ) : (
//                 <form onSubmit={handleOrderSubmit} className="bg-gray-100 rounded-lg p-6">
//                   <h3 className="text-2xl font-semibold mb-6 text-gray-900">
//                     Checkout
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <input
//                       type="text"
//                       placeholder="Name"
//                       value={orderDetails.name}
//                       onChange={(e) =>
//                         setOrderDetails({ ...orderDetails, name: e.target.value })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Name"
//                     />
//                     <input
//                       type="email"
//                       placeholder="Email"
//                       value={orderDetails.email}
//                       onChange={(e) =>
//                         setOrderDetails({ ...orderDetails, email: e.target.value })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Email"
//                     />
//                     <input
//                       type="text"
//                       placeholder="Delivery Address"
//                       value={orderDetails.address}
//                       onChange={(e) =>
//                         setOrderDetails({
//                           ...orderDetails,
//                           address: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Delivery Address"
//                     />
//                     <input
//                       type="tel"
//                       placeholder="Phone"
//                       value={orderDetails.phone}
//                       onChange={(e) =>
//                         setOrderDetails({ ...orderDetails, phone: e.target.value })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Phone"
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
//                     aria-label="Place Order"
//                   >
//                     Place Order
//                   </button>
//                 </form>
//               )}
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

// export default Cart;









// import { useState, useEffect } from 'react';
// import Header from '../components/HeaderComponent/Header';
// import { useCart } from '../context/CartContext';
// import axios from 'axios';

// function Cart() {
//   const { cart, updateQuantity, removeFromCart, clearCart, orderType, setOrderType, sessionId } = useCart();
//   const [isCatering, setIsCatering] = useState(orderType === 'catering');
//   const [orderDetails, setOrderDetails] = useState({
//     name: '',
//     email: '',
//     address: '',
//     phone: '',
//   });
//   const [cateringDetails, setCateringDetails] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     eventDate: '',
//     guests: '',
//     preferences: '',
//   });

//   // Calculate total items and price
//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//   const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

//   // Fetch cart items on mount or sessionId change
//   useEffect(() => {
//     const fetchCart = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8082/api/cart/${sessionId}`);
//         const formattedCart = response.data.map(item => ({
//           name: item.dish.name,
//           price: item.dish.price,
//           quantity: item.quantity,
//           dishId: item.dish.id,
//         }));
//         updateQuantity(formattedCart);
//       } catch (error) {
//         console.error('Error fetching cart:', error.response || error.message);
//       }
//     };
//     fetchCart();
//   }, [sessionId, updateQuantity]);

//   // Handle regular order submission
//   const handleOrderSubmit = async (e) => {
//     e.preventDefault();
//     if (!orderDetails.name || !orderDetails.email || !orderDetails.address || !orderDetails.phone) {
//       alert('Please fill in all fields');
//       return;
//     }
//     if (cart.length === 0) {
//       alert('Your cart is empty. Please add items before submitting an order.');
//       return;
//     }
//     try {
//       const payload = {
//         type: 'regular',
//         name: orderDetails.name,
//         email: orderDetails.email,
//         address: orderDetails.address,
//         phone: orderDetails.phone,
//         totalPrice: parseFloat(totalPrice.toFixed(2)),
//         items: [],
//       };
//       console.log('Submitting order payload:', payload);
//       await axios.post(`http://localhost:8082/api/orders/${sessionId}`, payload, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       alert('Order submitted successfully!');
//       clearCart();
//       setOrderDetails({ name: '', email: '', address: '', phone: '' });
//     } catch (error) {
//       console.error('Error submitting order:', error.response || error.message);
//       alert(`Failed to submit order: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   // Handle catering order submission
//   const handleCateringSubmit = async (e) => {
//     e.preventDefault();
//     if (
//       !cateringDetails.name ||
//       !cateringDetails.email ||
//       !cateringDetails.phone ||
//       !cateringDetails.eventDate ||
//       !cateringDetails.guests
//     ) {
//       alert('Please fill in all required fields');
//       return;
//     }
//     if (parseInt(cateringDetails.guests) < 20) {
//       alert('Catering orders must be for 20 or more people');
//       return;
//     }
//     try {
//       const payload = {
//         type: 'catering',
//         name: cateringDetails.name,
//         email: cateringDetails.email,
//         phone: cateringDetails.phone,
//         eventDate: cateringDetails.eventDate,
//         guests: parseInt(cateringDetails.guests),
//         preferences: cateringDetails.preferences || '',
//         totalPrice: parseFloat(totalPrice.toFixed(2)),
//         items: [],
//       };
//       console.log('Submitting catering payload:', payload);
//       await axios.post(`http://localhost:8082/api/orders/${sessionId}`, payload, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       alert('Catering inquiry submitted successfully!');
//       clearCart();
//       setCateringDetails({
//         name: '',
//         email: '',
//         phone: '',
//         eventDate: '',
//         guests: '',
//         preferences: '',
//       });
//     } catch (error) {
//       console.error('Error submitting catering inquiry:', error.response || error.message);
//       alert(`Failed to submit catering inquiry: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   // Handle order type change
//   const handleOrderTypeChange = (type) => {
//     setOrderType(type);
//     setIsCatering(type === 'catering');
//   };

//   // Handle quantity update
//   const handleQuantityUpdate = async (dishId, quantity) => {
//     try {
//       await axios.put(`http://localhost:8082/api/cart/${sessionId}/update?dishId=${dishId}&quantity=${quantity}`);
//       updateQuantity(cart.map(item =>
//         item.dishId === dishId ? { ...item, quantity } : item
//       ));
//     } catch (error) {
//       console.error('Error updating quantity:', error.response || error.message);
//       alert('Failed to update quantity. Please try again.');
//     }
//   };

//   // Handle item removal
//   const handleRemoveFromCart = async (dishId) => {
//     try {
//       await axios.delete(`http://localhost:8082/api/cart/${sessionId}/remove?dishId=${dishId}`);
//       removeFromCart(dishId);
//     } catch (error) {
//       console.error('Error removing item:', error.response || error.message);
//       alert('Failed to remove item. Please try again.');
//     }
//   };

//   return (
//     <div>
//       <Header />
//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-4">
//           <h2 className="text-4xl font-sans font-bold mb-12 text-gray-900 text-center">
//             Your Cart
//           </h2>
//           {cart.length === 0 ? (
//             <p className="text-center text-gray-600">Your cart is empty.</p>
//           ) : (
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-100 rounded-lg p-6 mb-8">
//                 {cart.map((item, index) => (
//                   <div
//                     key={index}
//                     className="flex justify-between items-center border-b py-4"
//                   >
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900">
//                         {item.name}
//                       </h3>
//                       <p className="text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <input
//                         type="number"
//                         min="1"
//                         value={item.quantity}
//                         onChange={(e) =>
//                           handleQuantityUpdate(item.dishId, parseInt(e.target.value) || 1)
//                         }
//                         className="w-16 p-2 rounded-lg text-black border border-gray-300"
//                         aria-label={`Quantity for ${item.name}`}
//                       />
//                       <button
//                         onClick={() => handleRemoveFromCart(item.dishId)}
//                         className="text-red-600 hover:text-red-800"
//                         aria-label={`Remove ${item.name} from cart`}
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//                 <div className="mt-6 text-right">
//                   <p className="text-lg font-bold text-gray-900">
//                     Total: ${totalPrice.toFixed(2)} ({totalItems} items)
//                   </p>
//                 </div>
//               </div>
//               <div className="flex justify-center mb-8">
//                 <button
//                   onClick={() => handleOrderTypeChange('regular')}
//                   className={`px-6 py-3 rounded-lg font-semibold mr-4 ${
//                     !isCatering
//                       ? 'bg-gray-900 text-white'
//                       : 'bg-gray-200 text-gray-900'
//                   }`}
//                   aria-label="Select Regular Order"
//                 >
//                   Regular Order
//                 </button>
//                 <button
//                   onClick={() => handleOrderTypeChange('catering')}
//                   className={`px-6 py-3 rounded-lg font-semibold ${
//                     isCatering
//                       ? 'bg-gray-900 text-white'
//                       : 'bg-gray-200 text-gray-900'
//                   }`}
//                   aria-label="Select Catering Order"
//                 >
//                   Catering (20+ People)
//                 </button>
//               </div>
//               {isCatering ? (
//                 <form onSubmit={handleCateringSubmit} className="bg-gray-100 rounded-lg p-6">
//                   <h3 className="text-2xl font-semibold mb-6 text-gray-900">
//                     Catering Inquiry
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <input
//                       type="text"
//                       placeholder="Name"
//                       value={cateringDetails.name}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           name: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Name"
//                     />
//                     <input
//                       type="email"
//                       placeholder="Email"
//                       value={cateringDetails.email}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           email: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Email"
//                     />
//                     <input
//                       type="tel"
//                       placeholder="Phone"
//                       value={cateringDetails.phone}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           phone: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Phone"
//                     />
//                     <input
//                       type="date"
//                       placeholder="Event Date"
//                       value={cateringDetails.eventDate}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           eventDate: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Event Date"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Number of Guests (20+)"
//                       value={cateringDetails.guests}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           guests: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Number of Guests"
//                     />
//                     <textarea
//                       placeholder="Special Preferences"
//                       value={cateringDetails.preferences}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           preferences: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300 col-span-2"
//                       rows="4"
//                       aria-label="Special Preferences"
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
//                     aria-label="Submit Catering Inquiry"
//                   >
//                     Submit Catering Inquiry
//                   </button>
//                 </form>
//               ) : (
//                 <form onSubmit={handleOrderSubmit} className="bg-gray-100 rounded-lg p-6">
//                   <h3 className="text-2xl font-semibold mb-6 text-gray-900">
//                     Checkout
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <input
//                       type="text"
//                       placeholder="Name"
//                       value={orderDetails.name}
//                       onChange={(e) =>
//                         setOrderDetails({ ...orderDetails, name: e.target.value })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Name"
//                     />
//                     <input
//                       type="email"
//                       placeholder="Email"
//                       value={orderDetails.email}
//                       onChange={(e) =>
//                         setOrderDetails({ ...orderDetails, email: e.target.value })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Email"
//                     />
//                     <input
//                       type="text"
//                       placeholder="Delivery Address"
//                       value={orderDetails.address}
//                       onChange={(e) =>
//                         setOrderDetails({
//                           ...orderDetails,
//                           address: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Delivery Address"
//                     />
//                     <input
//                       type="tel"
//                       placeholder="Phone"
//                       value={orderDetails.phone}
//                       onChange={(e) =>
//                         setOrderDetails({ ...orderDetails, phone: e.target.value })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Phone"
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
//                     aria-label="Place Order"
//                   >
//                     Place Order
//                   </button>
//                 </form>
//               )}
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

// export default Cart;









// import { useState, useEffect } from 'react';
// import Header from '../components/HeaderComponent/Header';
// import { useCart } from '../context/CartContext';
// import axios from 'axios';

// function Cart() {
//   const { cart, updateQuantity, removeFromCart, clearCart, orderType, setOrderType, sessionId } = useCart();
//   const [isCatering, setIsCatering] = useState(orderType === 'catering');
//   const [orderDetails, setOrderDetails] = useState({
//     name: '',
//     email: '',
//     address: '',
//     phone: '',
//   });
//   const [cateringDetails, setCateringDetails] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     eventDate: '',
//     guests: '',
//     preferences: '',
//   });

//   // Calculate total items and price
//   const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//   const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

//   // Fetch cart items on mount or sessionId change
//   useEffect(() => {
//     const fetchCart = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8082/api/cart/${sessionId}`);
//         // Map backend cart items to frontend format
//         const formattedCart = response.data.map(item => ({
//           name: item.dish.name,
//           price: item.dish.price,
//           quantity: item.quantity,
//           dishId: item.dish.id,
//         }));
//         updateQuantity(formattedCart); // Update context with fetched cart
//       } catch (error) {
//         console.error('Error fetching cart:', error.response || error.message);
//       }
//     };
//     fetchCart();
//   }, [sessionId, updateQuantity]);

//   // Handle regular order submission
//   const handleOrderSubmit = async (e) => {
//     e.preventDefault();
//     if (!orderDetails.name || !orderDetails.email || !orderDetails.address || !orderDetails.phone) {
//       alert('Please fill in all fields');
//       return;
//     }
//     if (cart.length === 0) {
//       alert('Your cart is empty. Please add items before submitting an order.');
//       return;
//     }
//     try {
//       await axios.post(`http://localhost:8082/api/orders/${sessionId}`, {
//         type: 'regular',
//         name: orderDetails.name,
//         email: orderDetails.email,
//         address: orderDetails.address,
//         phone: orderDetails.phone,
//         totalPrice: parseFloat(totalPrice.toFixed(2)),
//         //totalPrice: totalPrice.toFixed(2),
//         items: [], // Backend populates items from cart
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       alert('Order submitted successfully!');
//       clearCart();
//       setOrderDetails({ name: '', email: '', address: '', phone: '' });
//     } catch (error) {
//       console.error('Error submitting order:', error.response || error.message);
//       alert(`Failed to submit order: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   // Handle catering order submission
//   const handleCateringSubmit = async (e) => {
//     e.preventDefault();
//     if (
//       !cateringDetails.name ||
//       !cateringDetails.email ||
//       !cateringDetails.phone ||
//       !cateringDetails.eventDate ||
//       !cateringDetails.guests
//     ) {
//       alert('Please fill in all required fields');
//       return;
//     }
//     if (parseInt(cateringDetails.guests) < 20) {
//       alert('Catering orders must be for 20 or more people');
//       return;
//     }
//     try {
//       await axios.post(`http://localhost:8082/api/orders/${sessionId}`, {
//         type: 'catering',
//         name: cateringDetails.name,
//         email: cateringDetails.email,
//         phone: cateringDetails.phone,
//         eventDate: cateringDetails.eventDate,
//         guests: parseInt(cateringDetails.guests),
//         preferences: cateringDetails.preferences || '',
//         totalPrice: totalPrice.toFixed(2),
//         items: [], // Backend populates items from cart
//       });
//       alert('Catering inquiry submitted successfully!');
//       clearCart();
//       setCateringDetails({
//         name: '',
//         email: '',
//         phone: '',
//         eventDate: '',
//         guests: '',
//         preferences: '',
//       });
//     } catch (error) {
//       console.error('Error submitting catering inquiry:', error.response || error.message);
//       alert(`Failed to submit catering inquiry: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   // Handle order type change
//   const handleOrderTypeChange = (type) => {
//     setOrderType(type);
//     setIsCatering(type === 'catering');
//   };

//   // Handle quantity update
//   const handleQuantityUpdate = async (dishId, quantity) => {
//     try {
//       await axios.put(`http://localhost:8082/api/cart/${sessionId}/update?dishId=${dishId}&quantity=${quantity}`);
//       updateQuantity(cart.map(item =>
//         item.dishId === dishId ? { ...item, quantity } : item
//       ));
//     } catch (error) {
//       console.error('Error updating quantity:', error.response || error.message);
//       alert('Failed to update quantity. Please try again.');
//     }
//   };

//   // Handle item removal
//   const handleRemoveFromCart = async (dishId) => {
//     try {
//       await axios.delete(`http://localhost:8082/api/cart/${sessionId}/remove?dishId=${dishId}`);
//       removeFromCart(dishId);
//     } catch (error) {
//       console.error('Error removing item:', error.response || error.message);
//       alert('Failed to remove item. Please try again.');
//     }
//   };

//   return (
//     <div>
//       <Header />
//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-4">
//           <h2 className="text-4xl font-sans font-bold mb-12 text-gray-900 text-center">
//             Your Cart
//           </h2>
//           {cart.length === 0 ? (
//             <p className="text-center text-gray-600">Your cart is empty.</p>
//           ) : (
//             <div className="max-w-4xl mx-auto">
//               <div className="bg-gray-100 rounded-lg p-6 mb-8">
//                 {cart.map((item, index) => (
//                   <div
//                     key={index}
//                     className="flex justify-between items-center border-b py-4"
//                   >
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900">
//                         {item.name}
//                       </h3>
//                       <p className="text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <input
//                         type="number"
//                         min="1"
//                         value={item.quantity}
//                         onChange={(e) =>
//                           handleQuantityUpdate(item.dishId, parseInt(e.target.value) || 1)
//                         }
//                         className="w-16 p-2 rounded-lg text-black border border-gray-300"
//                         aria-label={`Quantity for ${item.name}`}
//                       />
//                       <button
//                         onClick={() => handleRemoveFromCart(item.dishId)}
//                         className="text-red-600 hover:text-red-800"
//                         aria-label={`Remove ${item.name} from cart`}
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//                 <div className="mt-6 text-right">
//                   <p className="text-lg font-bold text-gray-900">
//                     Total: ${totalPrice.toFixed(2)} ({totalItems} items)
//                   </p>
//                 </div>
//               </div>
//               <div className="flex justify-center mb-8">
//                 <button
//                   onClick={() => handleOrderTypeChange('regular')}
//                   className={`px-6 py-3 rounded-lg font-semibold mr-4 ${
//                     !isCatering
//                       ? 'bg-gray-900 text-white'
//                       : 'bg-gray-200 text-gray-900'
//                   }`}
//                   aria-label="Select Regular Order"
//                 >
//                   Regular Order
//                 </button>
//                 <button
//                   onClick={() => handleOrderTypeChange('catering')}
//                   className={`px-6 py-3 rounded-lg font-semibold ${
//                     isCatering
//                       ? 'bg-gray-900 text-white'
//                       : 'bg-gray-200 text-gray-900'
//                   }`}
//                   aria-label="Select Catering Order"
//                 >
//                   Catering (20+ People)
//                 </button>
//               </div>
//               {isCatering ? (
//                 <form onSubmit={handleCateringSubmit} className="bg-gray-100 rounded-lg p-6">
//                   <h3 className="text-2xl font-semibold mb-6 text-gray-900">
//                     Catering Inquiry
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <input
//                       type="text"
//                       placeholder="Name"
//                       value={cateringDetails.name}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           name: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Name"
//                     />
//                     <input
//                       type="email"
//                       placeholder="Email"
//                       value={cateringDetails.email}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           email: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Email"
//                     />
//                     <input
//                       type="tel"
//                       placeholder="Phone"
//                       value={cateringDetails.phone}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           phone: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Phone"
//                     />
//                     <input
//                       type="date"
//                       placeholder="Event Date"
//                       value={cateringDetails.eventDate}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           eventDate: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Event Date"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Number of Guests (20+)"
//                       value={cateringDetails.guests}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           guests: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Number of Guests"
//                     />
//                     <textarea
//                       placeholder="Special Preferences"
//                       value={cateringDetails.preferences}
//                       onChange={(e) =>
//                         setCateringDetails({
//                           ...cateringDetails,
//                           preferences: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300 col-span-2"
//                       rows="4"
//                       aria-label="Special Preferences"
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
//                     aria-label="Submit Catering Inquiry"
//                   >
//                     Submit Catering Inquiry
//                   </button>
//                 </form>
//               ) : (
//                 <form onSubmit={handleOrderSubmit} className="bg-gray-100 rounded-lg p-6">
//                   <h3 className="text-2xl font-semibold mb-6 text-gray-900">
//                     Checkout
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <input
//                       type="text"
//                       placeholder="Name"
//                       value={orderDetails.name}
//                       onChange={(e) =>
//                         setOrderDetails({ ...orderDetails, name: e.target.value })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Name"
//                     />
//                     <input
//                       type="email"
//                       placeholder="Email"
//                       value={orderDetails.email}
//                       onChange={(e) =>
//                         setOrderDetails({ ...orderDetails, email: e.target.value })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Email"
//                     />
//                     <input
//                       type="text"
//                       placeholder="Delivery Address"
//                       value={orderDetails.address}
//                       onChange={(e) =>
//                         setOrderDetails({
//                           ...orderDetails,
//                           address: e.target.value,
//                         })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Delivery Address"
//                     />
//                     <input
//                       type="tel"
//                       placeholder="Phone"
//                       value={orderDetails.phone}
//                       onChange={(e) =>
//                         setOrderDetails({ ...orderDetails, phone: e.target.value })
//                       }
//                       className="p-3 rounded-lg text-black border border-gray-300"
//                       aria-label="Phone"
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
//                     aria-label="Place Order"
//                   >
//                     Place Order
//                   </button>
//                 </form>
//               )}
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

// export default Cart;