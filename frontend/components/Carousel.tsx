"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/images/pexels-suman-boipai-143965246-36331060.jpg",
  "/images/pexels-dibakar-roy-2432543-24032590.jpg",
  "/images/pexels-rahul-vadhs-2367406-5602330.jpg",
  "/images/pexels-dibakar-roy-2432543-20407291.jpg",
  "/images/pexels-shahnwaz-alam-465938310-15727702.jpg",
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-4xl h-64 md:h-96 overflow-hidden border-2 border-black">
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <Image
              src={src}
              alt={`Agricultural scene ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full border border-black ${
              currentIndex === index ? "bg-[#058b2d]" : "bg-white"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
