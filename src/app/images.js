const imagesData = [
  {
    id: 1,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754148724/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxMjMxNjM1My9vcmlnaW5hbF8yY2IwZmE4OWQ0NjQ2NjUyODNlMjVlNDk2ZDg1ZTc2ZC5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdl_b6dcwz.webp",
    title: "Case Study 1",
    description: "Body, Mind, Endurance, Test - Branding",
    year: 2023,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 2,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754148724/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNzAyNTc4L29yaWdpbmFsXzRhZjJiZWNmOTMzNWYxMGVjZWUwYTE2YjYxMDQ4MjVmLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2Vt_ceyt9u.webp",
    title: "Case Study 2",
    description: "M Image Campaign - Branding",
    year: 2023,
    technologies: "Photoshop, Illustrator",
    link: "",
    type: "image",
  },
  {
    id: 3,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754148723/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI1NTU2ODY4L29yaWdpbmFsXzEyYjQ4NDM2N2FiZmM1Y2YzMjc4NDJkOGI0ZWJiMWE2LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2Vt_ljogg4.webp",
    title: "Case Study 3",
    description: "Club Mutante - Branding",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 4,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754148724/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI5NTAzNDI4L29yaWdpbmFsX2JmYjRmYWMyMjI4NDdkZWYzOTk2MjE2OWJjNDk3YTExLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2Vt_w6ouhc.webp",
    title: "Case Study 4",
    description: "Joon Magazine - Branding",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 5,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754150891/dade_lrvyiu_wyodjq.webp",
    title: "Case Study 5",
    description: "Country Beats - Branding",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 6,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754150815/1987_n867s8_os0nty.webp",
    title: "Case Study 6",
    description: "Generative Art",
    year: 2023,
    technologies: "P5.js, JavaScript",
    link: "",
    type: "image",
  },
  {
    id: 7,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754150751/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxNTI2MDQyOC9vcmlnaW5hbF8xNWYzZDJhZGI0YmU2Njc0OGExNWI5MGQ2YWY5NmE2Ni5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_oxhwy4.webp",
    title: "Case Study 7",
    description: "This is a detailed description of Case Study 7.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-7",
    type: "image",
  },
  {
    id: 8,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754148723/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxNzE0MzEwMi9vcmlnaW5hbF8wNWUzMzI1N2Q4OWQ0MzlhMDZlZjM0ZDdiNzIwY2E3NC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdl_d8bmc7.webp",
    title: "Case Study 8",
    description: "This is a detailed description of Case Study 8.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-8",
    type: "image",
  },
  {
    id: 9,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754148724/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI0MTE4OTQzL29yaWdpbmFsX2NjMWJiOWM5ZWMwMTczZGNkYzcxOGFkNDZhODg4ZTI3LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2Vt_cobifn.webp",
    title: "Case Study 9",
    description: "This is a detailed description of Case Study 9.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-9",
    type: "image",
  },
  {
    id: 10,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754148724/tumblr_4051b11752472940536562f56a260b80_c9d0670b_1280_nghmgg_pcc6ct.jpg",
    title: "Case Study 10",
    description: "This is a detailed description of Case Study 10.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-10",
    type: "image",
  },
  {
    id: 11,
    url: "https://res.cloudinary.com/ds8rxobq9/image/upload/v1754150551/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxMTM5MjkxNC9vcmlnaW5hbF82MjA1NjQwZjdkNGEzZjNjY2Q1ZjU2YTI5MDIzOTMwYS5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdl_zb7dgx.webp",
    title: "Case Study 11",
    description: "This is a detailed description of Case Study 11.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-11",
    type: "image",
  },
  {
    id: 12,
    url: "https://res.cloudinary.com/ds8rxobq9/video/upload/v1754148736/output_1_online-video-cutter.com_vkwiy7_semynv.mp4",
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
    url: "https://res.cloudinary.com/ds8rxobq9/video/upload/v1754148756/Screen_Recording_2025-07-13_at_21.48.28_online-video-cutter.com_uvx0xa_hck22n.mp4",
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
    url: "https://res.cloudinary.com/ds8rxobq9/video/upload/v1754148766/Screen_Recording_2025-07-13_at_21.35.19_online-video-cutter.com_1_mb4ccx_bqljoc.mp4",
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
    url: "https://res.cloudinary.com/ds8rxobq9/video/upload/v1754148725/1958a4d2-4bf4-652e-3f51-ac57caf07929-ezgif.com-crop-video_bla764_yxmwri.mp4",
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
    url: "https://res.cloudinary.com/ds8rxobq9/video/upload/v1754148725/STG_vessel-ezgif.com-crop-video_njuern_oi1aar.mp4",
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
    url: "https://res.cloudinary.com/ds8rxobq9/video/upload/v1754148724/a570bca3-90ac-f473-4927-b94ff290a9e4-ezgif.com-crop-video_1_om2qdv_lt8xzp.mp4",
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

    // Pre-optimize videos to avoid API token usage
    // Only apply transformations if absolutely necessary
    return {
      ...media,
      poster: posterUrl,
      mobileUrl: media.url, // Use original URL to avoid transformation tokens
    };
  }
  return media;
});

export default images;
