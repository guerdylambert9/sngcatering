import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/HeaderComponent/Header'
import Hero from './components/HeroComponent/Hero'
import Contact from './components/ContactComponent/Contact'

import FeaturedDishes from './components/FeaturedDishes/FeaturedDishes'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Header/>
      <Hero/>
      <FeaturedDishes/>
      <Contact/>  
    </div>
  )

}

export default App
