import { useCallback, useEffect, useState } from 'react'

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = useCallback(() => {
    setIsVisible(window.scrollY > 300)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [toggleVisibility])

  if (!isVisible) return null

  return (
    <button
      className="scroll-to-top"
      type="button"
      onClick={scrollToTop}
      aria-label="返回顶部"
      title="返回顶部"
    >
      ↑
    </button>
  )
}

export default ScrollToTopButton
