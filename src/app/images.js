const imagesData = [
  {
    id: 1,
    url: "/images/body.webp",
    title: "Case Study 1",
    description: "Body, Mind, Endurance, Test - Branding",
    year: 2023,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 2,
    url: "/images/record.webp",
    title: "Case Study 2",
    description: "M Image Campaign - Branding",
    year: 2023,
    technologies: "Photoshop, Illustrator",
    link: "",
    type: "image",
  },
  {
    id: 3,
    url: "/images/club.webp",
    title: "Case Study 3",
    description: "Club Mutante - Branding",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 4,
    url: "/images/gum.webp",
    title: "Case Study 4",
    description: "Joon Magazine - Branding",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 5,
    url: "/images/dade.webp",
    title: "Case Study 5",
    description: "Country Beats - Branding",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 6,
    url: "/images/1987.webp",
    title: "Case Study 6",
    description: "Generative Art",
    year: 2023,
    technologies: "P5.js, JavaScript",
    link: "",
    type: "image",
  },
  {
    id: 7,
    url: "/images/disco.webp",
    title: "Case Study 7",
    description: "This is a detailed description of Case Study 7.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-7",
    type: "image",
  },
  {
    id: 8,
    url: "/images/circle.webp",
    title: "Case Study 8",
    description: "This is a detailed description of Case Study 8.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-8",
    type: "image",
  },
  {
    id: 9,
    url: "/images/butterfly.webp",
    title: "Case Study 9",
    description: "This is a detailed description of Case Study 9.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-9",
    type: "image",
  },
  {
    id: 10,
    url: "/images/foil.webp",
    title: "Case Study 10",
    description: "This is a detailed description of Case Study 10.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-10",
    type: "image",
  },
  {
    id: 11,
    url: "/images/flower.webp",
    title: "Case Study 11",
    description: "This is a detailed description of Case Study 11.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-11",
    type: "image",
  },
  {
    id: 12,
    url: "/videos/car.mp4",
    title: "Case Study 12",
    description:
      "Generative video piece using p5.js and video processing tools.",
    year: 2025,
    technologies: "P5.js, JavaScript, GSAP",
    link: "",
    type: "video",
  },
  {
    id: 13,
    url: "/videos/clock.mov",
    title: "Perlin Noise Flow Field",
    description:
      "Generative video piece using p5.js and video processing tools.",
    year: 2025,
    technologies: "P5.js, JavaScript, GSAP",
    link: "",
    type: "video",
  },
  {
    id: 14,
    url: "/videos/eye.mp4",
    title: "Perlin Noise Heatmap",
    description:
      "Generative video piece using p5.js and video processing tools.",
    year: 2025,
    technologies: "P5.js, JavaScript, GSAP",
    link: "",
    type: "video",
  },
  {
    id: 15,
    url: "/videos/pattern.mp4",
    title: "Generative Video Art",
    description:
      "Generative video piece using p5.js and video processing tools.",
    year: 2025,
    technologies: "JavaScript, Video, P5.js",
    link: "",
    type: "video",
  },
  {
    id: 16,
    url: "/videos/pattern2.mp4",
    title: "The Shape of Things to Come",
    description:
      "Motion graphic typography using p5.js and video processing tools.",
    year: 2025,
    technologies: "P5, Adobe After Effects, JavaScript",
    link: "",
    type: "video",
  },
  {
    id: 17,
    url: "/videos/pixel.mov",
    title: "Geo Rhythm Pattern",
    description:
      "A generative art piece that uses p5.js to create a dynamic visual pattern.",
    year: 2025,
    technologies: "P5, Video, JavaScript",
    link: "",
    type: "video",
  },
];

const images = imagesData.map((media) => {
  if (media.type === "video" && media.url.includes("cloudinary")) {
    // Use static poster and avoid real-time transformations
    const posterUrl = media.url.replace(/\.mp4$/, ".jpg");

    // Create mobile-optimized versions for problematic videos (IDs 12, 13, 14)
    let mobileUrl = media.url;

    if ([12, 13, 14].includes(media.id)) {
      // Create mobile-optimized URL with lower quality and different format
      mobileUrl = media.url.replace(
        "/video/upload/",
        "/video/upload/f_mp4,q_auto:low,w_400,h_400,c_fill/"
      );
    }

    return {
      ...media,
      poster: posterUrl,
      mobileUrl: mobileUrl,
    };
  }
  return media;
});

export default images;
