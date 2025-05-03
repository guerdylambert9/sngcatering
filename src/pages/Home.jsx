

import Header from '../components/HeaderComponent/Header';
import Hero from '../components/HeroComponent/Hero';
import FeaturedDishes from '../components/FeaturedDishes/FeaturedDishes';
import Contact from '../components/ContactComponent/Contact';

function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <FeaturedDishes />
      <Contact />
    </div>
  );
}

export default Home;