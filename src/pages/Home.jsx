import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import HowItWorks from '../components/home/HowItWorks'
import FAQ from '../components/layout/FAQ'

const Home = () => {
  return (
    <div className="pt-16">
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
    </div>
  )
}

export default Home