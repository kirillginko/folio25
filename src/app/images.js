const images = [
  {
    id: 1,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584481/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxMjMxNjM1My9vcmlnaW5hbF8yY2IwZmE4OWQ0NjQ2NjUyODNlMjVlNDk2ZDg1ZTc2ZC5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_efuv3t.webp",
  },
  {
    id: 2,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584481/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI3ODA5NTM5L29yaWdpbmFsXzU1OTc3YmIxZGUxYzQxMWQyM2ZlOTgwODkwOWU4ZjZiLnBuZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_gzp4fv.webp",
  },
  {
    id: 3,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584481/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI1NTU2ODY4L29yaWdpbmFsXzEyYjQ4NDM2N2FiZmM1Y2YzMjc4NDJkOGI0ZWJiMWE2LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_juxktq.webp",
  },
  {
    id: 4,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI5NTAzNDI4L29yaWdpbmFsX2JmYjRmYWMyMjI4NDdkZWYzOTk2MjE2OWJjNDk3YTExLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_kp7uky.webp",
  },
  {
    id: 5,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI4MDMzNzY5L29yaWdpbmFsXzRjZGRlNGU5YjdiODFmOWRjMDMwYzg1MmY5N2E0MmVkLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_up5lff.webp",
  },
  {
    id: 6,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxNTI2MDQyNi9vcmlnaW5hbF81ZDE0Y2U1MDBkMWNhMGI2MzgwNzRiZTc2YmRkZjcwMi5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_a3qha7.webp",
  },
  {
    id: 7,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxNTI2MDQyOC9vcmlnaW5hbF8xNWYzZDJhZGI0YmU2Njc0OGExNWI5MGQ2YWY5NmE2Ni5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_dv18ov.webp",
  },
  {
    id: 8,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxNzE0MzEwMi9vcmlnaW5hbF8wNWUzMzI1N2Q4OWQ0MzlhMDZlZjM0ZDdiNzIwY2E3NC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_hyvgux.webp",
  },
  {
    id: 9,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxNzQ3NTE4MC9vcmlnaW5hbF8xM2U5ZjM4YmZhMDRmMDcwNzc2MWEwZWVjNWQxNjcwZC5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_htekna.webp",
  },
  {
    id: 10,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxMzUzMjM4L29yaWdpbmFsXzRhZGM3YTVhZGRkN2FkMzIyMGFhYzliN2FlZWE0NzczIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjo2MDAsImhlaWdodCI6NjAwLCJmaXQiOiJpbnNpZGUiLCJ3aXRob3V0RW5sYXJnZW1lbnQiOn_nkri41.webp",
  },
  {
    id: 11,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxMTM5MjkxNC9vcmlnaW5hbF82MjA1NjQwZjdkNGEzZjNjY2Q1ZjU2YTI5MDIzOTMwYS5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_opv0l3.webp",
  },
  {
    id: 12,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584482/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiI4OTU4MTkyL29yaWdpbmFsX2Y3YWY2MDRlOTYyNmQ1ZGUwZWIzNDMwMzZmODdkZjBhLnBuZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_c3dpl0.webp",
  },
  {
    id: 13,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584483/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIyOTg4MTMzL29yaWdpbmFsXzA0ZDNkZmJjZDZkYzk2MjVhMTFjODFhNDFjZDcwYjRkLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_xpv0bt.webp",
  },
  {
    id: 14,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584483/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIyMDIxNjY0L29yaWdpbmFsX2ExZjQ5YjljN2Q2YzQ0YTNmYjk3OWQ2MTc1OGIyOThmLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_uhvwdm.webp",
  },
  {
    id: 15,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584483/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIxMTk0NTE5NC9vcmlnaW5hbF85ZjZiMDE4Y2IyMDlmNGE2OGZjYmRiMWJiMzNhZDE2Yi5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjYwMCwiaGVpZ2h0Ijo2MDAsImZpdCI6Imluc2lkZSIsIndpdGhvdXRFbmxhcmdlbW_b6g4nx.webp",
  },
  {
    id: 16,
    url: "https://res.cloudinary.com/dtps5ugbf/image/upload/v1732584483/eyJidWNrZXQiOiJhcmVuYV9pbWFnZXMiLCJrZXkiOiIzNzAyNTc4L29yaWdpbmFsXzRhZjJiZWNmOTMzNWYxMGVjZWUwYTE2YjYxMDQ4MjVmLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NjAwLCJoZWlnaHQiOjYwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW_rn2ie7.webp",
  },
];

export default images;
