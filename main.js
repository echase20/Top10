document.addEventListener("DOMContentLoaded", () => {
    createSquares();
    addImageToSquares('images/pizza.jpg', "1", 'Pizza');
    addImageToSquares('images/burger.jpg', '3', 'Burger');
    addSubmitButton();
    addDarkModeButton();
    const answerKey = {
      Image1: "2",
      Image3: "4",
    };

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
    function addImageToSquares(imagesrc, squareid, alt) {
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
        square.appendChild(img);
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
 
    function checkAnswers() {
      const squares = document.querySelectorAll(".square"); // Get all squares

      // Step 1: Reset all squares' colors before checking
      squares.forEach((square) => {
          square.classList.remove("correct", "close", "incorrect");
      });
      const images = document.querySelectorAll("img");

      images.forEach((img) => {

          const parentSquare = img.parentElement;
          const correctSquareId = answerKey[img.id];
          const originalSquareId = img.originalSquare;
          console.log(`Image ${img.id}: Current square ${parentSquare.id}, Original square ${originalSquareId}, Correct square ${correctSquareId}`)
          parentSquare.classList.remove("correct", "close", "incorrect");
          if (parentSquare.id !==  correctSquareId) {
              const difference = Number(parentSquare.id) - Number(correctSquareId);
              console.log(difference);
              if (Math.abs(difference) === 2) {
                parentSquare.classList.add("close");
              }
              else {
              parentSquare.classList.add("incorrect");
              }
              // Move image back to its original square
              const originalSquare = document.getElementById(originalSquareId);
              if (originalSquare) {
                originalSquare.appendChild(img);

              // Reset position
                img.style.left = "0px";
                img.style.top = "0px";
              } else {
                console.error(`Original square with ID ${originalSquareId} not found.`)
              }
          }
          else {
            parentSquare.classList.add("correct");
          }
      });

      console.log("Checked answers and moved incorrect images back.");
  }

  function addDarkModeButton() {
    const boardContainer = document.getElementById("board-container");

    // Create the button
    const darkModeButton = document.createElement("button");
    darkModeButton.id = "darkModeToggle";
    darkModeButton.textContent = "Toggle Dark Mode";

    // Append the button to the board container
    boardContainer.appendChild(darkModeButton);

    // Add click event to toggle dark mode
    darkModeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        // Save the user's preference in localStorage
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", "disabled");
        }
    });

    // Load Dark Mode preference from localStorage
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }
  }

    /*
    function moveOnClick(img, squareid) {
        const square = document.getElementById(squareid);
        square.appendChild(img);
    }
        */
});