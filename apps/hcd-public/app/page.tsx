import NewsCarousel from "@/components/news-carousel"
import QuickAccess from "@/components/quick-access"
import NewsAndActivities from "@/components/news-and-activities"

export default function Home() {
  return (
    <div className="min-h-screen">
      <NewsCarousel />
      <QuickAccess />
      <NewsAndActivities />
    </div>
  )
}
