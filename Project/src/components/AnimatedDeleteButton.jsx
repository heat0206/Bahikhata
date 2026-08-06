import { useRef } from 'react'
import Lottie from 'lottie-react'
import trashBinAnimation from '../assets/trash-bin.json'

const LottieComponent = Lottie.default || Lottie;

function AnimatedDeleteButton({ onClick }) {
  const lottieRef = useRef(null);

  const handleMouseEnter = () => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (lottieRef.current) {
      lottieRef.current.stop();
    }
  };

  return (
    <button
      type="button"
      className="btn-ghost delete-btn"
      onClick={onClick}
      title="Delete Application"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <LottieComponent
        lottieRef={lottieRef}
        animationData={trashBinAnimation}
        loop={true}
        autoplay={false}
        style={{ width: 24, height: 24 }}
      />
    </button>
  );
}

export default AnimatedDeleteButton
