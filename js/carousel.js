document.addEventListener("DOMContentLoaded", () => {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach(carousel => {
    const track = carousel.querySelector(".carousel-track");
    const images = Array.from(track.children);
    const prevBtn = carousel.querySelector(".carousel-btn.prev");
    const nextBtn = carousel.querySelector(".carousel-btn.next");
    const dotsNav = carousel.querySelector(".carousel-dots");
    const modal = carousel.querySelector(".carousel-modal");
    const modalImg = modal.querySelector(".modal-content");
    const closeModal = modal.querySelector(".close-modal");
    const modalPrev = modal.querySelector(".modal-prev");
    const modalNext = modal.querySelector(".modal-next");

    let currentIndex = 0;

    // Criar dots
    images.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => moveToSlide(i));
      dotsNav.appendChild(dot);
    });

    function updateDots(index) {
      const allDots = dotsNav.querySelectorAll(".dot");
      allDots.forEach(dot => dot.classList.remove("active"));
      if (allDots[index]) allDots[index].classList.add("active");
    }

    function moveToSlide(index) {
      currentIndex = index;
      const width = images[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${width * index}px)`;
      updateDots(index);
    }

    window.addEventListener("resize", () => moveToSlide(currentIndex));

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      moveToSlide(currentIndex);
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % images.length;
      moveToSlide(currentIndex);
    });

    images.forEach((img, i) => {
      img.addEventListener("click", () => {
        modal.style.display = "flex";
        modalImg.src = img.src;
        currentIndex = i;
      });
    });

    function updateModalImage() {
      modalImg.src = images[currentIndex].src;
    }

    modalPrev.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateModalImage();
    });

    modalNext.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateModalImage();
    });

    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });

    moveToSlide(0);
  });
});
