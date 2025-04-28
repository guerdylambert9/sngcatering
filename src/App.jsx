//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
//import Header from './components/HeaderComponent/Header'
//import Hero from './components/HeroComponent/Hero'
//import Contact from './components/ContactComponent/Contact'

import Home from './pages/Home'
import Menu from './pages/Menu'
import Cart from './pages/Cart'

import FeaturedDishes from './components/FeaturedDishes/FeaturedDishes'
import { Routes, Route } from 'react-router-dom'

function App() {
  //const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />}/>
      <Route path="/cart" element={<Cart />}/>
    </Routes>
  )

}

export default App
