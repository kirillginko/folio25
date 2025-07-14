const imagesData = [
  {
    id: 1,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584481/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxMjMxNjM1My9vcmlnaW5hbF8yY2IwZmE4OWQ0NjQ2NjUyODNlMjVlNDk2ZDg1ZTc2ZC5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_efuv3t.webp",
    title: "Case Study 1",
    description: "Body, Mind, Endurance, Test - Branding",
    year: 2023,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 2,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584481/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI3ODA5NTM5L29yaWdpbmFsXzU1OTc3YmIxZGUxYzQxMWQyM2ZlOTgwODkwOWU4ZjZiLnBuZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_gzp4fv.webp",
    title: "Case Study 2",
    description: "M Image Campaign - Branding",
    year: 2023,
    technologies: "Photoshop, Illustrator",
    link: "",
    type: "image",
  },
  {
    id: 3,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584481/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI1NTU2ODY4L29yaWdpbmFsXzEyYjQ4NDM2N2FiZmM1Y2YzMjc4NDJkOGI0ZWJiMWE2LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_juxktq.webp",
    title: "Case Study 3",
    description: "Club Mutante - Branding",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 4,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI5NTAzNDI4L29yaWdpbmFsX2JmYjRmYWMyMjI4NDdkZWYzOTk2MjE2OWJjNDk3YTExLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_kp7uky.webp",
    title: "Case Study 4",
    description: "Joon Magazine - Branding",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 5,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI4MDMzNzY5L29yaWdpbmFsXzRjZGRlNGU5YjdiODFmOWRjMDMwYzg1MmY5N2E0MmVkLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_up5lff.webp",
    title: "Case Study 5",
    description: "Country Beats - Branding",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "",
    type: "image",
  },
  {
    id: 6,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxNTI2MDQyNi9vcmlnaW5hbF81ZDE0Y2U1MDBkMWNhMGI2MzgwNzRiZTc2YmRkZjcwMi5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_a3qha7.webp",
    title: "Case Study 6",
    description: "Generative Art",
    year: 2023,
    technologies: "P5.js, JavaScript",
    link: "",
    type: "image",
  },
  {
    id: 7,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxNTI2MDQyOC9vcmlnaW5hbF8xNWYzZDJhZGI0YmU2Njc0OGExNWI5MGQ2YWY5NmE2Ni5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_dv18ov.webp",
    title: "Case Study 7",
    description: "This is a detailed description of Case Study 7.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-7",
    type: "image",
  },
  {
    id: 8,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxNzE0MzEwMi9vcmlnaW5hbF8wNWUzMzI1N2Q4OWQ0MzlhMDZlZjM0ZDdiNzIwY2E3NC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_hyvgux.webp",
    title: "Case Study 8",
    description: "This is a detailed description of Case Study 8.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-8",
    type: "image",
  },
  {
    id: 9,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxNzQ3NTE4MC9vcmlnaW5hbF8xM2U5ZjM4YmZhMDRmMDcwNzc2MWEwZWVjNWQxNjcwZC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_htekna.webp",
    title: "Case Study 9",
    description: "This is a detailed description of Case Study 9.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-9",
    type: "image",
  },
  {
    id: 10,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxMzUzMjM4L29yaWdpbmFsXzRhZGM3YTVhZGRkN2FkMzIyMGFhYzliN2FlZWE0NzczIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjo2MDAsImhlaWdodCI6NjAwLCJmaXQiOiJpbnNpZGUiLCJ3aXRob3V0RW5sYXJnZW1lbnQiOn_nkri41.webp",
    title: "Case Study 10",
    description: "This is a detailed description of Case Study 10.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-10",
    type: "image",
  },
  {
    id: 11,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxMTM5MjkxNC9vcmlnaW5hbF82MjA1NjQwZjdkNGEzZjNjY2Q1ZjU2YTI5MDIzOTMwYS5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_opv0l3.webp",
    title: "Case Study 11",
    description: "This is a detailed description of Case Study 11.",
    year: 2022,
    technologies: "JavaScript, GSAP",
    link: "https://example.com/case-study-11",
    type: "image",
  },
  {
    id: 12,
    url: "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752458519/output_1_online-video-cutter.com_vkwiy7.mp4",
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
    url: "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752458440/Screen_Recording_2025-07-13_at_21.48.28_online-video-cutter.com_uvx0xa.mp4",
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
    url: "https://res.cloudinary.com/dtps5ugbf/video/upload/v1752459122/Screen_Recording_2025-07-13_at_21.35.19_online-video-cutter.com_1_mb4ccx.mp4",
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
    url: "https://res.cloudinary.com/dtps5ugbf/video/upload/v1751581140/1958a4d2-4bf4-652e-3f51-ac57caf07929-ezgif.com-crop-video_bla764.mp4",
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
    url: "https://res.cloudinary.com/dtps5ugbf/video/upload/v1751079183/STG_vessel-ezgif.com-crop-video_njuern.mp4",
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
    url: "https://res.cloudinary.com/dtps5ugbf/video/upload/v1751338797/a570bca3-90ac-f473-4927-b94ff290a9e4-ezgif.com-crop-video_1_om2qdv.mp4",
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
    const posterUrl = media.url.replace(/\.mp4$/, ".jpg");
    
    // Add mobile-optimized video URL for newer videos (those with higher version numbers)
    const versionMatch = media.url.match(/\/v(\d+)\//);
    const version = versionMatch ? parseInt(versionMatch[1]) : 0;
    
    // For newer videos (likely larger), add mobile optimization
    let mobileUrl = media.url;
    if (version > 1751500000) { // Videos uploaded after January 2025
      // Add Cloudinary transformations for mobile optimization
      mobileUrl = media.url.replace(
        '/video/upload/',
        '/video/upload/q_auto:low,w_400,h_400,c_fill,f_mp4/'
      );
    }
    
    return { 
      ...media, 
      poster: posterUrl,
      mobileUrl: mobileUrl
    };
  }
  return media;
});

export default images;
