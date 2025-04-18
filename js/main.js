document.addEventListener("DOMContentLoaded", () => {
  createSquares();
  addImageToSquares('images/pizza.jpg', "1", 'Pizza', "Pizza");
  addImageToSquares('images/burger.jpg', "3", 'Burger', "Burger");
  addImageToSquares('images/broccoli.png', "5", 'Broccoli', "Broccoli");
  addImageToSquares('images/frenchfries.png', "7", 'French', "French Fries");
  addImageToSquares('images/hotdog.png', "9", 'HotDog', "Hot Dog");
  addImageToSquares('images/pancakes.png', "11", 'Pancake', "Pancakes");
  addImageToSquares('images/pasta.png', "13", 'Pasta', "Pasta");
  addImageToSquares('images/pretzel.png', "15", 'Pretzel', "Pretzel");
  addImageToSquares('images/ribs.png', "17", 'Ribs', "Ribs");
  addImageToSquares('images/taco.png', "19", 'Taco', "Taco");
  addSubmitButton();
  //addDarkModeButton();
  const answerKey = {
    Image1: "2",
    Image3: "4",
    Image5: "20",
    Image7: "6",
    Image9: "10",
    Image11: "18",
    Image13: "14",
    Image15: "16",
    Image17: "8",
    Image19: "12",
  };

  const toggle = document.getElementById("darkModeToggle");

  // Load saved preference
  if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark-mode");
      toggle.checked = true;
  }
  
  // Listen for toggle switch changes
  toggle.addEventListener("change", () => {
      if (toggle.checked) {
          document.body.classList.add("dark-mode");
          localStorage.setItem("darkMode", "enabled");
      } else {
          document.body.classList.remove("dark-mode");
          localStorage.setItem("darkMode", "disabled");
      }
  });



  const container = document.getElementById("container");
  //const img =document.getElementById('Image1');
  const draggableImages = document.querySelectorAll("img");
  const squares = document.querySelectorAll(".square");

  let isDragging = false;
  let offsetX, offsetY;
  let currentImage = null;
  let originColumn = null;

  draggableImages.forEach((img) => {
    img.addEventListener("mousedown", (e) => {
        isDragging = true;
        currentImage = e.target;

        const rect = image.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        img.style.position = "absolute";
        //img.style.cursor = 'grabbing'
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        //e.preventDefault();
    });
  });





  function onMouseMove(e) {
      if (!isDragging) return;
          
      // Update image position based on mouse movement
      const containerRect = container.getBoundingClientRect();
      const x = e.clientX - offsetX - containerRect.left;
      const y = e.clientY - offsetY - containerRect.top;

    // Restrict movement within the container
      x = Math.max(0, Math.min(containerRect.width - image.offsetWidth, x));
      y = Math.max(0, Math.min(containerRect.height - image.offsetHeight, y));

      image.style.left = x + "px";
      image.style.top = y + "px";
      //img.style.top = `${e.clientY - offsetY}px`;
      //img.style.left = `${e.clientX - offsetX}px`;

      img.style.cursor = 'grabbing';
  
  }

  // Mouse up: Stop dragging
  function onMouseUp() {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      img.style.cursor = 'grab';
      currentImage = null;
  }
  draggableImages.forEach((img) => {
  img.addEventListener("dragstart", (e) => {
    currentImage = e.target;
    const parentSquare = img.parentElement;
    if (document.getElementById("leftColumn").contains(parentSquare)) {
      originColumn = "left";
    } else if (document.getElementById("rightColumn").contains(parentSquare)) {
      originColumn = "right";
    }
    e.dataTransfer.setData("text/plain", e.target.id); // Pass image ID in the drag data
  });
});


  container.addEventListener("dragover", (e) => {
      e.preventDefault(); // Allow drop within the container
    });
  squares.forEach((square) => {
      square.addEventListener("dragover", (e) => {
        e.preventDefault(); // Allow drop
        square.classList.add("highlight");
  });
  square.addEventListener("dragleave", () => {
      square.classList.remove("highlight");
    });
  square.addEventListener("drop", (e) => {
      e.preventDefault();
      square.classList.remove("highlight");
      const draggedImageId = e.dataTransfer.getData("text/plain");
      const draggedImage = document.getElementById(draggedImageId);

      if (draggedImage) {
        console.log(`Dragging image ${draggedImage.id}, original square: ${draggedImage.originalSquare}`);
        // Move the image to the new square
        square.appendChild(draggedImage);

        // Reset position for free movement
        draggedImage.style.left = "0px";
        draggedImage.style.top = "0px";

      }
    });
  });

  function validateDrop(targetSquare, draggedImageId) {
    // Validate drop based on originColumn and targetSquare's column
    if (originColumn === "left" && document.getElementById("rightColumn").contains(targetSquare)) {
      const correctSquareId = answerKey[draggedImageId];
      console.log(answerKey[draggedImageId]);
      return targetSquare.id === correctSquareId;
    }
    /*if (originColumn === "right" && document.getElementById("leftColumn").contains(targetSquare)) {
      return true; 
    } */
    return false; // Invalid drop otherwise
  }
  function createSquares() {
      const gameboard = document.getElementById("board");
      const leftColumn = document.createElement("div");
      const rightColumn = document.createElement("div");
      leftColumn.classList.add("column");
      rightColumn.classList.add("column");
      for (let index = 0; index < 20; index ++) {
          let square = document.createElement("div");
          square.classList.add("square");
          square.setAttribute("id", index + 1);
          gameboard.appendChild(square);
          if (index % 2 === 0) {
            leftColumn.appendChild(square);
          } else {
            rightColumn.appendChild(square);
          }
      leftColumn.setAttribute("id", "leftColumn");
      rightColumn.setAttribute("id", "rightColumn");
          
    }

    // Append columns to the gameboard
    gameboard.appendChild(leftColumn);
    gameboard.appendChild(rightColumn);
  }
  function addImageToSquares(imagesrc, squareid, alt, labelText) {
      const square = document.getElementById(squareid);
      if (!square) {
        console.error(`Square with ID ${squareid} not found.`);
        return;
    }


      var img = document.createElement('img');
      img.src = imagesrc;
      img.alt = alt;
      img.width = 60;
      img.height = 60;
      img.id = "Image" + squareid;
      //img.style.objectFit = 'cover';
      img.draggable = true;
      img.originalSquare= squareid;

      const label = document.createElement("span");
      label.classList.add("image-label");
      label.textContent = labelText; // Custom text

      // Append image and text to the wrapper
      square.appendChild(img);
      square.appendChild(label);

      // Append wrapper to the square
      // square.appendChild(img);
      console.log(`Image ${img.id} added to square ${squareid}`);
  }
  function addSubmitButton() {
    const boardContainer = document.getElementById("board-container");
  
    // Create the button element
    const submitButton = document.createElement("button");
    submitButton.textContent = "CHECK ANSWERS"; // Button text
    submitButton.id = "submitButton"; // Assign an ID for styling or reference
  
    // Append the button to the board container
    boardContainer.appendChild(submitButton);
  
    // Add an event listener for the button
    submitButton.addEventListener("click", () => {
      checkAnswers();
      // Add your submit logic here
    });
  }
/*
  function checkAnswers() {
  const squares = document.querySelectorAll(".square"); // Get all squares
  const images = document.querySelectorAll("img");

  // Reset colors before applying new ones
  squares.forEach((square) => {
      square.classList.remove("correct", "close", "incorrect");
  });

  // Step 1: Show correct (green) immediately
  images.forEach((img) => {
      const parentSquare = img.parentElement;
      const correctSquareId = answerKey[img.id]; // Correct square
      const currentSquareId = parentSquare.id; // Current square
      const originalSquareId = img.originalSquare;

      if (currentSquareId === correctSquareId) {
          // Apply green immediately
          parentSquare.classList.add("correct");
      }
  });

  // Step 2: After 1 second, fade out green and show yellow (close answers)
  setTimeout(() => {
      images.forEach((img) => {
          const parentSquare = img.parentElement;
          const correctSquareId = parseInt(answerKey[img.id]);
          const currentSquareId = parseInt(parentSquare.id);
          const originalSquareId = img.originalSquare;
          if (Math.abs(currentSquareId - correctSquareId) === 2) {
              // Remove green and apply yellow (close)
              parentSquare.classList.remove("correct");
              parentSquare.classList.add("close");
              setTimeout(() => {
              const originalSquare = document.getElementById(originalSquareId);
              if (originalSquare) {
                originalSquare.appendChild(img);
                parentSquare.classList.remove("close");
              // Reset position
                img.style.left = "0px";
                img.style.top = "0px";
              }
            }, 1000);
          }
      });
  }, 1000); // 1-second delay

  // Step 3: After 2 seconds, fade out yellow and show red (incorrect answers)
  setTimeout(() => {
      images.forEach((img) => {
          const parentSquare = img.parentElement;
          const correctSquareId = parseInt(answerKey[img.id]);
          const currentSquareId = parseInt(parentSquare.id);
          const originalSquareId = img.originalSquare;

          if (currentSquareId !== correctSquareId && Math.abs(currentSquareId - correctSquareId) > 2) {
              // Remove yellow and apply red (incorrect answers)

              parentSquare.classList.add("incorrect");

              // Move the image back to its original square
              setTimeout(() => {
                const originalSquare = document.getElementById(originalSquareId);
                if (originalSquare) {
                  originalSquare.appendChild(img);
                  parentSquare.classList.remove("incorrect");
                // Reset position
                  img.style.left = "0px";
                  img.style.top = "0px";
                }
              }, 1000);
          }
      });
  }, 2000); // 2-second delay
}
*/
function checkAnswers() {
  const rightColumn = document.getElementById("rightColumn");
  const squares = Array.from(rightColumn.querySelectorAll(".square"));

  // Clear all previous colors first
  document.querySelectorAll(".square").forEach(square => {
      square.classList.remove("correct", "close", "incorrect");
  });

  // Loop through each right column square and reveal one-by-one
  squares.forEach((square, index) => {
      setTimeout(() => {
          const img = square.querySelector("img");

          // If no image, skip
          if (!img) return;

          const imgId = img.id;
          const correctSquareId = parseInt(answerKey[imgId]);
          const currentSquareId = parseInt(square.id);
          const originalSquareId = img.originalSquare;

          // Check placement
          if (currentSquareId === correctSquareId) {
              square.classList.add("correct");
          } else if (Math.abs(currentSquareId - correctSquareId) === 2) {
              square.classList.add("close");
              // Move back to original
              const originalSquare = document.getElementById(originalSquareId);
              if (originalSquare) {
                  originalSquare.appendChild(img);
                  img.style.left = "0px";
                  img.style.top = "0px";
              }
          } else {
              square.classList.add("incorrect");

              // Move back to original
              const originalSquare = document.getElementById(originalSquareId);
              if (originalSquare) {
                  originalSquare.appendChild(img);
                  img.style.left = "0px";
                  img.style.top = "0px";
              }
          }
      }, index * 1200); // Delay each square by 400ms (adjust as needed)
  });
}

// Sidebar Menu Toggle
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sidebarMenu").classList.toggle("open");
});

// Page Click Handler
document.querySelectorAll("#sidebarMenu li").forEach(item => {
  item.addEventListener("click", () => {
      const page = item.dataset.page;
      loadPage(page);
      document.getElementById("sidebarMenu").classList.remove("open");
  });
});

// Load Page Content
function loadPage(page) {
    const game = document.getElementById("game");
    const pageContent = document.getElementById("pageContent");

    // Hide game, show content container
    game.style.display = "none";
    pageContent.style.display = "block";

    // Clear previous content safely
    pageContent.innerHTML = "";

    // Create and append close button
    const closeButton = document.createElement("button");
    closeButton.id = "closePageBtn";
    closeButton.textContent = "← Back to Game";
    closeButton.addEventListener("click", closePage);
    pageContent.appendChild(closeButton);

    // Create content wrapper
    const contentWrapper = document.createElement("div");

    // Add actual page content
  switch (page) {
      case "tipsandtricks":
          contentWrapper.innerHTML = "<h2>About</h2><p>There are precisely 3,628,800 possible ways to orient every Daily Top10. In order to win, you must place the 10 items in the same order as the expert list/community consensus list. <br> Whether you’re a first-timer or a seasoned veteran of Top10, these tips can help you strategize how to best tackle the Daily Top10 and hopefully be able to show off our incoming victory’s to your friends!<br>How to Play Top10<br>1. Click this Link.<br>2. You have 3 attempts to correctly guess the Daily Top10 list.<br>3. Select your guesses and submit your attempt by hitting the “Check” key on the Top10 board.<br>4. The color of the boxes will change after you submit each attempt. The green box indicates that you selected the right item in the correct spot. A yellow box indicates that the item you selected is one spot away from being correct. The red box indicates that the item you selected is not in the correct spot.<br>5. Continue until you solve the Top10, or run out of guesses.<br>6. If you match the Daily Top10 correctly, share that sucker on social media, with your friends in group texts, or anywhere else you want to brag. Click “Share” after your game ends and show off those green boxes (Don’t worry, they’re spoiler free).</p>";
          break;
      case "howtoplay":
          contentWrapper.innerHTML = "<h2>Instructions</h2><p>Guess the Daily Top10 in 3 tries <br> The color of the boxes will change to indicate how close your guess was to the correct placement<br>Examples:<br>Ranch<br>Ranch is in the correct place<br>Ketchup<br>Ketchup is 1 spot from its correct place<br>Mustard<br>Mustard is not in its correct place</p>";
          break;
      case "credits":
          contentWrapper.innerHTML = "<h2>Credits</h2><p>Created by [Your Name]. All rights reserved.</p>";
          break;
  }
  pageContent.appendChild(contentWrapper);
  //pageContent.innerHTML = `${closeButton}${content}`;

  //document.getElementById("closePageBtn").addEventListener("click", closePage);
  
}

// Optional: Escape Page
function closePage() {
  document.getElementById("game").style.display = "block";
  document.getElementById("pageContent").style.display = "none";
}


  /*
  function moveOnClick(img, squareid) {
      const square = document.getElementById(squareid);
      square.appendChild(img);
  }
      */
});