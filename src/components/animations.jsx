// Animation Variants
export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }}
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
};

export const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 }}
};

export const letterAnimation = {
  hidden: { opacity: 0, y: 100, rotateX: -90 },
  visible: (i) => ({ opacity: 1, y: 0, rotateX: 0, transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }})
};

export const floatingAnimation = {
  y: [0, -20, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
};

// Spring Config
export const springConfig = { damping: 25, stiffness: 700 };
export const cardSpring = { stiffness: 300, damping: 20 };
export const modalSpring = { damping: 25, stiffness: 300 };